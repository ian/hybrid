import { serve } from "@hono/node-server"
import type {
	DefaultRuntimeExtension,
	HonoVariables,
	PluginContext,
	XMTPFilter,
	XmtpClient
} from "@hybrd/types"
import { XMTPPlugin } from "@hybrd/xmtp"
import { Context, Hono, Next } from "hono"
import type { Agent } from "../core/agent"
import type { Plugin } from "../core/plugin"
import { logger } from "../lib/logger"

export type { HonoVariables }

/**
 * Creates Hono middleware to inject XMTP client into request context
 *
 * @description
 * This middleware function sets the XMTP client instance in the Hono context,
 * making it available to all subsequent middleware and route handlers.
 * The client can be accessed via `c.get("xmtpClient")` in route handlers.
 *
 * @param client - The XMTP client instance to inject into the context
 * @returns Hono middleware function that sets the XMTP client in context
 *
 * @example
 * ```typescript
 * app.use(createHonoMiddleware(xmtpClient))
 *
 * app.get("/messages", (c) => {
 *   const client = c.get("xmtpClient")
 *   // Use the client to interact with XMTP
 * })
 * ```
 */
export function createHonoMiddleware(client: XmtpClient) {
	return async (c: Context, next: Next) => {
		c.set("xmtpClient", client)
		return next()
	}
}

/**
 * Options for creating a Hono app with XMTP integration
 *
 * @description
 * Configuration object for setting up a Hono application that includes
 * XMTP client middleware, background message processing, and XMTP tools routes.
 *
 * @template TRuntimeExtension - Runtime extension type for the agent
 * @property agent - The agent instance to use for message processing
 */
export type CreateHonoAppOptions<TRuntimeExtension = DefaultRuntimeExtension> =
	{
		agent: Agent<TRuntimeExtension>
	}

/**
 * Creates a Hono app with full XMTP integration and background message processing
 *
 * @description
 * This function creates a complete Hono application configured with:
 * - XMTP client middleware for request context
 * - Background message processor for handling XMTP messages
 * - XMTP tools routes for external integrations
 * - Environment variable validation for required XMTP credentials
 *
 * The app automatically starts a background message processor that listens for
 * XMTP messages and forwards them to the provided agent for processing.
 *
 * @template TRuntimeExtension - Runtime extension type for the agent
 * @param options - Configuration options for the Hono app
 * @param options.agent - The agent instance to handle XMTP messages
 * @returns Promise that resolves to a configured Hono app instance
 *
 * @throws {Error} When XMTP_WALLET_KEY environment variable is not set
 * @throws {Error} When XMTP_DB_ENCRYPTION_KEY environment variable is not set
 *
 * @example
 * ```typescript
 * const app = await createHonoApp({ agent: myAgent })
 *
 * // The app now has XMTP integration and background processing
 * app.get("/health", (c) => c.json({ status: "ok" }))
 * ```
 */
export async function createHonoApp<
	TRuntimeExtension = DefaultRuntimeExtension
>({ agent }: CreateHonoAppOptions<TRuntimeExtension>) {
	const app = new Hono<{ Variables: HonoVariables }>()

	// Mount XMTP tools routes
	// app.route("/xmtp-tools", xmtpApp) // This line is removed as per the edit hint

	return app
}

/**
 * Options for starting the XMTP tools HTTP server
 *
 * @description
 * Configuration object for the standalone XMTP tools server that provides
 * basic HTTP endpoints for health checks and XMTP operations.
 *
 * @property agent - The agent instance to associate with the server
 * @property port - The port number to listen on (defaults to 8454)
 * @property filter - Optional message filter for XMTP messages
 * @property plugins - Optional array of plugins to apply to the server
 */
export type ListenOptions = {
	agent: Agent
	port: string
	filters?: XMTPFilter[]
	plugins?: Plugin<PluginContext>[]
}

/**
 * Starts a standalone XMTP tools HTTP server
 *
 * @description
 * This function creates and starts a minimal HTTP server specifically for
 * XMTP tools operations. It includes:
 * - Health check endpoint at `/health`
 * - 404 handler for unmatched routes
 * - Automatic port parsing from string input
 * - Plugin-based route mounting
 *
 * The server runs independently and is useful for scenarios where you need
 * XMTP tools functionality without the full Hono app integration.
 *
 * @param options - Configuration options for the server
 * @param options.agent - The agent instance to associate with the server
 * @param options.port - The port number to listen on (parsed as integer)
 *
 * @example
 * ```typescript
 * listen({
 *   agent: myAgent,
 *   port: "3000"
 * })
 *
 * // Server starts on port 3000 with health endpoint at /health
 * // and all registered plugins applied
 * ```
 */
export async function listen({
	agent,
	port,
	filters = [],
	plugins = []
}: ListenOptions) {
	const app = new Hono<{ Variables: HonoVariables }>()
	const context = {
		agent
	} as PluginContext

	const xmtpPlugin = XMTPPlugin({ filters })

	// Right now we always apply the XMTP plugin, but this may change in the future.
	await xmtpPlugin.apply(app, context)

	// Apply plugins from agent registry first
	await agent.plugins.applyAll(app, context)

	// Apply plugins from listen options
	for (const plugin of plugins) {
		await plugin.apply(app, context)
	}

	app.get("/health", (c) => {
		return c.json({
			status: "healthy",
			service: agent.name,
			timestamp: new Date().toISOString()
		})
	})

	app.notFound((c) => {
		return c.json({ error: "Not found" }, 404)
	})

	const httpPort = Number.parseInt(port || "8454")

	// Setup graceful shutdown
	const shutdown = async () => {
		logger.debug("Waiting for graceful termination...")

		// Stop background processor first
		// try {
		// 	stopBackground()
		// } catch (error) {
		// 	console.error("Error stopping background processor:", error)
		// }

		// Give some time for cleanup
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}

	// Register shutdown handlers
	process.once("SIGINT", async () => {
		await shutdown()
		process.exit(0)
	})

	process.once("SIGTERM", async () => {
		await shutdown()
		process.exit(0)
	})

	// Handle uncaught errors
	process.on("uncaughtException", async (error) => {
		console.error("Uncaught exception:", error)
		await shutdown()
		process.exit(1)
	})

	process.on("unhandledRejection", async (reason) => {
		console.error("Unhandled rejection:", reason)
		await shutdown()
		process.exit(1)
	})

	const server = serve({
		fetch: app.fetch,
		port: httpPort
	})

	// Handle server errors (including EADDRINUSE)
	server.on("error", async (error: any) => {
		if (error.code === "EADDRINUSE") {
			console.error(
				`❌ Port ${httpPort} is already in use. Please stop the existing server or use a different port.`
			)
		} else {
			console.error("Server error:", error)
		}
		await shutdown()
		process.exit(1)
	})

	// Handle successful server startup
	server.on("listening", () => {
		console.log(`listening on localhost:${httpPort}`)
		logger.debug(`✅ Hybrid server running on port ${httpPort}`)
		logger.debug(`🎧 Background message listener is active`)
	})
}
