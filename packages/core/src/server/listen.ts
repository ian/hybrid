import { serve } from "@hono/node-server"
import { getCloudflareStoragePath } from "@hybrd/utils"
import type { MessageListenerConfig, XmtpClient } from "@hybrd/xmtp"
import { type HonoVariables, createXMTPClient } from "@hybrd/xmtp"
import { Context, Hono, Next } from "hono"
import type { Agent, DefaultRuntimeExtension } from "../core/agent"
import type { Plugin } from "../core/plugin"
import { XMTPPlugin } from "../xmtp/plugin"
import {
	createBackgroundMessageProcessor,
	getBgState,
	stopBackground
} from "./processor"

export type { HonoVariables } from "@hybrd/xmtp"

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
		messageFilter: MessageListenerConfig["filter"]
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
 * @throws {Error} When XMTP_ENCRYPTION_KEY environment variable is not set
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
>({ agent, messageFilter }: CreateHonoAppOptions<TRuntimeExtension>) {
	const app = new Hono<{ Variables: HonoVariables }>()

	const { XMTP_WALLET_KEY, XMTP_ENCRYPTION_KEY, XMTP_ENV } = process.env

	if (!XMTP_WALLET_KEY) {
		throw new Error("XMTP_WALLET_KEY must be set")
	}

	if (!XMTP_ENCRYPTION_KEY) {
		throw new Error("XMTP_ENCRYPTION_KEY must be set")
	}

	// Create xmtpClient with persistent storage for reliable message streaming
	const cloudflareStoragePath = getCloudflareStoragePath("xmtp")
	const xmtpClient = await createXMTPClient(XMTP_WALLET_KEY as string, {
		persist: true,
		storagePath: cloudflareStoragePath
	})

	// Apply middleware for XMTP client
	app.use(createHonoMiddleware(xmtpClient))

	// Start the background message processor
	app.use(
		createBackgroundMessageProcessor({
			agent,
			xmtpClient,
			messageFilter, // Accept all messages by default
			intervalMs: 5_000, // Check every 5 seconds
			backoffMs: 1_000, // Start with 1 second backoff
			maxBackoffMs: 30_000 // Max 30 seconds backoff
		})
	)

	// Mount XMTP tools routes
	// app.route("/xmtp-tools", xmtpApp) // This line is removed as per the edit hint

	return app
}

/**
 * Context type for plugins that need agent information
 */
export interface PluginContext {
	agent: Agent<DefaultRuntimeExtension>
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
	filter?: MessageListenerConfig["filter"]
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
	filter,
	plugins = []
}: ListenOptions) {
	const app = new Hono<{ Variables: HonoVariables }>()
	const context: PluginContext = {
		agent
	}

	const xmtpPlugin = XMTPPlugin({
		filter
	})

	// Right now we always apply the XMTP plugin, but this may change in the future.
	await xmtpPlugin.apply(app, context)

	// Apply plugins from agent registry first
	await agent.plugins.applyAll(app, context)

	// Apply plugins from listen options
	for (const plugin of plugins) {
		try {
			console.log(`🔌 Applying plugin: ${plugin.name}`)
			await plugin.apply(app, context)
			console.log(`✅ Plugin applied: ${plugin.name}`)
		} catch (error) {
			console.error(`❌ Failed to apply plugin ${plugin.name}:`, error)
			throw error
		}
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

	serve({
		fetch: app.fetch,
		port: Number.parseInt(port || "8454")
	})

	console.log(`✅ XMTP Tools HTTP Server running`)
}

// Re-export the background processor helpers
export { getBgState, stopBackground }
