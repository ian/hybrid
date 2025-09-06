import { MessageListenerConfig } from "@hybrd/xmtp"
import type { Agent, DefaultRuntimeExtension } from "../core/agent"
import type { Plugin } from "../core/plugin"
import { createHonoApp } from "../server/listen"

/**
 * Context for the XMTP plugin
 */
export interface XMTPPluginContext {
	agent: Agent<DefaultRuntimeExtension>
}

/**
 * XMTP Plugin that provides XMTP functionality to the agent
 *
 * @description
 * This plugin integrates XMTP messaging capabilities into the agent's
 * HTTP server. It creates a Hono app with XMTP client middleware,
 * background message processing, and XMTP tools routes.
 *
 * Note: This plugin requires the agent to be configured with XMTP
 * environment variables and the listen method to be called with a filter.
 */
export function XMTPPlugin({
	filter
}: {
	filter: MessageListenerConfig["filter"]
}): Plugin<XMTPPluginContext> {
	return {
		name: "xmtp",
		description: "Provides XMTP messaging functionality",
		apply: async (app, context) => {
			if (!context) {
				throw new Error("XMTP plugin requires context with agent")
			}

			const { agent } = context

			// Create the XMTP Hono app with a default filter that accepts all messages
			// The actual filter will be applied when the listen method is called
			const xmtpApp = await createHonoApp({
				agent,
				messageFilter: filter
			})

			// Mount the XMTP app at the root
			app.route("/", xmtpApp)
		}
	}
}
