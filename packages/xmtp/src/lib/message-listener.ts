import { EventEmitter } from "node:events"
import { Reaction } from "@xmtp/content-type-reaction"
import { Reply } from "@xmtp/content-type-reply"
import { http, PublicClient, createPublicClient } from "viem"
import { mainnet } from "viem/chains"
import { Resolver } from "../resolver/resolver"
import type { MessageEvent, XmtpClient, XmtpMessage } from "../types"

// Configuration for the message listener
export interface MessageListenerConfig {
	publicClient: PublicClient
	xmtpClient: XmtpClient
	/**
	 * Filter function to determine which messages to process
	 * Return true to process the message, false to skip
	 */
	filter?: (
		event: Pick<MessageEvent, "conversation" | "message" | "rootMessage">
	) => Promise<boolean> | boolean
	/**
	 * Heartbeat interval in milliseconds (default: 5 minutes)
	 */
	heartbeatInterval?: number
	/**
	 * Conversation check interval in milliseconds (default: 30 seconds)
	 */
	conversationCheckInterval?: number
	/**
	 * Environment variable key for XMTP environment (default: "XMTP_ENV")
	 */
	envKey?: string
}

// Enriched message data with resolved address

// Define the event signature for type safety
export interface MessageListenerEvents {
	message: [data: MessageEvent]
	error: [error: Error]
	started: []
	stopped: []
	heartbeat: [stats: { messageCount: number; conversationCount: number }]
}

/**
 * A flexible XMTP message listener that can be configured for different applications
 */
export class MessageListener extends EventEmitter {
	private xmtpClient: XmtpClient
	private resolver: Resolver
	private filter?: (
		event: Pick<MessageEvent, "conversation" | "message" | "rootMessage">
	) => Promise<boolean> | boolean
	private heartbeatInterval?: NodeJS.Timeout
	private fallbackCheckInterval?: NodeJS.Timeout
	private messageCount = 0
	private conversations: any[] = []
	private readonly config: Required<
		Pick<
			MessageListenerConfig,
			"heartbeatInterval" | "conversationCheckInterval" | "envKey"
		>
	>

	constructor(config: MessageListenerConfig) {
		super()
		this.xmtpClient = config.xmtpClient

		// Create mainnet client for ENS resolution
		const mainnetClient = createPublicClient({
			chain: mainnet,
			transport: http()
		})

		// Create unified resolver with all capabilities
		this.resolver = new Resolver({
			xmtpClient: this.xmtpClient,
			mainnetClient,
			baseClient: config.publicClient,
			maxCacheSize: 1000,
			cacheTtl: 86400000 // 24 hours
		})

		this.filter = config.filter
		this.config = {
			heartbeatInterval: config.heartbeatInterval ?? 300000, // 5 minutes
			conversationCheckInterval: config.conversationCheckInterval ?? 30000, // 30 seconds
			envKey: config.envKey ?? "XMTP_ENV"
		}
	}

	// Type-safe event emitter methods
	on<U extends keyof MessageListenerEvents>(
		event: U,
		listener: (...args: MessageListenerEvents[U]) => void
	): this {
		return super.on(event, listener)
	}

	emit<U extends keyof MessageListenerEvents>(
		event: U,
		...args: MessageListenerEvents[U]
	): boolean {
		return super.emit(event, ...args)
	}

	async start(): Promise<void> {
		const XMTP_ENV = process.env[this.config.envKey]

		// Pre-populate address cache from existing conversations
		await this.resolver?.prePopulateAllCaches()

		console.log("📡 Syncing conversations...")
		await this.xmtpClient.conversations.sync()

		const address = this.xmtpClient.accountIdentifier?.identifier

		// List existing conversations for debugging
		this.conversations = await this.xmtpClient.conversations.list()

		console.log(`🤖 XMTP[${XMTP_ENV}] Listening on ${address} ...`)

		// Emit started event
		this.emit("started")

		// Stream all messages and emit events for processing
		try {
			const stream = await this.xmtpClient.conversations.streamAllMessages()

			// Add a heartbeat to show the listener is active
			this.heartbeatInterval = setInterval(() => {
				this.emit("heartbeat", {
					messageCount: this.messageCount,
					conversationCount: this.conversations.length
				})
				if (this.messageCount > 0) {
					console.log(`💓 Active - processed ${this.messageCount} messages`)
				}
			}, this.config.heartbeatInterval)

			// Check for new conversations
			this.fallbackCheckInterval = setInterval(async () => {
				try {
					const latestConversations = await this.xmtpClient.conversations.list()
					if (latestConversations.length > this.conversations.length) {
						console.log(
							`🆕 Detected ${latestConversations.length - this.conversations.length} new conversations`
						)
						this.conversations.push(
							...latestConversations.slice(this.conversations.length)
						)
					}
				} catch (error) {
					console.error("❌ Error checking for new conversations:", error)
					this.emit("error", error as Error)
				}
			}, this.config.conversationCheckInterval)

			try {
				for await (const message of stream) {
					this.messageCount++

					try {
						// Skip messages from self or null messages
						if (
							!message ||
							(this.xmtpClient.inboxId && 
							message.senderInboxId.toLowerCase() ===
								this.xmtpClient.inboxId.toLowerCase())
						) {
							continue
						}

						console.log(
							`📨 Received message "${JSON.stringify(message)}" in ${message.conversationId}`
						)

						// Get conversation details
						const conversation =
							await this.xmtpClient.conversations.getConversationById(
								message.conversationId
							)

						if (!conversation) {
							console.log("❌ Could not find conversation for message")
							continue
						}

						const contentTypeId = message.contentType?.typeId

						// Extract message content for processing
						let messageContent: string
						if (contentTypeId === "reply") {
							const replyContent = message.content as any
							messageContent = (replyContent?.content || "").toString()
						} else if (
							contentTypeId === "remoteStaticAttachment" ||
							contentTypeId === "attachment"
						) {
							// For attachments, use the fallback message or filename
							messageContent =
								(message as any).fallback ||
								(message.content as any)?.filename ||
								"[Attachment]"
						} else if (contentTypeId === "reaction") {
							// For reactions, use a simple representation
							const reactionContent = message.content as Reaction
							messageContent = `[Reaction: ${reactionContent.content || ""}]`
						} else {
							// For text and other content types, safely convert to string
							messageContent = message.content ? String(message.content) : ""
						}

						// Find root message for replies and reactions
						let rootMessage: XmtpMessage | null = message
						let parentMessage: XmtpMessage | null = null

						if (contentTypeId === "reply") {
							const { reference } = message.content as Reply
							rootMessage = await this.resolver.findRootMessage(reference)
							parentMessage = await this.resolver.findMessage(reference)
						} else if (contentTypeId === "reaction") {
							const { reference } = message.content as Reaction
							rootMessage = await this.resolver.findRootMessage(reference)
							parentMessage = await this.resolver.findMessage(reference)
						} else {
							// For text messages and attachments, they are root messages
							rootMessage = message
							parentMessage = null
						}

						// Skip if we couldn't find the root message
						if (!rootMessage) {
							console.warn(
								`⚠️ [MessageListener] Could not find root message for: ${message.id}`
							)
							continue
						}

						// Apply custom message filter if provided
						if (this.filter) {
							const shouldProcess = await this.filter({
								conversation,
								message,
								rootMessage
							})
							if (!shouldProcess) {
								console.log("🔄 Skipping message:", message.id)
								continue
							}
						}

						// Create sender using unified resolver
						const sender = await this.resolver.createXmtpSender(
							message.senderInboxId,
							message.conversationId
						)

						// Extract and resolve subjects (basenames and ENS names mentioned in message)
						// TODO: Update extractSubjects to work with unified resolver
						const subjects = {}

						// Create enriched message with resolved address, name, subjects, root message, and parent message
						const messageEvent: MessageEvent = {
							conversation,
							message,
							rootMessage: rootMessage as XmtpMessage, // We already checked it's not null above
							parentMessage: parentMessage || undefined,
							sender,
							subjects
						}

						// Emit the enriched message
						this.emit("message", messageEvent)
					} catch (messageError) {
						console.error("❌ Error processing message:", messageError)
						this.emit("error", messageError as Error)
						// Continue processing other messages instead of crashing
					}
				}
			} catch (streamError) {
				console.error("❌ Error in message stream:", streamError)
				this.cleanup()
				this.emit("error", streamError as Error)
				console.log("🔄 Attempting to restart stream...")

				// Wait a bit before restarting to avoid tight restart loops
				await new Promise((resolve) => setTimeout(resolve, 5000))

				// Recursively restart the message listener
				return this.start()
			}
		} catch (streamSetupError) {
			console.error("❌ Error setting up message stream:", streamSetupError)
			this.emit("error", streamSetupError as Error)
			throw streamSetupError
		}
	}

	private cleanup() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
		}
		if (this.fallbackCheckInterval) {
			clearInterval(this.fallbackCheckInterval)
		}
	}

	stop() {
		this.cleanup()
		this.emit("stopped")
		console.log("🛑 Message listener stopped")
		this.removeAllListeners()
	}

	/**
	 * Get current statistics
	 */
	getStats() {
		return {
			messageCount: this.messageCount,
			conversationCount: this.conversations.length,
			isActive: !!this.heartbeatInterval
		}
	}
}

/**
 * Helper function to start a message listener
 */
export async function startMessageListener(
	config: MessageListenerConfig
): Promise<MessageListener> {
	const listener = new MessageListener(config)
	await listener.start()
	return listener
}

/**
 * Factory function to create a message listener with common filters
 */
export function createMessageListener(config: MessageListenerConfig) {
	return new MessageListener(config)
}
