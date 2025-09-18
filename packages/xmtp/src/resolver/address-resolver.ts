import type { XmtpClient } from "../types"
import { logger } from "@hybrd/utils"

interface AddressResolverOptions {
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
}

interface CacheEntry {
	address: string
	timestamp: number
}

export class AddressResolver {
	private cache = new Map<string, CacheEntry>()
	private readonly maxCacheSize: number
	private readonly cacheTtl: number

	constructor(
		private client: XmtpClient,
		options: AddressResolverOptions = {}
	) {
		this.maxCacheSize = options.maxCacheSize ?? 1000
		this.cacheTtl = options.cacheTtl ?? 86400000 // 24 hours
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
			logger.debug(`✅ Resolved user address from cache: ${cached}`)
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
						logger.debug(`✅ Resolved user address: ${userAddress}`)
						return userAddress
					}
				}
			}

			// Fallback to inboxStateFromInboxIds
			userAddress = await this.resolveFromInboxState(inboxId)
			if (userAddress) {
				this.setCachedAddress(inboxId, userAddress)
				logger.debug(`✅ Resolved user address via fallback: ${userAddress}`)
				return userAddress
			}

			logger.debug(`⚠️ No identifiers found for inbox ${inboxId}`)
			return null
		} catch (error) {
			console.error(`❌ Error resolving user address for ${inboxId}:`, error)
			return null
		}
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
					logger.debug(`⚠️ No Ethereum identifier found for inbox ${inboxId}`)
				}
			} else {
				logger.debug(
					`⚠️ Sender not found in conversation members for inbox ${inboxId}`
				)
			}
		} catch (error) {
			console.error(`❌ Error resolving from conversation members:`, error)
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
			console.error(`❌ Error resolving from inbox state:`, error)
		}

		return null
	}

	/**
	 * Get cached address if not expired
	 */
	private getCachedAddress(inboxId: string): `0x${string}` | null {
		const entry = this.cache.get(inboxId)
		if (!entry) return null

		const now = Date.now()
		if (now - entry.timestamp > this.cacheTtl) {
			this.cache.delete(inboxId)
			return null
		}

		return entry.address as `0x${string}`
	}

	/**
	 * Cache address with LRU eviction
	 */
	private setCachedAddress(inboxId: string, address: `0x${string}`): void {
		// Simple LRU: if cache is full, remove oldest entry
		if (this.cache.size >= this.maxCacheSize) {
			const firstKey = this.cache.keys().next().value
			if (firstKey) {
				this.cache.delete(firstKey)
			}
		}

		this.cache.set(inboxId, {
			address,
			timestamp: Date.now()
		})
	}

	/**
	 * Pre-populate cache from existing conversations
	 */
	async prePopulateCache(): Promise<void> {
		logger.debug("🔄 Pre-populating address cache...")
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
					console.error("Error pre-caching conversation members:", error)
				}
			}

			logger.debug(`✅ Pre-cached ${cachedCount} address mappings`)
		} catch (error) {
			console.error("Error pre-populating cache:", error)
		}
	}

	/**
	 * Clear the cache
	 */
	clearCache(): void {
		this.cache.clear()
		logger.debug("🗑️ Address cache cleared")
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
		return {
			size: this.cache.size,
			maxSize: this.maxCacheSize
		}
	}
}
