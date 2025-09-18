import { type Address, PublicClient } from "viem"
import { logger } from "@hybrd/utils"

interface ENSResolverOptions {
	/**
	 * Maximum number of ENS names to cache
	 * @default 500
	 */
	maxCacheSize?: number
	/**
	 * Cache TTL in milliseconds
	 * @default 3600000 (1 hour)
	 */
	cacheTtl?: number
	/**
	 * Mainnet public client for ENS resolution
	 */
	mainnetClient: PublicClient
}

interface CacheEntry {
	address: string
	timestamp: number
}

interface ReverseCacheEntry {
	ensName: string
	timestamp: number
}

/**
 * ENS Resolver for mainnet .eth names
 * Handles resolution of ENS names to addresses and reverse resolution
 */
export class ENSResolver {
	private cache = new Map<string, CacheEntry>()
	private reverseCache = new Map<string, ReverseCacheEntry>()
	private readonly maxCacheSize: number
	private readonly cacheTtl: number
	private readonly mainnetClient: PublicClient

	constructor(options: ENSResolverOptions) {
		this.maxCacheSize = options.maxCacheSize ?? 500
		this.cacheTtl = options.cacheTtl ?? 3600000 // 1 hour
		this.mainnetClient = options.mainnetClient
	}

	/**
	 * Resolve an ENS name to an Ethereum address
	 */
	async resolveENSName(ensName: string): Promise<Address | null> {
		logger.debug(`🔍 Resolving ENS name: ${ensName}`)

		try {
			// Check cache first
			const cached = this.getCachedAddress(ensName)
			if (cached) {
				logger.debug(`✅ Resolved ENS from cache: ${ensName} → ${cached}`)
				return cached as Address
			}

			logger.debug(`📭 No cached address found for ENS: ${ensName}`)

			// Resolve using mainnet ENS
			logger.debug("🔄 Reading ENS contract...")
			const address = await this.mainnetClient.getEnsAddress({
				name: ensName
			})

			logger.debug(`📋 ENS contract returned address: "${address}"`)

			if (address && address !== "0x0000000000000000000000000000000000000000") {
				this.setCachedAddress(ensName, address)
				logger.debug(`✅ Resolved ENS: ${ensName} → ${address}`)
				return address
			}

			logger.debug(`❌ No address found for ENS: ${ensName}`)
			return null
		} catch (error) {
			console.error(`❌ Error resolving ENS name ${ensName}:`, error)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
			}
			return null
		}
	}

	/**
	 * Resolve an address to its primary ENS name (reverse resolution)
	 */
	async resolveAddressToENS(address: Address): Promise<string | null> {
		logger.debug(`🔍 Reverse resolving address to ENS: ${address}`)

		try {
			// Check cache first
			const cached = this.getCachedENSName(address)
			if (cached) {
				logger.debug(
					`✅ Resolved ENS from reverse cache: ${address} → ${cached}`
				)
				return cached
			}

			logger.debug(`📭 No cached ENS name found for address: ${address}`)

			// Reverse resolve using mainnet ENS
			logger.debug("🔄 Reading ENS reverse resolver...")
			const ensName = await this.mainnetClient.getEnsName({
				address: address
			})

			logger.debug(`📋 ENS reverse resolver returned: "${ensName}"`)

			if (ensName && ensName.length > 0) {
				this.setCachedENSName(address, ensName)
				logger.debug(`✅ Reverse resolved: ${address} → ${ensName}`)
				return ensName
			}

			logger.debug(`❌ No ENS name found for address: ${address}`)
			return null
		} catch (error) {
			console.error(`❌ Error reverse resolving address ${address}:`, error)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
			}
			return null
		}
	}

	/**
	 * Get ENS avatar for a name
	 */
	async getENSAvatar(ensName: string): Promise<string | null> {
		console.log(`🖼️ Getting ENS avatar for: ${ensName}`)

		try {
			const avatar = await this.mainnetClient.getEnsAvatar({
				name: ensName
			})

			if (avatar) {
				console.log(`✅ Found ENS avatar: ${avatar}`)
				return avatar
			}

			console.log(`❌ No avatar found for ENS: ${ensName}`)
			return null
		} catch (error) {
			console.error(`❌ Error getting ENS avatar for ${ensName}:`, error)
			return null
		}
	}

	/**
	 * Get ENS text record
	 */
	async getENSTextRecord(ensName: string, key: string): Promise<string | null> {
		console.log(`📝 Getting ENS text record "${key}" for: ${ensName}`)

		try {
			const textRecord = await this.mainnetClient.getEnsText({
				name: ensName,
				key: key
			})

			if (textRecord && textRecord.length > 0) {
				console.log(`✅ Found ENS text record: ${key}=${textRecord}`)
				return textRecord
			}

			console.log(`❌ No text record "${key}" found for ENS: ${ensName}`)
			return null
		} catch (error) {
			console.error(
				`❌ Error getting ENS text record ${key} for ${ensName}:`,
				error
			)
			return null
		}
	}

	/**
	 * Get comprehensive ENS profile
	 */
	async getENSProfile(ensName: string) {
		console.log(`👤 Getting ENS profile for: ${ensName}`)

		try {
			const [address, avatar, description, twitter, github, url] =
				await Promise.all([
					this.resolveENSName(ensName),
					this.getENSAvatar(ensName),
					this.getENSTextRecord(ensName, "description"),
					this.getENSTextRecord(ensName, "com.twitter"),
					this.getENSTextRecord(ensName, "com.github"),
					this.getENSTextRecord(ensName, "url")
				])

			const profile = {
				ensName,
				address,
				avatar,
				description,
				twitter,
				github,
				url
			}

			console.log(`✅ ENS profile for ${ensName}:`, profile)
			return profile
		} catch (error) {
			console.error(`❌ Error getting ENS profile for ${ensName}:`, error)
			return null
		}
	}

	/**
	 * Check if a name is a valid ENS name (.eth)
	 */
	isENSName(name: string): boolean {
		return name.endsWith(".eth") && !name.endsWith(".base.eth")
	}

	/**
	 * Get cached address if not expired
	 */
	private getCachedAddress(ensName: string): string | null {
		const entry = this.cache.get(ensName.toLowerCase())
		if (!entry) {
			return null
		}

		const now = Date.now()
		if (now - entry.timestamp > this.cacheTtl) {
			this.cache.delete(ensName.toLowerCase())
			return null
		}

		return entry.address
	}

	/**
	 * Cache address with LRU eviction
	 */
	private setCachedAddress(ensName: string, address: string): void {
		if (this.cache.size >= this.maxCacheSize) {
			const firstKey = this.cache.keys().next().value
			if (firstKey) {
				this.cache.delete(firstKey)
			}
		}

		this.cache.set(ensName.toLowerCase(), {
			address,
			timestamp: Date.now()
		})
	}

	/**
	 * Get cached ENS name if not expired
	 */
	private getCachedENSName(address: Address): string | null {
		const entry = this.reverseCache.get(address.toLowerCase())
		if (!entry) {
			return null
		}

		const now = Date.now()
		if (now - entry.timestamp > this.cacheTtl) {
			this.reverseCache.delete(address.toLowerCase())
			return null
		}

		return entry.ensName
	}

	/**
	 * Cache ENS name with LRU eviction
	 */
	private setCachedENSName(address: Address, ensName: string): void {
		if (this.reverseCache.size >= this.maxCacheSize) {
			const firstKey = this.reverseCache.keys().next().value
			if (firstKey) {
				this.reverseCache.delete(firstKey)
			}
		}

		this.reverseCache.set(address.toLowerCase(), {
			ensName,
			timestamp: Date.now()
		})
	}

	/**
	 * Clear all caches
	 */
	clearCache(): void {
		const addressCount = this.cache.size
		const ensCount = this.reverseCache.size

		this.cache.clear()
		this.reverseCache.clear()

		console.log(`🗑️ ENS address cache cleared (${addressCount} entries removed)`)
		console.log(`🗑️ ENS reverse cache cleared (${ensCount} entries removed)`)
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats() {
		return {
			addressCache: {
				size: this.cache.size,
				maxSize: this.maxCacheSize
			},
			reverseCache: {
				size: this.reverseCache.size,
				maxSize: this.maxCacheSize
			}
		}
	}
}
