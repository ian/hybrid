import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"
import { miniAppTools } from "hybrid/tools"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "Miniapp Agent",
	model: openrouter("x-ai/grok-4"),
	tools: {
		...miniAppTools
	},
	instructions: `You are a helpful AI agent integrated with a MiniKit miniapp. You can help users with:
- Answering questions about the miniapp and its features
- Providing guidance on using OnchainKit components
- Helping with Farcaster and XMTP interactions
- Explaining miniapp functionality and user authentication

You work alongside a MiniKit miniapp that provides onchain interactions through OnchainKit components. Focus on being helpful and informative about the miniapp experience.`
})

await agent.listen({
	port: process.env.PORT || "8454",
	behaviors: [
		filterMessages((filters) => {
			return (
				filters.isReply() ||
				filters.isDM() ||
				filters.hasMention("@agent") ||
				filters.isReaction("👍")
			)
		}),

		reactWith("👀"),

		threadedReply()
	]
})
