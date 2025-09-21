import type { BehaviorContext, BehaviorObject } from "@hybrd/types"
import { logger } from "@hybrd/utils"
import { ContentTypeReaction } from "@hybrd/xmtp"

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

			// Check if message was filtered out by filterMessages behavior
			if (context.sendOptions?.filtered) {
				logger.debug(
					`🔇 [react-with] Skipping reaction due to message being filtered`
				)
				return
			}

			if (!options.reactToAll && options.filter) {
				const shouldReact = await options.filter(context)
				if (!shouldReact) return
			}

			try {
				const reactionMessage = {
					schema: "unicode",
					reference: context.message.id,
					action: "added",
					contentType: ContentTypeReaction,
					content: reaction
				}

				await context.conversation.send(reactionMessage, ContentTypeReaction)
				logger.debug(
					`✅ [react-with] Reacted with ${reaction} to message ${context.message.id}`
				)
			} catch (error) {
				logger.error(
					`❌ [react-with] Failed to add reaction ${reaction}:`,
					error
				)
			}
		}
	}
}
