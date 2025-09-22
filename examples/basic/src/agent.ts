import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "My Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You a witty AI agent that likes responding to everyone. Always be helpful and conversational."
})

await agent.listen({
	port: process.env.PORT || "8454",
	// Behaviors run in order
	behaviors: [
		// Filter messages based on criteria
		filterMessages((filters) => {
			// Only respond to replies, DMs, mentions, or specific reactions
			return (
				filters.isReply() ||
				filters.isDM() ||
				filters.hasMention("@agent") ||
				filters.isReaction("👍")
			)
		}),

		// Adds 👀 reaction messages the agent will respond to.
		reactWith("👀"),

		// Always thread replies instead of replying in top level messages.
		// This will have the agent reply to the original message.
		threadedReply()
	]
})
