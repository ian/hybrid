import type { BehaviorContext, BehaviorObject, XMTPFilter } from "@hybrd/types"
import { filter } from "@hybrd/xmtp"

// Type alias to avoid circular reference
type FilterType = typeof filter

export function filterMessages(
	filters: XMTPFilter[] | ((filter: FilterType) => XMTPFilter[])
): BehaviorObject {
	// Resolve filters to array format
	const filterArray: XMTPFilter[] =
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
			if (filterArray.length === 0) {
				// No filters, continue to next behavior
				await context.next?.()
				return
			}

			for (const filterFn of filterArray) {
				try {
					const passes = await filterFn(
						context.message,
						context.client,
						context.conversation
					)
					if (!passes) {
						// Message filtered, set flag and stop the chain
						if (!context.sendOptions) {
							context.sendOptions = {}
						}
						context.sendOptions.filtered = true
						// Don't call next() - this stops the middleware chain
						return
					}
				} catch (error) {
					console.error("Error executing message filter:", error)
				}
			}

			// All filters passed, continue to next behavior
			await context.next?.()
		}
	}
}
