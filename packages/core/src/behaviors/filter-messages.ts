import type { BehaviorContext, BehaviorObject } from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { filter } from "@hybrd/xmtp"

// Filter interface that matches XMTP SDK signatures
interface FilterAPI {
	fromSelf(): boolean
	hasContent(): boolean
	isDM(): boolean
	isGroup(): boolean
	isGroupAdmin(): boolean
	isGroupSuperAdmin(): boolean
	isReaction(): boolean
	isRemoteAttachment(): boolean
	isReply(): boolean
	isText(): boolean
	isTextReply(): boolean
	hasMention(mention: string): boolean
}

export function filterMessages(
	filters: (api: FilterAPI) => boolean
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
				fromSelf: () =>
					filter.fromSelf(context.message as any, context.client as any),
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
				isReaction: () => filter.isReaction(context.message as any),
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
				}
			}

			try {
				const passes = filters(filterAPI)

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
