import {
	Agent as XmtpAgent,
	XmtpEnv,
	createSigner,
	createUser,
	getTestUrl
} from "@xmtp/agent-sdk"

import type {
	AgentMessage,
	AgentRuntime,
	Plugin,
	PluginContext,
	XmtpConversation
} from "@hybrd/types"
import { randomUUID } from "node:crypto"
import { createXMTPClient } from "./client"

// Re-export types from @hybrd/types for backward compatibility
export type { Plugin }

/**
 * XMTP Plugin that provides XMTP functionality to the agent
 *
 * @description
 * This plugin integrates XMTP messaging capabilities into the agent's
 * HTTP server. It mounts the XMTP endpoints for handling XMTP tools requests.
 */
export function XMTPPlugin(): Plugin<PluginContext> {
	return {
		name: "xmtp",
		description: "Provides XMTP messaging functionality",
		apply: async (app, context) => {
			const {
				XMTP_WALLET_KEY,
				XMTP_DB_ENCRYPTION_KEY,
				XMTP_ENV = "production"
			} = process.env

			const { agent } = context

			if (!XMTP_WALLET_KEY) {
				throw new Error("XMTP_WALLET_KEY must be set")
			}

			if (!XMTP_DB_ENCRYPTION_KEY) {
				throw new Error("XMTP_DB_ENCRYPTION_KEY must be set")
			}

			const user = createUser(XMTP_WALLET_KEY as `0x${string}`)
			const signer = createSigner(user)

			const xmtpClient = await createXMTPClient(
				XMTP_WALLET_KEY as `0x${string}`
			)

			const xmtp = await XmtpAgent.create(signer, {
				env: XMTP_ENV as XmtpEnv,
				dbPath: null // in-memory store; provide a path to persist
			})

			xmtp.on("text", async ({ conversation, message }) => {
				console.log("Text message received", message)

				const messages: AgentMessage[] = [
					{
						id: randomUUID(),
						role: "user",
						parts: [{ type: "text", text: message.content }]
					}
				]

				// const sender = await this.resolver.createXmtpSender(
				// 	message.senderInboxId,
				// 	message.conversationId
				// )

				const baseRuntime: AgentRuntime = {
					conversation: conversation as XmtpConversation,
					message: message,
					xmtpClient
				}

				const runtime = await agent.createRuntimeContext(baseRuntime)

				const { text } = await agent.generate(messages, {
					runtime
				})

				await conversation.send(text)
			})

			xmtp.on("group", async (ctx) => {
				console.log("Group message received", ctx)
				await ctx.conversation.send("Hello from my XMTP Agent! 👋")
			})

			xmtp.on("start", () => {
				console.log(`We are online: ${getTestUrl(xmtp)}`)
			})

			await xmtp.start()
		}
	}
}
