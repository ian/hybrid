import type {
	BehaviorContext,
	BehaviorObject,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { filter } from "@hybrd/xmtp"

// Type alias to avoid circular reference
type FilterType = typeof filter
type Filter = FilterType[keyof FilterType]

export function filterMessages(
	filters: Filter[] | ((filter: FilterType) => Filter[])
): BehaviorObject {
	// Resolve filters to array format
	const filterArray: Filter[] =
		typeof filters === "function" ? filters(filter) : filters

	return {
		id: "filter-messages",
		config: {
			enabled: true,
			config: {
				filters: filterArray.length
			}
		},
		async pre(context: BehaviorContext) {
			const messageContent =
				typeof context.message.content === "string"
					? context.message.content.substring(0, 100)
					: String(context.message.content || "unknown")
			logger.debug(
				`🔍 [filter-messages] Processing message: ${messageContent}...`
			)

			if (filterArray.length === 0) {
				logger.debug(
					`🔍 [filter-messages] No filters configured, continuing chain`
				)
				// No filters, continue to next behavior
				await context.next?.()
				return
			}

			logger.debug(
				`🔍 [filter-messages] Evaluating ${filterArray.length} filters`
			)

			for (let i = 0; i < filterArray.length; i++) {
				const filterFn = filterArray[i]
				logger.debug(
					`🔍 [filter-messages] Evaluating filter ${i + 1}/${filterArray.length}`
				)

				try {
					const passes = await executeFilter(
						filterFn,
						context.message,
						context.client,
						context.conversation
					)

					if (!passes) {
						logger.debug(
							`🔇 [filter-messages] Filter ${i + 1} failed - message filtered out`
						)
						// Message filtered, set flag and stop the chain
						if (!context.sendOptions) {
							context.sendOptions = {}
						}
						context.sendOptions.filtered = true
						// Don't call next() - this stops the middleware chain
						return
					}

					logger.debug(`✅ [filter-messages] Filter ${i + 1} passed`)
				} catch (error) {
					logger.error("Error executing message filter:", error)
				}
			}

			logger.debug(`✅ [filter-messages] All filters passed, continuing chain`)
			// All filters passed, continue to next behavior
			await context.next?.()
		}
	}
}

// Execute XMTP filters with their correct signatures based on filter name
async function executeFilter(
	filterFn: Filter,
	message: XmtpMessage,
	client: XmtpClient,
	conversation: XmtpConversation
): Promise<boolean> {
	// Extract filter name - need to handle the complex Filter type
	const filterObj = filter as never as Record<string, unknown>
	const filterName =
		filterObj.name || String(filterFn).match(/function (\w+)/)?.[1] || "unknown"

	logger.debug(`🔍 [filter-messages] Executing filter: ${filterName}`)

	// Type-safe execution based on known filter signatures
	switch (filterName) {
		case "isDM":
		case "isGroup":
			// 3-parameter MessageFilter signature
			return Boolean(
				await (
					filterFn as (
						m: XmtpMessage,
						c: XmtpClient,
						cv: XmtpConversation
					) => boolean | Promise<boolean>
				)(message, client, conversation)
			)

		case "fromSelf":
			// 2-parameter signature
			return Boolean(
				await (
					filterFn as (
						m: XmtpMessage,
						c: XmtpClient
					) => boolean | Promise<boolean>
				)(message, client)
			)

		case "isText":
		case "isReply":
		case "isReaction":
		case "isRemoteAttachment":
		case "hasDefinedContent":
		case "isTextReply":
			// 1-parameter signature
			return Boolean(
				await (filterFn as (m: XmtpMessage) => boolean | Promise<boolean>)(
					message
				)
			)

		case "or":
		case "and":
		case "not":
			// These are higher-order functions that return MessageFilter functions
			// They should be called with 3 parameters
			return Boolean(
				await (
					filterFn as (
						m: XmtpMessage,
						c: XmtpClient,
						cv: XmtpConversation
					) => boolean | Promise<boolean>
				)(message, client, conversation)
			)

		default:
			// Unknown filter - try to handle gracefully, but log warning
			logger.warn(
				`⚠️ [filter-messages] Unknown filter function: ${filterName}. This may be a test mock or custom filter.`
			)

			// For test compatibility, try 3 parameters first (MessageFilter signature)
			try {
				return Boolean(await filterFn(message, client, conversation))
			} catch {
				// If 3 params fail, try 1 param
				logger.debug(
					`🔍 [filter-messages] 3-param call failed for ${filterName}, trying 1 param`
				)
				return Boolean(await filterFn(message))
			}
	}
}
