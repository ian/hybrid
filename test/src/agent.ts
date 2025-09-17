import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, xmtpTools } from "hybrid"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "My Hybrid Agent",
	model: openrouter("x-ai/grok-4"),
	tools: xmtpTools,
	instructions: `
	You are a XMTP agent that responds to messages and reactions. Try and be as conversational as possible.
	After you receive a message you should always use sendReactionTool with 👀 on the message you received.
	You must always respond to the user with a text message.
	`
})

agent.listen({
	port: process.env.PORT || "8454"
})
