import {
	Agent as XmtpAgent,
	XmtpEnv,
	createSigner,
	createUser
} from "@xmtp/agent-sdk"

import type {
	AgentMessage,
	AgentRuntime,
	BehaviorContext,
	BehaviorRegistry,
	Plugin,
	PluginContext,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { randomUUID } from "node:crypto"
import { createXMTPClient, getDbPath } from "./client"
import { ContentTypeReply, ContentTypeText, type Reply } from "./index"

// Re-export types from @hybrd/types for backward compatibility
export type { Plugin }

/**
 * Send a response with threading support
 */
async function sendResponse(
	conversation: XmtpConversation,
	text: string,
	originalMessageId: string,
	behaviorContext?: BehaviorContext
) {
	const shouldThread = behaviorContext?.sendOptions?.threaded ?? false

	if (shouldThread) {
		// Send as a reply to the original message
		try {
			const reply: Reply = {
				reference: originalMessageId,
				contentType: ContentTypeText,
				content: text
			}
			await conversation.send(reply, ContentTypeReply)
			logger.debug(
				`✅ [sendResponse] Threaded reply sent successfully to message ${originalMessageId}`
			)
		} catch (error) {
			logger.error(
				`❌ [sendResponse] Failed to send threaded reply to message ${originalMessageId}:`,
				error
			)
			// Fall back to regular message if threaded reply fails
			logger.debug(`🔄 [sendResponse] Falling back to regular message`)
			await conversation.send(text)
		}
	} else {
		// Send as a regular message
		await conversation.send(text)
	}
}

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
		apply: async (app, context): Promise<void> => {
			const {
				XMTP_WALLET_KEY,
				XMTP_DB_ENCRYPTION_KEY,
				XMTP_ENV = "production"
			} = process.env

			const { agent } = context
			const pluginContext = context as PluginContext & {
				behaviors?: BehaviorRegistry
			}

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

							const messages: AgentMessage[] = [
								{
									id: randomUUID(),
									role: "user",
									parts: [{ type: "text", text: content }]
								}
							]

							const baseRuntime: AgentRuntime = {
								conversation: conversation as unknown as XmtpConversation,
								message: msg,
								xmtpClient
							}

							const runtime = await agent.createRuntimeContext(baseRuntime)

							// Execute pre-response behaviors
							if (pluginContext.behaviors) {
								const behaviorContext: BehaviorContext = {
									runtime,
									client: xmtpClient as unknown as XmtpClient,
									conversation: conversation as unknown as XmtpConversation,
									message: msg as XmtpMessage
								}
								await pluginContext.behaviors.executeBefore(behaviorContext)

								// Check if message was filtered out by any behavior
								if (behaviorContext.sendOptions?.filtered) {
									continue // Skip processing this message
								}
							}

							const { text } = await agent.generate(messages, { runtime })

							// Create behavior context for send options
							const behaviorContext: BehaviorContext = {
								runtime,
								client: xmtpClient as unknown as XmtpClient,
								conversation: conversation as unknown as XmtpConversation,
								message: msg as XmtpMessage,
								response: text
							}

							// Execute post-response behaviors
							if (pluginContext.behaviors) {
								await pluginContext.behaviors.executeAfter(behaviorContext)
							}

							// Check if message was filtered out by filterMessages behavior
							if (behaviorContext?.sendOptions?.filtered) {
								logger.debug(
									`🔇 [XMTP Plugin] Skipping response due to message being filtered`
								)
								return
							}

							// Send the response with threading support
							await sendResponse(conversation, text, msg.id, behaviorContext)
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
					const text = message.content.content
					const messages: AgentMessage[] = [
						{
							id: randomUUID(),
							role: "user",
							parts: [{ type: "text", text }]
						}
					]

					const baseRuntime: AgentRuntime = {
						conversation: conversation as unknown as XmtpConversation,
						message: message as unknown as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)

					// Execute pre-response behaviors
					if (context.behaviors) {
						const behaviorContext: BehaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage
						}
						await context.behaviors.executeBefore(behaviorContext)
					}

					const { text: reply } = await agent.generate(messages, { runtime })

					// Execute post-response behaviors
					let behaviorContext: BehaviorContext | undefined
					if (context.behaviors) {
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage,
							response: reply
						}
						await context.behaviors.executeAfter(behaviorContext)
					} else {
						// Create minimal context for send options
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage,
							response: reply
						}
					}

					// Check if message was filtered out by filterMessages behavior
					if (behaviorContext?.sendOptions?.filtered) {
						logger.debug(
							`🔇 [XMTP Plugin] Skipping reaction response due to message being filtered`
						)
						return
					}

					await sendResponse(
						conversation as unknown as XmtpConversation,
						reply,
						message.id,
						behaviorContext
					)
				} catch (err) {
					logger.error("❌ Error handling reaction:", err)
				}
			})

			xmtp.on("reply", async ({ conversation, message }) => {
				try {
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
						conversation: conversation as unknown as XmtpConversation,
						message: message as unknown as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)

					// Execute pre-response behaviors
					let behaviorContext: BehaviorContext | undefined
					if (context.behaviors) {
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage
						}
						await context.behaviors.executeBefore(behaviorContext)

						// Check if behaviors were stopped early (e.g., due to filtering)
						if (behaviorContext.stopped) {
							logger.debug(
								`🔇 [XMTP Plugin] Skipping reply response due to behavior chain being stopped`
							)
							return
						}
					}

					const { text: reply } = await agent.generate(messages, { runtime })

					// Execute post-response behaviors
					if (context.behaviors) {
						if (!behaviorContext) {
							behaviorContext = {
								runtime,
								client: xmtpClient as unknown as XmtpClient,
								conversation: conversation as unknown as XmtpConversation,
								message: message as unknown as XmtpMessage,
								response: reply
							}
						} else {
							behaviorContext.response = reply
						}
						await context.behaviors.executeAfter(behaviorContext)

						// Check if post behaviors were stopped early
						if (behaviorContext.stopped) {
							logger.debug(
								`🔇 [XMTP Plugin] Skipping reply response due to post-behavior chain being stopped`
							)
							return
						}
					} else {
						// Create minimal context for send options
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage,
							response: reply
						}
					}

					await sendResponse(
						conversation as unknown as XmtpConversation,
						reply,
						message.id,
						behaviorContext
					)
				} catch (err) {
					logger.error("❌ Error handling reply:", err)
				}
			})

			xmtp.on("text", async ({ conversation, message }) => {
				try {
					const text = message.content
					const messages: AgentMessage[] = [
						{ id: randomUUID(), role: "user", parts: [{ type: "text", text }] }
					]

					const baseRuntime: AgentRuntime = {
						conversation: conversation as unknown as XmtpConversation,
						message: message as unknown as XmtpMessage,
						xmtpClient
					}

					const runtime = await agent.createRuntimeContext(baseRuntime)

					// Execute pre-response behaviors
					let behaviorContext: BehaviorContext | undefined
					if (context.behaviors) {
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage
						}
						await context.behaviors.executeBefore(behaviorContext)

						// Check if behaviors were stopped early (e.g., due to filtering)
						if (behaviorContext.stopped) {
							logger.debug(
								`🔇 [XMTP Plugin] Skipping text response due to behavior chain being stopped`
							)
							return
						}
					}

					const { text: reply } = await agent.generate(messages, { runtime })

					// Execute post-response behaviors
					if (context.behaviors) {
						if (!behaviorContext) {
							behaviorContext = {
								runtime,
								client: xmtpClient as unknown as XmtpClient,
								conversation: conversation as unknown as XmtpConversation,
								message: message as unknown as XmtpMessage,
								response: reply
							}
						} else {
							behaviorContext.response = reply
						}
						await context.behaviors.executeAfter(behaviorContext)

						// Check if post behaviors were stopped early
						if (behaviorContext.stopped) {
							logger.debug(
								`🔇 [XMTP Plugin] Skipping text response due to post-behavior chain being stopped`
							)
							return
						}
					} else {
						// Create minimal context for send options
						behaviorContext = {
							runtime,
							client: xmtpClient as unknown as XmtpClient,
							conversation: conversation as unknown as XmtpConversation,
							message: message as unknown as XmtpMessage,
							response: reply
						}
					}

					await sendResponse(
						conversation as unknown as XmtpConversation,
						reply,
						message.id,
						behaviorContext
					)
				} catch (err) {
					logger.error("❌ Error handling text:", err)
				}
			})

			// Event handlers removed due to incompatibility with current XMTP agent SDK

			void xmtp
				.start()
				.then(() => logger.debug("✅ XMTP agent listener started"))
				.catch((err) =>
					console.error("❌ XMTP agent listener failed to start:", err)
				)
		}
	}
}
