import type { BehaviorContext, BehaviorObject } from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { filter } from "@hybrd/xmtp"

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
				hasContent: () => filter.hasContent(context.message as any),
				isDM: () => filter.isDM(context.conversation as any),
				isGroup: () => filter.isGroup(context.conversation as any),
				isGroupAdmin: () =>
					filter.isGroupAdmin(
						context.conversation as any,
						context.message as any
					),
				isGroupSuperAdmin: () =>
					filter.isGroupSuperAdmin(
						context.conversation as any,
						context.message as any
					),
				isReaction: (emoji?: string, action?: "added" | "removed") => {
					const isReaction = filter.isReaction(context.message as any)
					if (!isReaction) return false

					// Check if message has reaction content
					if (
						!context.message.content ||
						typeof context.message.content !== "object"
					)
						return false

					const reactionContent = context.message.content as any

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
					filter.isRemoteAttachment(context.message as any),
				isReply: () => filter.isReply(context.message as any),
				isText: () => filter.isText(context.message as any),
				isTextReply: () => filter.isTextReply(context.message as any),
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
