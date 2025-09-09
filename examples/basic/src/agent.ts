import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, type MessageListenerConfig } from "hybrid"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "My Hybrid Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a XMTP agent that responds to messages and reactions. Try and be as conversational as possible."
})

const filter: MessageListenerConfig["filter"] = async ({ message }) => {
	return true

	// const messageContent = message.content?.toString()
	// const contentTypeId = message.contentType?.typeId

	// // Example of how to check for a @bot mention
	// if (contentTypeId === "text") {
	// 	const lowerContent = messageContent?.toLowerCase()
	// 	const mentionPatterns = ["@bot"]

	// 	return mentionPatterns.some((pattern) => lowerContent?.includes(pattern))
	// }

	// // Example of how to check for a reaction
	// if (contentTypeId === "reaction") {
	// 	const { content, action } = message.content as Reaction
	// 	return action === "added" && content === "🚀"
	// }

	// return false
}

agent.listen({
	port: process.env.PORT || "8454",
	filter
})
