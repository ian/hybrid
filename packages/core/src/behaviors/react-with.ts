import type { BehaviorContext, BehaviorObject } from "@hybrd/types"

export interface ReactWithOptions {
	reactToAll?: boolean
	filter?: (context: BehaviorContext) => boolean | Promise<boolean>
	enabled?: boolean
}

export function reactWith(
	reaction: string,
	options: ReactWithOptions = {}
): BehaviorObject {
	return {
		id: `react-with-${reaction}`,
		config: {
			enabled: options.enabled ?? true,
			config: {
				reaction,
				reactToAll: options.reactToAll ?? true,
				filter: options.filter?.toString()
			}
		},
		async pre(context: BehaviorContext) {
			if (!this.config.enabled) return

			if (!options.reactToAll && options.filter) {
				const shouldReact = await options.filter(context)
				if (!shouldReact) return
			}

			try {
				console.log(
					`🤖 Would react with ${reaction} to message ${context.message.id}`
				)
			} catch (error) {
				console.error(`Failed to add reaction ${reaction}:`, error)
			}
		}
	}
}
