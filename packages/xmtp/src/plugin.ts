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
import { createXMTPClient, getDbPath } from "./client"

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

			// Print chat URL and identity early
			try {
				const addrFromClient =
					xmtpClient.accountIdentifier?.identifier || user.account.address
				console.log(`🔐 XMTP inbox: ${xmtpClient.inboxId}`)
				console.log(
					`We are online: http://xmtp.chat/dm/${addrFromClient}?env=${XMTP_ENV}`
				)
				const convos = await xmtpClient.conversations.list()
				console.log(`📬 Existing conversations: ${convos.length}`)
			} catch {}

			// Start a reliable node client stream to process incoming messages
			async function startNodeStream() {
				try {
					console.log("🎧 XMTP node client stream initializing")
					const stream = await xmtpClient.conversations.streamAllMessages()
					console.log("🎧 XMTP node client stream started")
					for await (const msg of stream) {
						try {
							if (msg.senderInboxId === xmtpClient.inboxId) continue

							const content =
								typeof msg.content === "string"
									? msg.content
									: (() => {
											try {
												return JSON.stringify(msg.content)
											} catch {
												return String(msg.content)
											}
										})()

							const messages: AgentMessage[] = [
								{
									id: randomUUID(),
									role: "user",
									parts: [{ type: "text", text: content }]
								}
							]

							const conversation =
								await xmtpClient.conversations.getConversationById(
									msg.conversationId
								)

							if (!conversation) {
								console.warn(
									`⚠️ XMTP conversation not found: ${msg.conversationId}`
								)
								continue
							}

							const baseRuntime: AgentRuntime = {
								conversation: conversation as XmtpConversation,
								message: msg,
								xmtpClient
							}

							const runtime = await agent.createRuntimeContext(baseRuntime)
							const { text } = await agent.generate(messages, { runtime })
							await conversation.send(text)
						} catch (err) {
							console.error("❌ Error processing XMTP message:", err)
						}
					}
				} catch (err) {
					console.error("❌ XMTP node client stream failed:", err)
				}
			}

			void startNodeStream()

			const address = user.account.address.toLowerCase()
			const agentDbPath = await getDbPath(
				`agent-${XMTP_ENV || "dev"}-${address}`
			)
			console.log(`📁 Using agent listener database path: ${agentDbPath}`)

			const xmtp = await XmtpAgent.create(signer, {
				env: XMTP_ENV as XmtpEnv,
				dbPath: agentDbPath
			})

			xmtp.on("text", async ({ conversation, message }) => {
				try {
					console.log("Text message received", message)

					const messages: AgentMessage[] = [
						{
							id: randomUUID(),
							role: "user",
							parts: [{ type: "text", text: message.content }]
						}
					]

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
				} catch (err) {
					console.error("❌ Error handling text message:", err)
				}
			})

			xmtp.on("group", async (ctx) => {
				console.log("Group message received", ctx)
				await ctx.conversation.send("Hello from my XMTP Agent! 👋")
			})

			xmtp.on("start", () => {
				console.log(`We are online: ${getTestUrl(xmtp)}`)
			})

			void xmtp
				.start()
				.then(() => console.log("✅ XMTP agent listener started"))
				.catch((err) =>
					console.error("❌ XMTP agent listener failed to start:", err)
				)
		}
	}
}
