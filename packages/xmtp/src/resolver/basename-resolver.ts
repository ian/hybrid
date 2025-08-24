import {
	type Address,
	PublicClient,
	encodePacked,
	keccak256,
	namehash
} from "viem"
import { mainnet } from "viem/chains"
import { L2ResolverAbi } from "../abi/l2_resolver"

// Base L2 Resolver Address mapping by chain ID
// const BASENAME_L2_RESOLVER_ADDRESSES: Record<number, Address> = {
// 	[mainnet.id]: "0x0000000000000000000000000000000000000000", // Mainnet (1)
// 	[base.id]: "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD", // Base Mainnet (8453)
// 	[baseSepolia.id]: "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA" // Base Sepolia (84532)
// } as const

const BASENAME_L2_RESOLVER_ADDRESS =
	"0xC6d566A56A1aFf6508b41f6c90ff131615583BCD"

// Basename text record keys for metadata
export const BasenameTextRecordKeys = {
	Email: "email",
	Url: "url",
	Avatar: "avatar",
	Description: "description",
	Notice: "notice",
	Keywords: "keywords",
	Twitter: "com.twitter",
	Github: "com.github",
	Discord: "com.discord",
	Telegram: "org.telegram",
	Snapshot: "snapshot",
	Location: "location"
} as const

export type BasenameTextRecordKey =
	(typeof BasenameTextRecordKeys)[keyof typeof BasenameTextRecordKeys]
export type BaseName = string

interface BasenameResolverOptions {
	/**
	 * Maximum number of basenames to cache
	 * @default 500
	 */
	maxCacheSize?: number
	/**
	 * Cache TTL in milliseconds
	 * @default 3600000 (1 hour)
	 */
	cacheTtl?: number

	/**
	 * Public client
	 * @default null
	 */
	publicClient: PublicClient
}

interface CacheEntry {
	basename: string
	timestamp: number
}

interface TextRecordCacheEntry {
	value: string
	timestamp: number
}

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
	// L1 resolvers to addr
	if (chainId === mainnet.id) {
		return "addr"
	}

	const cointype = (0x80000000 | chainId) >>> 0
	return cointype.toString(16).toLocaleUpperCase()
}

/**
 * Helper function to convert an address to its reverse node for ENS lookups
 */
export const convertReverseNodeToBytes = (
	address: Address,
	chainId: number
) => {
	const addressFormatted = address.toLocaleLowerCase() as Address
	const addressNode = keccak256(addressFormatted.substring(2) as Address)
	const chainCoinType = convertChainIdToCoinType(chainId)
	const baseReverseNode = namehash(
		`${chainCoinType.toLocaleUpperCase()}.reverse`
	)
	const addressReverseNode = keccak256(
		encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode])
	)
	return addressReverseNode
}

/**
 * Helper function to convert a basename to its node hash
 */
function convertBasenameToNode(basename: string): `0x${string}` {
	return namehash(basename)
}

/**
 * Get the resolver address for a given chain ID
 */
function getResolverAddress(): Address {
	const resolverAddress = BASENAME_L2_RESOLVER_ADDRESS
	return resolverAddress
}

export class BasenameResolver {
	private cache = new Map<string, CacheEntry>()
	private textRecordCache = new Map<string, Map<string, TextRecordCacheEntry>>()
	private readonly maxCacheSize: number
	private readonly cacheTtl: number
	private readonly baseClient: PublicClient
	private resolverAddress: Address | null = null
	private chainId: number | null = null

	constructor(options: BasenameResolverOptions) {
		this.maxCacheSize = options.maxCacheSize ?? 500
		this.cacheTtl = options.cacheTtl ?? 3600000 // 1 hour

		// Create a public client for Base network
		this.baseClient = options.publicClient

		// Initialize resolver address lazily on first use
		this.initializeResolver()
	}

	/**
	 * Initialize the resolver address based on the client's chain ID
	 */
	private async initializeResolver(): Promise<void> {
		if (this.resolverAddress && this.chainId) {
			console.log(
				`🔄 BasenameResolver already initialized for chain ${this.chainId} with resolver ${this.resolverAddress}`
			)
			return
		}

		try {
			console.log("🔄 Initializing BasenameResolver...")
			this.chainId = await this.baseClient.getChainId()
			console.log(`🔗 Chain ID detected: ${this.chainId}`)

			this.resolverAddress = getResolverAddress()
			console.log(
				`📍 Resolver address for chain ${this.chainId}: ${this.resolverAddress}`
			)

			console.log(
				`✅ Initialized BasenameResolver for chain ${this.chainId} with resolver ${this.resolverAddress}`
			)
		} catch (error) {
			console.error("❌ Failed to initialize BasenameResolver:", error)
			throw error
		}
	}

	/**
	 * Get the resolver address, initializing if necessary
	 */
	private async getResolverAddress(): Promise<Address> {
		await this.initializeResolver()
		if (!this.resolverAddress) {
			throw new Error("Failed to initialize resolver address")
		}
		return this.resolverAddress
	}

	/**
	 * Resolve a basename from an Ethereum address
	 */
	async getBasename(address: Address): Promise<string | null> {
		console.log(`🔍 Starting basename resolution for address: ${address}`)

		try {
			// Check cache first
			const cached = this.getCachedBasename(address)
			if (cached) {
				console.log(`✅ Resolved basename from cache: ${cached}`)
				return cached
			}
			console.log(`📭 No cached basename found for address: ${address}`)

			console.log("🔄 Getting resolver address...")
			const resolverAddress = await this.getResolverAddress()
			console.log(`📍 Using resolver address: ${resolverAddress}`)

			console.log("🔄 Getting chain ID...")
			const chainId = await this.baseClient.getChainId()
			console.log(`🔗 Chain ID: ${chainId}`)

			console.log("🔄 Converting address to reverse node...")
			const addressReverseNode = convertReverseNodeToBytes(
				// address.toUpperCase() as `0x${string}`,
				address as `0x${string}`,
				chainId
			)
			console.log(`🔗 Reverse node: ${addressReverseNode}`)

			console.log("🔄 Reading contract to resolve basename...")
			const basename = await this.baseClient.readContract({
				abi: L2ResolverAbi,
				address: resolverAddress,
				functionName: "name",
				args: [addressReverseNode]
			})

			console.log(
				`📋 Contract returned basename: "${basename}" (length: ${basename?.length || 0})`
			)

			if (basename && basename.length > 0) {
				this.setCachedBasename(address, basename)
				console.log(`✅ Resolved basename: ${basename} for address: ${address}`)
				return basename as BaseName
			}

			console.log(
				`❌ No basename found for address: ${address} (empty or null response)`
			)
			return null
		} catch (error) {
			console.error(
				`❌ Error resolving basename for address ${address}:`,
				error
			)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
				console.error(`❌ Error stack:`, error.stack)
			}
			return null
		}
	}

	/**
	 * Get the avatar URL for a basename
	 */
	async getBasenameAvatar(basename: BaseName): Promise<string | null> {
		console.log(`🖼️ Getting avatar for basename: ${basename}`)
		return this.getBasenameTextRecord(basename, BasenameTextRecordKeys.Avatar)
	}

	/**
	 * Get a text record for a basename
	 */
	async getBasenameTextRecord(
		basename: BaseName,
		key: BasenameTextRecordKey
	): Promise<string | null> {
		console.log(`📝 Getting text record "${key}" for basename: ${basename}`)

		try {
			// Check cache first
			const cached = this.getCachedTextRecord(basename, key)
			if (cached) {
				console.log(`✅ Resolved text record from cache: ${key}=${cached}`)
				return cached
			}
			console.log(`📭 No cached text record found for ${basename}.${key}`)

			console.log("🔄 Getting resolver address...")
			const resolverAddress = await this.getResolverAddress()
			console.log(`📍 Using resolver address: ${resolverAddress}`)

			console.log("🔄 Converting basename to node...")
			const node = convertBasenameToNode(basename)
			console.log(`🔗 Node hash: ${node}`)

			console.log(`🔄 Reading contract for text record "${key}"...`)
			const textRecord = await this.baseClient.readContract({
				abi: L2ResolverAbi,
				address: resolverAddress,
				functionName: "text",
				args: [node, key]
			})

			console.log(
				`📋 Contract returned text record: "${textRecord}" (length: ${textRecord?.length || 0})`
			)

			if (textRecord && textRecord.length > 0) {
				this.setCachedTextRecord(basename, key, textRecord)
				console.log(`✅ Resolved text record: ${key}=${textRecord}`)
				return textRecord
			}

			console.log(
				`❌ No text record found for ${basename}.${key} (empty or null response)`
			)
			return null
		} catch (error) {
			console.error(
				`❌ Error resolving text record ${key} for ${basename}:`,
				error
			)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
				console.error(`❌ Error stack:`, error.stack)
			}
			return null
		}
	}

	/**
	 * Get the Ethereum address that owns a basename
	 */
	async getBasenameAddress(basename: BaseName): Promise<Address | null> {
		console.log(`🔍 Getting address for basename: ${basename}`)

		try {
			console.log("🔄 Getting resolver address...")
			const resolverAddress = await this.getResolverAddress()
			console.log(`📍 Using resolver address: ${resolverAddress}`)

			console.log("🔄 Converting basename to node...")
			const node = convertBasenameToNode(basename)
			console.log(`🔗 Node hash: ${node}`)

			console.log("🔄 Reading contract to resolve address...")
			const address = await this.baseClient.readContract({
				abi: L2ResolverAbi,
				address: resolverAddress,
				functionName: "addr",
				args: [node]
			})

			console.log(`📋 Contract returned address: "${address}"`)

			if (address && address !== "0x0000000000000000000000000000000000000000") {
				console.log(`✅ Resolved address: ${address} for basename: ${basename}`)
				return address as Address
			}

			console.log(
				`❌ No address found for basename: ${basename} (zero address or null response)`
			)
			return null
		} catch (error) {
			console.error(
				`❌ Error resolving address for basename ${basename}:`,
				error
			)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
				console.error(`❌ Error stack:`, error.stack)
			}
			return null
		}
	}

	/**
	 * Get all basic metadata for a basename
	 */
	async getBasenameMetadata(basename: BaseName) {
		console.log(`📊 Getting metadata for basename: ${basename}`)

		try {
			const [avatar, description, twitter, github, url] = await Promise.all([
				this.getBasenameTextRecord(basename, BasenameTextRecordKeys.Avatar),
				this.getBasenameTextRecord(
					basename,
					BasenameTextRecordKeys.Description
				),
				this.getBasenameTextRecord(basename, BasenameTextRecordKeys.Twitter),
				this.getBasenameTextRecord(basename, BasenameTextRecordKeys.Github),
				this.getBasenameTextRecord(basename, BasenameTextRecordKeys.Url)
			])

			const metadata = {
				basename,
				avatar,
				description,
				twitter,
				github,
				url
			}

			console.log(`✅ Resolved metadata for ${basename}:`, metadata)
			return metadata
		} catch (error) {
			console.error(
				`❌ Error resolving metadata for basename ${basename}:`,
				error
			)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
				console.error(`❌ Error stack:`, error.stack)
			}
			return null
		}
	}

	/**
	 * Resolve a full basename profile (name + metadata) from an address
	 */
	async resolveBasenameProfile(address: Address) {
		console.log(`👤 Resolving full basename profile for address: ${address}`)

		try {
			const basename = await this.getBasename(address)
			if (!basename) {
				console.log(`❌ No basename found for address: ${address}`)
				return null
			}

			console.log(`🔄 Getting metadata for resolved basename: ${basename}`)
			const metadata = await this.getBasenameMetadata(basename)

			const profile = {
				address,
				...metadata
			}

			console.log(`✅ Resolved full profile for ${address}:`, profile)
			return profile
		} catch (error) {
			console.error(
				`❌ Error resolving basename profile for ${address}:`,
				error
			)
			if (error instanceof Error) {
				console.error(`❌ Error details: ${error.message}`)
				console.error(`❌ Error stack:`, error.stack)
			}
			return null
		}
	}

	/**
	 * Get cached basename if not expired
	 */
	private getCachedBasename(address: Address): string | null {
		const entry = this.cache.get(address.toLowerCase())
		if (!entry) {
			console.log(
				`📭 No cache entry found for address: ${address.toLowerCase()}`
			)
			return null
		}

		const now = Date.now()
		const age = now - entry.timestamp
		console.log(`🕐 Cache entry age: ${age}ms (TTL: ${this.cacheTtl}ms)`)

		if (age > this.cacheTtl) {
			console.log(
				`⏰ Cache entry expired for address: ${address.toLowerCase()}`
			)
			this.cache.delete(address.toLowerCase())
			return null
		}

		console.log(
			`✅ Valid cache entry found for ${address.toLowerCase()}: "${entry.basename}"`
		)
		return entry.basename
	}

	/**
	 * Cache basename with LRU eviction
	 */
	private setCachedBasename(address: Address, basename: string): void {
		// Simple LRU: if cache is full, remove oldest entry
		if (this.cache.size >= this.maxCacheSize) {
			const firstKey = this.cache.keys().next().value
			if (firstKey) {
				console.log(`🗑️ Cache full, removing oldest entry: ${firstKey}`)
				this.cache.delete(firstKey)
			}
		}

		console.log(
			`💾 Caching basename "${basename}" for address: ${address.toLowerCase()}`
		)
		this.cache.set(address.toLowerCase(), {
			basename,
			timestamp: Date.now()
		})
	}

	/**
	 * Get cached text record if not expired
	 */
	private getCachedTextRecord(basename: string, key: string): string | null {
		const basenameCache = this.textRecordCache.get(basename)
		if (!basenameCache) {
			console.log(`📭 No text record cache found for basename: ${basename}`)
			return null
		}

		const entry = basenameCache.get(key)
		if (!entry) {
			console.log(`📭 No cached text record found for ${basename}.${key}`)
			return null
		}

		const now = Date.now()
		const age = now - entry.timestamp
		console.log(
			`🕐 Text record cache entry age: ${age}ms (TTL: ${this.cacheTtl}ms)`
		)

		if (age > this.cacheTtl) {
			console.log(`⏰ Text record cache entry expired for ${basename}.${key}`)
			basenameCache.delete(key)
			return null
		}

		console.log(
			`✅ Valid text record cache entry found for ${basename}.${key}: "${entry.value}"`
		)
		return entry.value
	}

	/**
	 * Cache text record
	 */
	private setCachedTextRecord(
		basename: string,
		key: string,
		value: string
	): void {
		let basenameCache = this.textRecordCache.get(basename)
		if (!basenameCache) {
			console.log(`📝 Creating new text record cache for basename: ${basename}`)
			basenameCache = new Map()
			this.textRecordCache.set(basename, basenameCache)
		}

		console.log(
			`💾 Caching text record "${key}" = "${value}" for basename: ${basename}`
		)
		basenameCache.set(key, {
			value,
			timestamp: Date.now()
		})
	}

	/**
	 * Clear all caches
	 */
	clearCache(): void {
		const basenameCount = this.cache.size
		const textRecordCount = this.textRecordCache.size

		this.cache.clear()
		this.textRecordCache.clear()

		console.log(`🗑️ Basename cache cleared (${basenameCount} entries removed)`)
		console.log(
			`🗑️ Text record cache cleared (${textRecordCount} basename caches removed)`
		)
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		basenameCache: { size: number; maxSize: number }
		textRecordCache: { size: number }
		chainId: number | null
		resolverAddress: Address | null
	} {
		return {
			basenameCache: {
				size: this.cache.size,
				maxSize: this.maxCacheSize
			},
			textRecordCache: {
				size: this.textRecordCache.size
			},
			chainId: this.chainId,
			resolverAddress: this.resolverAddress
		}
	}
}
