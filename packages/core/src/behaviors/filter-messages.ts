import type { BehaviorContext, BehaviorObject } from "@hybrd/types"
import { logger } from "@hybrd/utils"
import {
	type Conversation,
	type DecodedMessage,
	type Reaction,
	filter
} from "@hybrd/xmtp"

// Filter interface that matches XMTP SDK signatures
interface FilterAPI {
	hasContent(): boolean
	isDM(): boolean
	isGroup(): boolean
	isGroupAdmin(): boolean
	isGroupSuperAdmin(): boolean
	isReaction(): boolean
	isReaction(emoji?: string, action?: "added" | "removed"): boolean
	isRemoteAttachment(): boolean
	isReply(): boolean
	isText(): boolean
	isTextReply(): boolean
	hasMention(mention: string): boolean
	isFromSelf(): boolean
	isFrom(address: `0x${string}`): Promise<boolean>
}

export function filterMessages(
	filters: (api: FilterAPI) => boolean | Promise<boolean>
): BehaviorObject {
	return {
		id: "filter-messages",
		config: {
			enabled: true,
			config: {
				filters: 1
			}
		},
		async before(context: BehaviorContext) {
			const messageContent =
				typeof context.message.content === "string"
					? context.message.content.substring(0, 100)
					: String(context.message.content || "unknown")

			logger.debug(
				`🔍 [filter-messages] Processing message: ${messageContent}...`
			)

			// Create filter API wrapper
			const filterAPI: FilterAPI = {
				hasContent: () =>
					filter.hasContent(
						context.message as unknown as DecodedMessage<unknown>
					),
				isDM: () =>
					filter.isDM(context.conversation as unknown as Conversation<unknown>),
				isGroup: () =>
					filter.isGroup(
						context.conversation as unknown as Conversation<unknown>
					),
				isGroupAdmin: () =>
					filter.isGroupAdmin(
						context.conversation as unknown as Conversation<unknown>,
						context.message as unknown as DecodedMessage<unknown>
					),
				isGroupSuperAdmin: () =>
					filter.isGroupSuperAdmin(
						context.conversation as unknown as Conversation<unknown>,
						context.message as unknown as DecodedMessage<unknown>
					),
				isReaction: (emoji?: string, action?: "added" | "removed") => {
					const isReaction = filter.isReaction(
						context.message as unknown as DecodedMessage<unknown>
					)
					if (!isReaction) return false

					// Check if message has reaction content
					if (
						!context.message.content ||
						typeof context.message.content !== "object"
					)
						return false

					const reactionContent = context.message.content as Reaction

					// Validate reaction content structure
					if (!reactionContent.content) return false

					// Check emoji if specified
					if (emoji && reactionContent.content !== emoji) return false

					// Check action if specified
					if (action && reactionContent.action !== action) return false

					// If no specific checks requested, just return true
					if (!emoji && !action) return true

					return true
				},
				isRemoteAttachment: () =>
					filter.isRemoteAttachment(
						context.message as unknown as DecodedMessage<unknown>
					),
				isReply: () =>
					filter.isReply(context.message as unknown as DecodedMessage<unknown>),
				isText: () =>
					filter.isText(context.message as unknown as DecodedMessage<unknown>),
				isTextReply: () =>
					filter.isTextReply(
						context.message as unknown as DecodedMessage<unknown>
					),
				hasMention: (mention: string) => {
					const content =
						typeof context.message.content === "string"
							? context.message.content
							: String(context.message.content || "")
					return content.includes(mention)
				},
				isFromSelf: () =>
					context.message.senderInboxId === context.client.inboxId,
				isFrom: async (address: `0x${string}`) => {
					const normalizedAddress = address.toLowerCase()
					const senderAddress = context.runtime.sender?.address?.toLowerCase()
					return senderAddress === normalizedAddress
				}
			}

			try {
				const passes = await filters(filterAPI)

				if (!passes) {
					logger.debug(
						`🔇 [filter-messages] Filter failed - message filtered out`
					)
					// Message filtered, set flag and stop the chain
					if (!context.sendOptions) {
						context.sendOptions = {}
					}
					context.sendOptions.filtered = true
					// Don't call next() - this stops the middleware chain
					return
				}

				logger.debug(`✅ [filter-messages] Filter passed`)
			} catch (error) {
				logger.error("Error executing message filter:", error)
				throw error // Re-throw to propagate the error
			}

			logger.debug(`✅ [filter-messages] Filter passed, continuing chain`)
			// Filter passed, continue to next behavior
			await context.next?.()
		}
	}
}
