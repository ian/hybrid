import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, type MessageListenerConfig, type Reaction } from "hybrid"

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
	const messageContent = message.content?.toString()
	const contentTypeId = message.contentType?.typeId
	const isMessage = contentTypeId === "text"
	const isReaction = contentTypeId === "reaction"
	const isReply = contentTypeId === "reply"

	if (isReply) {
		return true
	}

	if (isReaction) {
		const { content, action } = message.content as Reaction

		if (action === "added") {
			if (content.toLowerCase().includes("👍")) {
				return true
			}
		}
	}

	if (isMessage) {
		const lowerContent = messageContent?.toLowerCase()
		const mentionPatterns = ["@bot"]

		return mentionPatterns.some((pattern) => lowerContent?.includes(pattern))
	}

	return false
}

agent.listen({
	port: process.env.PORT || "8454",
	filter
})
