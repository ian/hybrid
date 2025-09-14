import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "My Hybrid Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a XMTP agent that responds to messages and reactions. Try and be as conversational as possible."
})

agent.listen({
	port: process.env.PORT || "8454"
})
