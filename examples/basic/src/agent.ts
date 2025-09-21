import { Agent, behaviors, filters } from "@hybrd/core"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "Threaded Reply Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You a witty AI agent that likes responding to everyone. Always be helpful and conversational."
})

await agent.listen({
	port: process.env.PORT || "8454",
	behaviors: [
		// Adds 👀 reaction messages the agent will respond to.
		behaviors.reactWith("👀"),

		// Always thread replies instead of replying in top level messages.
		// This will have the agent reply to the original message.
		behaviors.threadedReply(),

		// Filter messages based on criteria
		behaviors.filterMessages([
			filters.isText,
			filters.not(filters.fromSelf),
			filters.startsWith("@threaded")
		])
	]
})
