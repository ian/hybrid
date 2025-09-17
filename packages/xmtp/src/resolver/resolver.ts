import { type Address, type PublicClient } from "viem"
import type { XmtpClient, XmtpMessage, XmtpSender } from "../types"
import { AddressResolver } from "./address-resolver"
import {
	type BaseName,
	BasenameResolver,
	type BasenameTextRecordKey
} from "./basename-resolver"
import { ENSResolver } from "./ens-resolver"
import { XmtpResolver } from "./xmtp-resolver"
import { logger } from "../../../core/src/lib/logger"

interface ResolverOptions {
	/**
	 * XMTP Client for message and address resolution
	 */
	xmtpClient: XmtpClient
	/**
	 * Mainnet public client for ENS resolution
	 */
	mainnetClient: PublicClient
	/**
	 * Base network public client for basename resolution
	 */
	baseClient: PublicClient
	/**
	 * Maximum cache size for each resolver
	 * @default 1000
	 */
	maxCacheSize?: number
	/**
	 * Cache TTL in milliseconds
	 * @default 3600000 (1 hour)
	 */
	cacheTtl?: number
}

/**
 * Master Resolver that wraps all individual resolvers
 * Provides a unified interface for basename, ENS, address, and XMTP resolution
 */
export class Resolver {
	private addressResolver: AddressResolver
	private ensResolver: ENSResolver
	private basenameResolver: BasenameResolver
	private xmtpResolver: XmtpResolver

	constructor(options: ResolverOptions) {
		const resolverOptions = {
			maxCacheSize: options.maxCacheSize ?? 1000,
			cacheTtl: options.cacheTtl ?? 3600000
		}

		this.addressResolver = new AddressResolver(
			options.xmtpClient,
			resolverOptions
		)
		this.xmtpResolver = new XmtpResolver(options.xmtpClient, resolverOptions)

		// Type assertions needed due to viem version differences across monorepo packages
		// Both clients are PublicClient-compatible but TypeScript sees them as incompatible types
		this.ensResolver = new ENSResolver({
			...resolverOptions,
			mainnetClient: options.mainnetClient as PublicClient
		})
		this.basenameResolver = new BasenameResolver({
			...resolverOptions,
			publicClient: options.baseClient as PublicClient
		})
	}

	// === Address Resolution Methods ===

	/**
	 * Resolve user address from inbox ID with caching
	 * Uses both AddressResolver and XmtpResolver for redundancy
	 */
	async resolveAddress(
		inboxId: string,
		conversationId?: string
	): Promise<`0x${string}` | null> {
		// Try AddressResolver first, fallback to XmtpResolver
		let result = await this.addressResolver.resolveAddress(
			inboxId,
			conversationId
		)
		if (!result) {
			result = await this.xmtpResolver.resolveAddress(inboxId, conversationId)
		}
		return result
	}

	// === ENS Resolution Methods ===

	/**
	 * Resolve an ENS name to an Ethereum address
	 */
	async resolveENSName(ensName: string): Promise<Address | null> {
		return this.ensResolver.resolveENSName(ensName)
	}

	/**
	 * Resolve an address to its primary ENS name (reverse resolution)
	 */
	async resolveAddressToENS(address: Address): Promise<string | null> {
		return this.ensResolver.resolveAddressToENS(address)
	}

	/**
	 * Get ENS avatar for a given ENS name
	 */
	async getENSAvatar(ensName: string): Promise<string | null> {
		return this.ensResolver.getENSAvatar(ensName)
	}

	/**
	 * Get ENS text record for a given ENS name and key
	 */
	async getENSTextRecord(ensName: string, key: string): Promise<string | null> {
		return this.ensResolver.getENSTextRecord(ensName, key)
	}

	/**
	 * Get complete ENS profile for a given ENS name
	 */
	async getENSProfile(ensName: string) {
		return this.ensResolver.getENSProfile(ensName)
	}

	// === Basename Resolution Methods ===

	/**
	 * Get basename from an Ethereum address
	 */
	async getBasename(address: Address): Promise<string | null> {
		return this.basenameResolver.getBasename(address)
	}

	/**
	 * Get basename avatar for a given basename
	 */
	async getBasenameAvatar(basename: BaseName): Promise<string | null> {
		return this.basenameResolver.getBasenameAvatar(basename)
	}

	/**
	 * Get basename text record for a given basename and key
	 */
	async getBasenameTextRecord(
		basename: BaseName,
		key: BasenameTextRecordKey
	): Promise<string | null> {
		return this.basenameResolver.getBasenameTextRecord(basename, key)
	}

	/**
	 * Resolve basename to an Ethereum address
	 */
	async getBasenameAddress(basename: BaseName): Promise<Address | null> {
		return this.basenameResolver.getBasenameAddress(basename)
	}

	/**
	 * Get basename metadata for a given basename
	 */
	async getBasenameMetadata(basename: BaseName) {
		return this.basenameResolver.getBasenameMetadata(basename)
	}

	/**
	 * Get complete basename profile for a given address
	 */
	async resolveBasenameProfile(address: Address) {
		return this.basenameResolver.resolveBasenameProfile(address)
	}

	// === XMTP Message Methods ===

	/**
	 * Find any message by ID with caching
	 */
	async findMessage(messageId: string): Promise<XmtpMessage | null> {
		return this.xmtpResolver.findMessage(messageId)
	}

	/**
	 * Find root message by ID (traverses reply chain)
	 */
	async findRootMessage(messageId: string): Promise<XmtpMessage | null> {
		return this.xmtpResolver.findRootMessage(messageId)
	}

	// === Universal Resolution Methods ===

	/**
	 * Universal name resolution - tries to resolve any name (ENS or basename) to an address
	 */
	async resolveName(name: string): Promise<Address | null> {
		// Try ENS first (more common)
		if (name.endsWith(".eth")) {
			return this.resolveENSName(name)
		}

		// Try basename
		if (name.endsWith(".base.eth")) {
			return this.getBasenameAddress(name)
		}

		// If no TLD, try both
		const ensResult = await this.resolveENSName(name)
		if (ensResult) {
			return ensResult
		}

		return this.getBasenameAddress(name)
	}

	/**
	 * Universal reverse resolution - tries to resolve an address to any name (ENS or basename)
	 */
	async resolveAddressToName(address: Address): Promise<string | null> {
		// Try basename first (more relevant for this project)
		const basename = await this.getBasename(address)
		if (basename) {
			return basename
		}

		// Try ENS as fallback
		return this.resolveAddressToENS(address)
	}

	/**
	 * Get complete profile for an address (combines ENS and basename data)
	 */
	async getCompleteProfile(address: Address) {
		const [ensName, basename, ensProfile, basenameProfile] =
			await Promise.allSettled([
				this.resolveAddressToENS(address),
				this.getBasename(address),
				this.resolveAddressToENS(address).then((name) =>
					name ? this.getENSProfile(name) : null
				),
				this.resolveBasenameProfile(address)
			])

		return {
			address,
			ensName: ensName.status === "fulfilled" ? ensName.value : null,
			basename: basename.status === "fulfilled" ? basename.value : null,
			ensProfile: ensProfile.status === "fulfilled" ? ensProfile.value : null,
			basenameProfile:
				basenameProfile.status === "fulfilled" ? basenameProfile.value : null
		}
	}

	// === Cache Management Methods ===

	/**
	 * Pre-populate all resolver caches
	 */
	async prePopulateAllCaches(): Promise<void> {
		await Promise.allSettled([
			this.addressResolver.prePopulateCache(),
			this.xmtpResolver.prePopulateCache()
		])
	}

	/**
	 * Create a complete XmtpSender object from an address or inboxId
	 * Uses the resolver to get the best available name and profile information
	 */
	async createXmtpSender(
		addressOrInboxId: string,
		conversationId?: string
	): Promise<XmtpSender> {
		let address: `0x${string}` | null = null
		let inboxId = addressOrInboxId

		// Check if input looks like an Ethereum address
		if (addressOrInboxId.startsWith("0x") && addressOrInboxId.length === 42) {
			address = addressOrInboxId as `0x${string}`
			// When we have an address, we need to find the actual inboxId
			// For now, use address as fallback but this should be resolved from XMTP
			inboxId = addressOrInboxId // This will be improved when we have proper address->inboxId resolution
		} else {
			// Assume it's an inboxId, try to resolve to address
			address = await this.resolveAddress(addressOrInboxId, conversationId)
		}

		// Get the best available name using universal resolution
		let name = "Unknown"
		let basename: string | undefined

		if (address) {
			// Try basename first since that's what we expect for this address
			const basenameResult = await this.getBasename(address)
			logger.debug(
				`🔍 [RESOLVER] Direct basename lookup for ${address}:`,
				basenameResult
			)

			// Try to get a human-readable name
			const resolvedName = await this.resolveAddressToName(address)
			logger.debug(
				`🔍 [RESOLVER] Universal name resolution for ${address}:`,
				resolvedName
			)

			if (resolvedName) {
				name = resolvedName
				// Check if it's a basename specifically
				if (resolvedName.endsWith(".base.eth")) {
					basename = resolvedName
				}
			} else {
				// Fallback to shortened address
				name = `${address.slice(0, 6)}...${address.slice(-4)}`
			}

			// Always try to get basename even if ENS was found
			if (!basename) {
				const resolvedBasename = await this.getBasename(address)
				basename = resolvedBasename || undefined
			}
		} else {
			// No address resolution available, use inboxId
			name = `${inboxId.slice(0, 8)}...${inboxId.slice(-4)}`
		}

		return {
			address: address || addressOrInboxId,
			inboxId,
			name,
			basename
		}
	}
}
