import type { Behavior, BehaviorContext, BehaviorObject } from "@hybrd/types"

/**
 * Configuration for the threadedReply behavior
 */
export interface ThreadedReplyConfig {
	/** Whether the behavior is enabled */
	enabled?: boolean
	/** Whether to always thread replies */
	alwaysThread?: boolean
	/** Optional filter function to determine when to thread replies */
	filter?: (context: BehaviorContext) => boolean | Promise<boolean>
	/** Custom threading logic */
	customThreadId?: (context: BehaviorContext) => string | Promise<string>
}

/**
 * Creates a behavior that ensures replies are threaded to the original message
 */
export const threadedReply: Behavior<ThreadedReplyConfig> = (
	config: ThreadedReplyConfig
): BehaviorObject => {
	return {
		id: "threaded-reply",
		config: {
			enabled: config.enabled ?? true,
			config: {
				alwaysThread: config.alwaysThread ?? true,
				filter: config.filter?.toString(),
				customThreadId: config.customThreadId?.toString()
			}
		},
		async post(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// Check if we should thread this response
			if (!config.alwaysThread && config.filter) {
				const shouldThread = await config.filter(context)
				if (!shouldThread) return
			}

			// Set send options to enable threading
			if (context.sendOptions) {
				context.sendOptions.threaded = true
			}
		}
	}
}
