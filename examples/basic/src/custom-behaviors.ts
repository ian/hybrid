/**
 * Custom Behaviors Example
 *
 * This file demonstrates how to create your own custom behaviors
 * to extend your agent's functionality.
 */

import type { Behavior, BehaviorContext, BehaviorObject } from "@hybrd/types"

/**
 * Example: Auto-Reply Behavior
 *
 * Sends an automatic reply to certain messages without involving the main agent
 */
export const autoReply: Behavior<{
	message: string
	trigger?: string
}> = (config) => {
	return {
		id: "auto-reply",
		name: "Auto Reply",
		description: "Sends automatic replies to specific messages",
		config: { enabled: config.enabled ?? true },

		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			// Check if message matches trigger
			if (config.trigger && !context.message.content.includes(config.trigger)) {
				return
			}

			// Send automatic reply
			await context.conversation.send(config.message)
		}
	} as BehaviorObject
}

/**
 * Example: Message Logger Behavior
 *
 * Logs all incoming messages for analytics or debugging
 */
export const messageLogger: Behavior<{
	logLevel?: "debug" | "info" | "warn"
}> = (config) => {
	return {
		id: "message-logger",
		name: "Message Logger",
		description: "Logs incoming messages for analytics",
		config: { enabled: config.enabled ?? true },

		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			const logLevel = config.logLevel ?? "info"
			const logMessage = `[${logLevel.toUpperCase()}] Message from ${context.message.senderInboxId}: ${context.message.content}`

			switch (logLevel) {
				case "debug":
					console.debug(logMessage)
					break
				case "warn":
					console.warn(logMessage)
					break
				default:
					console.log(logMessage)
			}
		}
	} as BehaviorObject
}

/**
 * Example: Rate Limiter Behavior
 *
 * Prevents the agent from responding too frequently to the same user
 */
export const rateLimiter: Behavior<{
	maxResponsesPerMinute?: number
	userCooldownMs?: number
}> = (config) => {
	const userLastResponse = new Map<string, number>()
	const maxResponses = config.maxResponsesPerMinute ?? 5
	const cooldownMs = config.userCooldownMs ?? 60000

	return {
		id: "rate-limiter",
		name: "Rate Limiter",
		description: "Prevents spam responses to the same user",
		config: { enabled: config.enabled ?? true },

		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			const senderId = context.message.senderInboxId
			const now = Date.now()
			const lastResponse = userLastResponse.get(senderId) ?? 0

			// Check if user is in cooldown period
			if (now - lastResponse < cooldownMs) {
				console.log(`⏰ Rate limiting user ${senderId}`)
				// Don't throw error, just skip processing
				return
			}

			// Update last response time
			userLastResponse.set(senderId, now)
		}
	} as BehaviorObject
}

/**
 * Example: Content Filter Behavior
 *
 * Filters out inappropriate content or spam
 */
export const contentFilter: Behavior<{
	blockedWords?: string[]
	allowList?: string[]
}> = (config) => {
	return {
		id: "content-filter",
		name: "Content Filter",
		description: "Filters out inappropriate content",
		config: { enabled: config.enabled ?? true },

		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			const content = context.message.content.toLowerCase()
			const blockedWords = config.blockedWords ?? ["spam", "scam"]

			// Check for blocked words
			for (const word of blockedWords) {
				if (content.includes(word)) {
					console.log(`🚫 Blocked message containing: ${word}`)
					// Skip processing this message
					return
				}
			}

			// Check allowlist (if provided, only allow messages from these users)
			if (
				config.allowList &&
				!config.allowList.includes(context.message.senderInboxId)
			) {
				console.log(`🚫 Message from non-allowlisted user`)
				return
			}
		}
	} as BehaviorObject
}

/**
 * Example: Emoji Counter Behavior
 *
 * Counts and reacts to messages with lots of emojis
 */
export const emojiCounter: Behavior<{
	minEmojis?: number
}> = (config) => {
	const minEmojis = config.minEmojis ?? 3

	return {
		id: "emoji-counter",
		name: "Emoji Counter",
		description: "Reacts to messages with lots of emojis",
		config: { enabled: config.enabled ?? true },

		async pre(context: BehaviorContext) {
			// Check if behavior is enabled
			if (!this.config.enabled) return

			const emojiCount = (
				context.message.content.match(
					/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu
				) || []
			).length

			if (emojiCount >= minEmojis) {
				console.log(`🎉 Message with ${emojiCount} emojis detected!`)
				// Could send a special response or reaction here
				await context.conversation.send("Wow, so many emojis! 😍")
			}
		}
	} as BehaviorObject
}
