import { Agent as XmtpAgent, XmtpEnv } from "@xmtp/agent-sdk"
import { createSigner, createUser } from "@xmtp/agent-sdk/user"

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
import { createPublicClient, http } from "viem"
import { base, mainnet } from "viem/chains"
import { createXMTPClient, getDbPath } from "./client"
import { ContentTypeReply, ContentTypeText, type Reply } from "./index"
import { Resolver } from "./resolver/resolver"

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

			const address = user.account.address.toLowerCase()
			const agentDbPath = await getDbPath(
				`agent-${XMTP_ENV || "dev"}-${address}`
			)
			logger.debug(`📁 Using database path: ${agentDbPath}`)

			const xmtp = await XmtpAgent.create(signer, {
				env: XMTP_ENV as XmtpEnv,
				dbPath: agentDbPath
			})

			// Create unified resolver for all address/name resolution
			const resolver = new Resolver({
				xmtpClient,
				mainnetClient,
				baseClient
			})

			xmtp.on("text", async ({ conversation, message }) => {
				try {
					const text = message.content
					const messages: AgentMessage[] = [
						{ id: randomUUID(), role: "user", parts: [{ type: "text", text }] }
					]

					const sender = await resolver.createXmtpSender(
						message.senderInboxId,
						conversation.id
					)
					const subjects = await resolver.extractSubjects(text)

					console.log({
						sender,
						subjects
					})

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

					const sender = await resolver.createXmtpSender(
						message.senderInboxId,
						conversation.id
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

					const sender = await resolver.createXmtpSender(
						message.senderInboxId,
						conversation.id
					)
					const subjects = await resolver.extractSubjects(text)

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
