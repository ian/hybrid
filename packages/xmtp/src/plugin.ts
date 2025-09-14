// import xmtpEndpoints from "./endpoints"
import { Agent, createSigner, createUser, getTestUrl } from "@xmtp/agent-sdk"
import { Hono } from "hono"

import type { HonoVariables } from "./types"

export interface Plugin<TContext = unknown> {
	name: string
	description?: string
	apply: (
		app: Hono<{ Variables: HonoVariables }>,
		context?: TContext
	) => void | Promise<void>
}

export interface XMTPPluginContext {
	agent: unknown
}

/**
 * XMTP Plugin that provides XMTP functionality to the agent
 *
 * @description
 * This plugin integrates XMTP messaging capabilities into the agent's
 * HTTP server. It mounts the XMTP endpoints for handling XMTP tools requests.
 */
export function XMTPPlugin({
	// filter
	foo
}: {
	// filter?: MessageListenerConfig["filter"]
	foo?: string
} = {}): Plugin<XMTPPluginContext> {
	return {
		name: "xmtp",
		description: "Provides XMTP messaging functionality",
		apply: async (app, context) => {
			// Initialize XMTP client and start background message processor
			const { XMTP_WALLET_KEY, XMTP_ENCRYPTION_KEY } = process.env

			if (!XMTP_WALLET_KEY) {
				throw new Error("XMTP_WALLET_KEY must be set")
			}

			if (!XMTP_ENCRYPTION_KEY) {
				throw new Error("XMTP_ENCRYPTION_KEY must be set")
			}

			// Mount the XMTP endpoints at /xmtp-tools
			// app.route("/xmtp-tools", xmtpEndpoints)

			// 1. Create a local user + signer (you can plug in your own wallet signer)
			const user = createUser()
			const signer = createSigner(user)

			// 2. Spin up the agent
			const agent = await Agent.create(signer, {
				env: "dev", // or 'production'
				dbPath: null // in-memory store; provide a path to persist
			})

			// 3. Respond to text messages
			agent.on("text", async (ctx) => {
				await ctx.conversation.send("Hello from my XMTP Agent! 👋")
			})

			// 4. Log when we're ready
			agent.on("start", () => {
				console.log(`We are online: ${getTestUrl(agent)}`)
			})

			await agent.start()
		}
	}
}
