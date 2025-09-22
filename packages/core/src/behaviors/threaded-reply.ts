import type { BehaviorContext, BehaviorObject } from "@hybrd/types"

export interface ThreadedReplyOptions {
	enabled?: boolean
}

export function threadedReply(
	options: ThreadedReplyOptions = {}
): BehaviorObject {
	return {
		id: "threaded-reply",
		config: {
			enabled: options.enabled ?? true,
			config: {
				alwaysThread: true
			}
		},
		async after(context: BehaviorContext) {
			if (!this.config.enabled) return

			if (!context.sendOptions) {
				context.sendOptions = {}
			}
			context.sendOptions.threaded = true
		}
	}
}
