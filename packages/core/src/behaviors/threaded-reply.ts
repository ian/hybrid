import type { BehaviorContext, BehaviorObject } from "@hybrd/types"

export function threadedReply(): BehaviorObject {
	return {
		id: "threaded-reply",
		config: {
			enabled: true,
			config: {
				alwaysThread: true
			}
		},
		async post(context: BehaviorContext) {
			// Check if message was filtered out by filterMessages behavior
			if (context.sendOptions?.filtered) {
				return
			}

			if (!context.sendOptions) {
				context.sendOptions = {}
			}
			context.sendOptions.threaded = true
		}
	}
}
