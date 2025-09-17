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
	XMTPFilter,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { randomUUID } from "node:crypto"
import { createXMTPClient, getDbPath } from "./client"
import { logger } from "../../core/src/lib/logger"

// Re-export types from @hybrd/types for backward compatibility
export type { Plugin }

export type XMTPPluginOptions = {
	filters?: XMTPFilter[]
}

/**
 * XMTP Plugin that provides XMTP functionality to the agent
 *
 * @description
 * This plugin integrates XMTP messaging capabilities into the agent's
 * HTTP server. It mounts the XMTP endpoints for handling XMTP tools requests.
 */
export function XMTPPlugin({
	filters = []
}: XMTPPluginOptions = {}): Plugin<PluginContext> {
	return {
		name: "xmtp",
		description: "Provides XMTP messaging functionality",
		apply: async (app, context): Promise<void> => {
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
				logger.debug(`📬 Existing conversations: ${convos.length}`)
			} catch {}

			function combineFilters(providedFilters: XMTPFilter[]) {
				return async (
					message: XmtpMessage,
					client: XmtpClient,
					conversation: XmtpConversation
				) => {
					for (const filter of providedFilters) {
						const passed = await filter(message, client, conversation)
						if (!passed) return false
					}
					return true
				}
			}

			const evaluateFilters = combineFilters(filters)

			// Start a reliable node client stream to process incoming messages
			async function startNodeStream() {
				try {
					logger.debug("🎧 XMTP node client stream initializing")
					const stream = await xmtpClient.conversations.streamAllMessages()
					logger.debug("🎧 XMTP node client stream started")
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

							const conversation =
								await xmtpClient.conversations.getConversationById(
									msg.conversationId
								)

							if (!conversation) {
								logger.warn(
									`⚠️ XMTP conversation not found: ${msg.conversationId}`
								)
								continue
							}

							// Apply filters if provided
							if (filters.length > 0) {
								try {
									const passes = await evaluateFilters(
										msg as XmtpMessage,
										xmtpClient as XmtpClient,
										conversation as XmtpConversation
									)
									if (!passes) continue
								} catch (err) {
									logger.error(
										"❌ Error evaluating filters (node stream):",
										err
									)
									continue
								}
							}

							const messages: AgentMessage[] = [
								{
									id: randomUUID(),
									role: "user",
									parts: [{ type: "text", text: content }]
								}
							]

							const baseRuntime: AgentRuntime = {
								conversation: conversation as XmtpConversation,
								message: msg,
								xmtpClient
							}

							const runtime = await agent.createRuntimeContext(baseRuntime)
							const { text } = await agent.generate(messages, { runtime })
							await conversation.send(text)
						} catch (err) {
							logger.error("❌ Error processing XMTP message:", err)
						}
					}
				} catch (err) {
					logger.error("❌ XMTP node client stream failed:", err)
				}
			}

			const enabledFromEnv = process.env.XMTP_ENABLE_NODE_STREAM
			const isNodeStreamEnabled =
				enabledFromEnv === undefined
					? true
					: !/^(false|0|off|no)$/i.test(String(enabledFromEnv))

			if (isNodeStreamEnabled) void startNodeStream()

			const address = user.account.address.toLowerCase()
			const agentDbPath = await getDbPath(
				`agent-${XMTP_ENV || "dev"}-${address}`
			)
			logger.debug(`📁 Using agent listener database path: ${agentDbPath}`)

			const xmtp = await XmtpAgent.create(signer, {
				env: XMTP_ENV as XmtpEnv,
				dbPath: agentDbPath
			})

			xmtp.on("reaction", async ({ conversation, message }) => {
				try {
					if (filters.length > 0) {
						const passes = await evaluateFilters(
							message as XmtpMessage,
							xmtpClient as XmtpClient,
							conversation as XmtpConversation
						)
						if (!passes) return
					}
					const text = message.content.content
					const messages: AgentMessage[] = [
						{
							id: randomUUID(),
							role: "user",
							parts: [{ type: "text", text }]
						}
					]

					const baseRuntime: AgentRuntime = {
						conversation: conversation as XmtpConversation,
						message: message as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)
					const { text: reply } = await agent.generate(messages, { runtime })
					await conversation.send(reply)
				} catch (err) {
					logger.error("❌ Error handling reaction:", err)
				}
			})

			xmtp.on("reply", async ({ conversation, message }) => {
				try {
					if (filters.length > 0) {
						const passes = await evaluateFilters(
							message as XmtpMessage,
							xmtpClient as XmtpClient,
							conversation as XmtpConversation
						)
						if (!passes) return
					}
					// TODO - why isn't this typed better?
					const text = message.content.content as string
					const messages: AgentMessage[] = [
						{
							id: randomUUID(),
							role: "user",
							parts: [{ type: "text", text }]
						}
					]

					const baseRuntime: AgentRuntime = {
						conversation: conversation as XmtpConversation,
						message: message as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)
					const { text: reply } = await agent.generate(messages, { runtime })
					await conversation.send(reply)
				} catch (err) {
					logger.error("❌ Error handling reply:", err)
				}
			})

			xmtp.on("text", async ({ conversation, message }) => {
				try {
					if (filters.length > 0) {
						const passes = await evaluateFilters(
							message as XmtpMessage,
							xmtpClient as XmtpClient,
							conversation as XmtpConversation
						)
						if (!passes) return
					}
					const text = message.content
					const messages: AgentMessage[] = [
						{ id: randomUUID(), role: "user", parts: [{ type: "text", text }] }
					]

					const baseRuntime: AgentRuntime = {
						conversation: conversation as XmtpConversation,
						message: message as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)
					const { text: reply } = await agent.generate(messages, { runtime })
					await conversation.send(reply)
				} catch (err) {
					logger.error("❌ Error handling text:", err)
				}
			})

			xmtp.on("dm", async ({ conversation }) => {
				await conversation.send("Welcome to our DM!")
			})

			xmtp.on("group", async ({ conversation }) => {
				logger.debug("Group invited", conversation.id)
			})

			xmtp.on("start", () => {
				logger.debug(`We are online: ${getTestUrl(xmtp)}`)
			})

			void xmtp
				.start()
				.then(() => logger.debug("✅ XMTP agent listener started"))
				.catch((err) =>
					console.error("❌ XMTP agent listener failed to start:", err)
				)
		}
	}
}
