import { Hono } from "hono"
import xmtpEndpoints from "./endpoints"
import type { MessageListenerConfig } from "./types"
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
	filter
}: {
	filter?: MessageListenerConfig["filter"]
} = {}): Plugin<XMTPPluginContext> {
	return {
		name: "xmtp",
		description: "Provides XMTP messaging functionality",
		apply: (app, context) => {
			// Mount the XMTP endpoints at /xmtp-tools
			app.route("/xmtp-tools", xmtpEndpoints)
		}
	}
}
