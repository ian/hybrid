import type { BasenameResolver } from "../resolver/basename-resolver"
import type { ENSResolver } from "../resolver/ens-resolver"
import { logger } from "@hybrd/utils"

/**
 * Extract basenames/ENS names from message content using @mention pattern
 * @param content The message content to parse
 * @returns Array of unique names found in the message
 */
export function extractMentionedNames(content: string): string[] {
	// Match @basename.eth and @basename.base.eth patterns (case insensitive)
	const nameRegex = /@([a-zA-Z0-9-_]+\.(?:base\.)?eth)\b/gi
	const matches = content.match(nameRegex)

	if (!matches) {
		return []
	}

	// Remove @ symbol and deduplicate
	const names = matches.map((match) => match.slice(1).toLowerCase())
	return [...new Set(names)]
}

/**
 * Resolve mentioned names to addresses and return as subjects object
 * @param mentionedNames Array of names to resolve
 * @param basenameResolver Basename resolver instance
 * @param ensResolver ENS resolver instance
 * @returns Promise that resolves to subjects object mapping names to addresses
 */
export async function resolveSubjects(
	mentionedNames: string[],
	basenameResolver: BasenameResolver,
	ensResolver: ENSResolver
): Promise<Record<string, `0x${string}`>> {
	const subjects: Record<string, `0x${string}`> = {}

	if (mentionedNames.length === 0) {
		return subjects
	}

	logger.debug(
		`🔍 Found ${mentionedNames.length} name mentions:`,
		mentionedNames
	)

	for (const mentionedName of mentionedNames) {
		try {
			let resolvedAddress: string | null = null

			// Check if it's an ENS name (.eth but not .base.eth)
			if (ensResolver.isENSName(mentionedName)) {
				logger.debug(`🔍 Resolving ENS name: ${mentionedName}`)
				resolvedAddress = await ensResolver.resolveENSName(mentionedName)
			} else {
				// It's a basename (.base.eth or other format)
				logger.debug(`🔍 Resolving basename: ${mentionedName}`)
				resolvedAddress =
					await basenameResolver.getBasenameAddress(mentionedName)
			}

			if (resolvedAddress) {
				subjects[mentionedName] = resolvedAddress as `0x${string}`
				logger.debug(`✅ Resolved ${mentionedName} → ${resolvedAddress}`)
			} else {
				logger.debug(`❌ Could not resolve address for: ${mentionedName}`)
			}
		} catch (error) {
			console.error(`❌ Error resolving ${mentionedName}:`, error)
		}
	}

	return subjects
}

/**
 * Extract subjects from message content (combines extraction and resolution)
 * @param content The message content to parse
 * @param basenameResolver Basename resolver instance
 * @param ensResolver ENS resolver instance
 * @returns Promise that resolves to subjects object mapping names to addresses
 */
export async function extractSubjects(
	content: string,
	basenameResolver: BasenameResolver,
	ensResolver: ENSResolver
): Promise<Record<string, `0x${string}`>> {
	const mentionedNames = extractMentionedNames(content)
	return await resolveSubjects(mentionedNames, basenameResolver, ensResolver)
}
