import type {
	Behavior,
	BehaviorContext,
	BehaviorObject,
	XMTPFilter
} from "@hybrd/types"

/**
 * Options for the messageFilter behavior
 */
export interface MessageFilterOptions {
	/** Array of filter functions to apply */
	filters: XMTPFilter[]
	/** Whether the behavior is enabled */
	enabled?: boolean
}

/**
 * Creates a behavior that filters messages based on provided filter functions
 */
const createMessageFilterBehavior: Behavior<MessageFilterOptions> = (
	config: MessageFilterOptions
): BehaviorObject => {
	const { filters } = config

	return {
		id: "message-filter",
		config: {
			enabled: config.enabled ?? true,
			config: {
				filters: filters.length
			}
		},
		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// If no filters, allow all messages
			if (filters.length === 0) return

			// Apply all filters - if any filter returns false, stop processing
			for (const filter of filters) {
				try {
					const passes = await filter(
						context.message,
						context.client,
						context.conversation
					)
					if (!passes) {
						// Set a flag to indicate this message should be filtered out
						// We can't directly stop execution here, but we can mark it
						context.sendOptions = context.sendOptions || {}
						context.sendOptions.filtered = true
						break
					}
				} catch (error) {
					console.error("Error executing message filter:", error)
					// Continue with other filters on error
				}
			}
		}
	}
}

export function filterMessages(filters: XMTPFilter[]): BehaviorObject {
	return createMessageFilterBehavior({ filters })
}
