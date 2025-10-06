import {
	Agent as XmtpAgent,
	XmtpEnv,
	createSigner,
	createUser,
	type Client,
	type DecodedMessage
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
	XmtpMessage,
	XmtpSender,
	XmtpSubjects
} from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { randomUUID } from "node:crypto"
import { createXMTPClient, getDbPath } from "./client"
import { ContentTypeReply, ContentTypeText, type Reply } from "./index"
import { AddressResolver } from "./resolver/address-resolver"
import { BasenameResolver } from "./resolver/basename-resolver"
import { ENSResolver } from "./resolver/ens-resolver"
import { extractSubjects } from "./lib/subjects"
import { createPublicClient, http } from "viem"
import { mainnet, base } from "viem/chains"

// Re-export types from @hybrd/types for backward compatibility
export type { Plugin }

// Create public clients for resolver instances (reused across messages)
const mainnetClient = createPublicClient({
	chain: mainnet,
	transport: http()
})

const baseClient = createPublicClient({
	chain: base,
	transport: http()
})

/**
 * Resolve sender information from message
 * @param message - The XMTP message
 * @param client - XMTP client instance
 * @returns XmtpSender object with address, inboxId, name, and optional basename
 */
async function resolveSender(
	message: DecodedMessage<unknown>,
	client: Client<unknown>
): Promise<XmtpSender> {
	const addressResolver = new AddressResolver(client as any)
	const basenameResolver = new BasenameResolver({
		publicClient: baseClient as any
	})

	const address = await addressResolver.resolveAddress(
		message.senderInboxId,
		""
	)

	if (!address) {
		logger.warn(
			`⚠️ Could not resolve address for inbox ${message.senderInboxId}`
		)
		return {
			address: "0x0000000000000000000000000000000000000000",
			inboxId: message.senderInboxId,
			name: "Unknown"
		}
	}

	let basename: string | undefined
	try {
		const resolvedBasename = await basenameResolver.getBasename(address as `0x${string}`)
		basename = resolvedBasename || undefined
	} catch (err) {
		logger.debug(`Could not resolve basename for ${address}`)
	}

	return {
		address,
		inboxId: message.senderInboxId,
		name: basename || address.slice(0, 8),
		basename
	}
}

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

						const basenameResolver = new BasenameResolver({
							publicClient: baseClient as any
						})
						const ensResolver = new ENSResolver({
							mainnetClient: mainnetClient as any
						})

						const sender = await resolveSender(msg as any, xmtpClient as any)
						const subjects: XmtpSubjects =
							typeof content === "string"
								? await extractSubjects(content, basenameResolver, ensResolver)
								: {}

						const baseRuntime: AgentRuntime = {
							conversation: conversation as unknown as XmtpConversation,
							message: msg,
							sender,
							subjects,
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

					const sender = await resolveSender(
						message as unknown as DecodedMessage<unknown>,
						xmtpClient as any
					)

					const baseRuntime: AgentRuntime = {
						conversation: conversation as unknown as XmtpConversation,
						message: message as unknown as XmtpMessage,
						sender,
						subjects: {},
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

				const basenameResolver = new BasenameResolver({
					publicClient: baseClient as any
				})
				const ensResolver = new ENSResolver({
					mainnetClient: mainnetClient as any
				})

				const sender = await resolveSender(
					message as unknown as DecodedMessage<unknown>,
					xmtpClient as any
				)
					const subjects = await extractSubjects(text, basenameResolver, ensResolver)

					const baseRuntime: AgentRuntime = {
						conversation: conversation as unknown as XmtpConversation,
						message: message as unknown as XmtpMessage,
						sender,
						subjects,
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

			const basenameResolver = new BasenameResolver({
				publicClient: baseClient as any
			})
			const ensResolver = new ENSResolver({
				mainnetClient: mainnetClient as any
			})

			const sender = await resolveSender(
				message as unknown as DecodedMessage<unknown>,
				xmtpClient as any
			)
			const subjects = await extractSubjects(text, basenameResolver, ensResolver)

				const baseRuntime: AgentRuntime = {
					conversation: conversation as unknown as XmtpConversation,
					message: message as unknown as XmtpMessage,
					sender,
					subjects,
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
