import type { XmtpClient, XmtpMessage } from "../types"
import { logger } from "@hybrd/utils"

interface XmtpResolverOptions {
	/**
	 * Maximum number of addresses to cache
	 * @default 1000
	 */
	maxCacheSize?: number
	/**
	 * Cache TTL in milliseconds
	 * @default 86400000 (24 hours)
	 */
	cacheTtl?: number
	/**
	 * Maximum number of messages to cache
	 * @default 1000
	 */
	maxMessageCacheSize?: number
	/**
	 * Message cache TTL in milliseconds
	 * @default 3600000 (1 hour)
	 */
	messageCacheTtl?: number
}

interface AddressCacheEntry {
	address: string
	timestamp: number
}

interface MessageCacheEntry {
	message: XmtpMessage | null
	timestamp: number
}

export class XmtpResolver {
	private addressCache = new Map<string, AddressCacheEntry>()
	private messageCache = new Map<string, MessageCacheEntry>()
	private readonly maxCacheSize: number
	private readonly cacheTtl: number
	private readonly maxMessageCacheSize: number
	private readonly messageCacheTtl: number

	constructor(
		private client: XmtpClient,
		options: XmtpResolverOptions = {}
	) {
		this.maxCacheSize = options.maxCacheSize ?? 1000
		this.cacheTtl = options.cacheTtl ?? 86400000 // 24 hours
		this.maxMessageCacheSize = options.maxMessageCacheSize ?? 1000
		this.messageCacheTtl = options.messageCacheTtl ?? 3600000 // 1 hour
	}

	/**
	 * Resolve user address from inbox ID with caching
	 */
	async resolveAddress(
		inboxId: string,
		conversationId?: string
	): Promise<`0x${string}` | null> {
		// Check cache first (fastest)
		const cached = this.getCachedAddress(inboxId)
		if (cached) {
			logger.debug(
				`✅ [XmtpResolver] Resolved user address from cache: ${cached}`
			)
			return cached
		}

		let userAddress = undefined

		try {
			// Try conversation members lookup first (faster than network call)
			if (conversationId) {
				const conversation =
					await this.client.conversations.getConversationById(conversationId)
				if (conversation) {
					userAddress = await this.resolveFromConversation(
						conversation,
						inboxId
					)
					if (userAddress) {
						this.setCachedAddress(inboxId, userAddress)
						logger.debug(
							`✅ [XmtpResolver] Resolved user address: ${userAddress}`
						)
						return userAddress
					}
				}
			}

			// Fallback to inboxStateFromInboxIds
			userAddress = await this.resolveFromInboxState(inboxId)
			if (userAddress) {
				this.setCachedAddress(inboxId, userAddress)
				logger.debug(
					`✅ [XmtpResolver] Resolved user address via fallback: ${userAddress}`
				)
				return userAddress
			}

			logger.debug(`⚠️ [XmtpResolver] No identifiers found for inbox ${inboxId}`)
			return null
		} catch (error) {
			console.error(
				`❌ [XmtpResolver] Error resolving user address for ${inboxId}:`,
				error
			)
			return null
		}
	}

	/**
	 * Find any message by ID with caching
	 */
	async findMessage(messageId: string): Promise<XmtpMessage | null> {
		// Check cache first
		const cached = this.getCachedMessage(messageId)
		if (cached !== undefined) {
			logger.debug(
				cached
					? `✅ [XmtpResolver] Found message from cache: ${cached.id}`
					: `✅ [XmtpResolver] Found cached null message for: ${messageId}`
			)
			return cached
		}

		try {
			logger.debug(`🔍 [XmtpResolver] Finding message: ${messageId}`)
			const message = await this.client.conversations.getMessageById(messageId)

			if (message) {
				this.setCachedMessage(messageId, message)
				logger.debug(`✅ [XmtpResolver] Found and cached message: ${message.id}`)
				return message
			}

			logger.debug(`⚠️ [XmtpResolver] Message not found: ${messageId}`)
			this.setCachedMessage(messageId, null)
			return null
		} catch (error) {
			console.error(
				`❌ [XmtpResolver] Error finding message ${messageId}:`,
				error
			)
			this.setCachedMessage(messageId, null)
			return null
		}
	}

	/**
	 * Find root message with caching
	 */
	async findRootMessage(messageId: string): Promise<XmtpMessage | null> {
		// Check if we already have the root cached with a special key
		const rootCacheKey = `root:${messageId}`
		const cached = this.getCachedMessage(rootCacheKey)
		if (cached !== undefined) {
			logger.debug(
				cached
					? `✅ [XmtpResolver] Found root message from cache: ${cached.id}`
					: `✅ [XmtpResolver] Found cached null root for: ${messageId}`
			)
			return cached
		}

		try {
			console.log(`🔍 [XmtpResolver] Finding root message for: ${messageId}`)
			const rootMessage = await this.findRootMessageRecursive(messageId)

			if (rootMessage) {
				this.setCachedMessage(rootCacheKey, rootMessage)
				console.log(
					`✅ [XmtpResolver] Found and cached root message: ${rootMessage.id}`
				)
				return rootMessage
			}

			console.log(`⚠️ [XmtpResolver] No root message found for: ${messageId}`)
			this.setCachedMessage(rootCacheKey, null)
			return null
		} catch (error) {
			console.error(
				`❌ [XmtpResolver] Error finding root message for ${messageId}:`,
				error
			)
			this.setCachedMessage(rootCacheKey, null)
			return null
		}
	}

	/**
	 * Recursively finds the root message in a reply chain by following reply references
	 */
	private async findRootMessageRecursive(
		messageId: string,
		visitedIds = new Set<string>()
	): Promise<XmtpMessage | null> {
		// Prevent infinite loops
		if (visitedIds.has(messageId)) {
			console.warn(
				`⚠️ Circular reference detected in message chain at ${messageId}`
			)
			return null
		}
		visitedIds.add(messageId)

		const message = await this.client.conversations.getMessageById(messageId)

		if (!message) {
			console.warn(`⚠️ [findRootMessage] Message not found: ${messageId}`)
			return null
		}

		// Debug: Log the raw message structure as returned by XMTP client
		console.log(`🔍 [findRootMessage] Raw message ${messageId}:`, {
			id: message.id,
			contentType: message.contentType,
			content: message.content,
			sentAt: message.sentAt
		})

		// Method 1: Try the parameters (as seen in webhook data)
		if ((message as any).content?.reference) {
			return this.findRootMessageRecursive(
				(message as any).content.reference,
				visitedIds
			)
		}

		return message
	}

	/**
	 * Resolve address from conversation members
	 */
	private async resolveFromConversation(
		conversation: any,
		inboxId: string
	): Promise<`0x${string}` | null> {
		try {
			const members = await conversation.members()
			const sender = members.find(
				(member: any) => member.inboxId.toLowerCase() === inboxId.toLowerCase()
			)

			if (sender) {
				const ethIdentifier = sender.accountIdentifiers.find(
					(id: any) => id.identifierKind === 0 // IdentifierKind.Ethereum
				)
				if (ethIdentifier) {
					return ethIdentifier.identifier
				} else {
					console.log(
						`⚠️ [XmtpResolver] No Ethereum identifier found for inbox ${inboxId}`
					)
				}
			} else {
				console.log(
					`⚠️ [XmtpResolver] Sender not found in conversation members for inbox ${inboxId}`
				)
			}
		} catch (error) {
			console.error(
				`❌ [XmtpResolver] Error resolving from conversation members:`,
				error
			)
		}

		return null
	}

	/**
	 * Resolve address from inbox state (network fallback)
	 */
	private async resolveFromInboxState(
		inboxId: string
	): Promise<`0x${string}` | null> {
		try {
			const inboxState = await this.client.preferences.inboxStateFromInboxIds([
				inboxId
			])
			const firstState = inboxState?.[0]
			if (firstState?.identifiers && firstState.identifiers.length > 0) {
				const firstIdentifier = firstState.identifiers[0]
				return firstIdentifier?.identifier as `0x${string}`
			}
		} catch (error) {
			console.error(
				`❌ [XmtpResolver] Error resolving from inbox state:`,
				error
			)
		}

		return null
	}

	/**
	 * Get cached address if not expired
	 */
	private getCachedAddress(inboxId: string): `0x${string}` | null {
		const entry = this.addressCache.get(inboxId)
		if (!entry) return null

		const now = Date.now()
		if (now - entry.timestamp > this.cacheTtl) {
			this.addressCache.delete(inboxId)
			return null
		}

		return entry.address as `0x${string}`
	}

	/**
	 * Cache address with LRU eviction
	 */
	private setCachedAddress(inboxId: string, address: `0x${string}`): void {
		// Simple LRU: if cache is full, remove oldest entry
		if (this.addressCache.size >= this.maxCacheSize) {
			const firstKey = this.addressCache.keys().next().value
			if (firstKey) {
				this.addressCache.delete(firstKey)
			}
		}

		this.addressCache.set(inboxId, {
			address,
			timestamp: Date.now()
		})
	}

	/**
	 * Get cached message if not expired
	 */
	private getCachedMessage(messageId: string): XmtpMessage | null | undefined {
		const entry = this.messageCache.get(messageId)
		if (!entry) return undefined

		const now = Date.now()
		if (now - entry.timestamp > this.messageCacheTtl) {
			this.messageCache.delete(messageId)
			return undefined
		}

		return entry.message
	}

	/**
	 * Cache message with LRU eviction
	 */
	private setCachedMessage(
		messageId: string,
		message: XmtpMessage | null
	): void {
		// Simple LRU: if cache is full, remove oldest entry
		if (this.messageCache.size >= this.maxMessageCacheSize) {
			const firstKey = this.messageCache.keys().next().value
			if (firstKey) {
				this.messageCache.delete(firstKey)
			}
		}

		this.messageCache.set(messageId, {
			message,
			timestamp: Date.now()
		})
	}

	/**
	 * Pre-populate address cache from existing conversations
	 */
	async prePopulateCache(): Promise<void> {
		console.log("🔄 [XmtpResolver] Pre-populating address cache...")
		try {
			const conversations = await this.client.conversations.list()
			let cachedCount = 0

			for (const conversation of conversations) {
				try {
					const members = await conversation.members()
					for (const member of members) {
						const ethIdentifier = member.accountIdentifiers.find(
							(id: any) => id.identifierKind === 0 // IdentifierKind.Ethereum
						)
						if (ethIdentifier) {
							this.setCachedAddress(
								member.inboxId,
								ethIdentifier.identifier as `0x${string}`
							)
							cachedCount++
						}
					}
				} catch (error) {
					console.error(
						"[XmtpResolver] Error pre-caching conversation members:",
						error
					)
				}
			}

			console.log(
				`✅ [XmtpResolver] Pre-cached ${cachedCount} address mappings`
			)
		} catch (error) {
			console.error("[XmtpResolver] Error pre-populating cache:", error)
		}
	}

	/**
	 * Clear all caches
	 */
	clearCache(): void {
		this.addressCache.clear()
		this.messageCache.clear()
		console.log("🗑️ [XmtpResolver] All caches cleared")
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		address: { size: number; maxSize: number }
		message: { size: number; maxSize: number }
	} {
		return {
			address: {
				size: this.addressCache.size,
				maxSize: this.maxCacheSize
			},
			message: {
				size: this.messageCache.size,
				maxSize: this.maxMessageCacheSize
			}
		}
	}
}
