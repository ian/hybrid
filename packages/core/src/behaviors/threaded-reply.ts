import type { BehaviorContext, BehaviorFactory } from "@hybrd/types"

/**
 * Configuration for the threadedReply behavior
 */
export interface ThreadedReplyConfig {
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
export const threadedReply: BehaviorFactory<ThreadedReplyConfig> = (config) => {
	return {
		id: "threaded-reply",
		name: "Threaded Reply",
		description: "Ensures all replies are threaded to the original message",
		config: {
			enabled: config.enabled ?? true,
			config: {
				alwaysThread: config.alwaysThread ?? true,
				filter: config.filter?.toString(),
				customThreadId: config.customThreadId?.toString()
			}
		},
		preResponse: false,
		postResponse: true,
		async execute(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// Check if we should thread this response
			if (!config.alwaysThread && config.filter) {
				const shouldThread = await config.filter(context)
				if (!shouldThread) return
			}

			// Threaded reply behavior doesn't need to do anything special
			// The actual threading is handled by the XMTP plugin when sending the response
			// This behavior serves as a configuration marker for the system
		}
	}
}
