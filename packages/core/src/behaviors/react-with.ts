import type { BehaviorContext, BehaviorFactory } from "@hybrd/types"

/**
 * Configuration for the reactWith behavior
 */
export interface ReactWithConfig {
	/** The emoji or reaction to add to messages */
	reaction: string
	/** Whether to react to all messages or only specific ones */
	reactToAll?: boolean
	/** Optional filter function to determine if a message should get a reaction */
	filter?: (context: BehaviorContext) => boolean | Promise<boolean>
}

/**
 * Creates a behavior that reacts to messages with a specified emoji
 */
export const reactWith: BehaviorFactory<ReactWithConfig> = (config) => {
	return {
		id: `react-with-${config.reaction}`,
		name: `React with ${config.reaction}`,
		description: `Automatically react with ${config.reaction} to incoming messages`,
		config: {
			enabled: config.enabled ?? true,
			config: {
				reaction: config.reaction,
				reactToAll: config.reactToAll ?? true,
				filter: config.filter?.toString()
			}
		},
		preResponse: true,
		postResponse: false,
		async execute(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// Check if we should react to this message
			if (!config.reactToAll && config.filter) {
				const shouldReact = await config.filter(context)
				if (!shouldReact) return
			}

			try {
				// For now, just log the reaction
				// TODO: Implement proper XMTP reaction API when available
				console.log(
					`🤖 Would react with ${config.reaction} to message ${context.message.id}`
				)

				// Alternative approach: send a reaction as a text message
				// await context.conversation.send(`${config.reaction}`)
			} catch (error) {
				// Log error but don't fail the behavior execution
				console.error(`Failed to add reaction ${config.reaction}:`, error)
			}
		}
	}
}
