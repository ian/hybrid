import type { Behavior, BehaviorContext, BehaviorObject } from "@hybrd/types"

/**
 * Options for the reactWith behavior
 */
export interface ReactWithOptions {
	/** Whether to react to all messages or only specific ones */
	reactToAll?: boolean
	/** Optional filter function to determine if a message should get a reaction */
	filter?: (context: BehaviorContext) => boolean | Promise<boolean>
	/** Whether the behavior is enabled */
	enabled?: boolean
}

/**
 * Creates a behavior that reacts to messages with a specified emoji
 */
const createReactWithBehavior: Behavior<{
	reaction: string
	options?: ReactWithOptions
}> = (config: {
	reaction: string
	options?: ReactWithOptions
}): BehaviorObject => {
	const reaction = config.reaction
	const options = config.options ?? {}

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
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// Check if we should react to this message
			if (!options.reactToAll && options.filter) {
				const shouldReact = await options.filter(context)
				if (!shouldReact) return
			}

			try {
				// For now, just log the reaction
				// TODO: Implement proper XMTP reaction API when available
				console.log(
					`🤖 Would react with ${reaction} to message ${context.message.id}`
				)

				// Alternative approach: send a reaction as a text message
				// await context.conversation.send(`${reaction}`)
			} catch (error) {
				// Log error but don't fail the behavior execution
				console.error(`Failed to add reaction ${reaction}:`, error)
			}
		}
	}
}

/**
 * Convenience overload for reactWith with just the reaction
 */
export function reactWith(reaction: string): BehaviorObject
/**
 * Convenience overload for reactWith with reaction and options
 */
export function reactWith(
	reaction: string,
	options: ReactWithOptions
): BehaviorObject
/**
 * Implementation of reactWith
 */
export function reactWith(
	reaction: string,
	options?: ReactWithOptions
): BehaviorObject {
	return createReactWithBehavior({ reaction, options })
}
