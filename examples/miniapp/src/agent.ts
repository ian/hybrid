import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, createTool } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"
import { z } from "zod"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

/**
 * Launch Miniapp Tool
 *
 * Launches a Base miniapp by sending its URL via XMTP message.
 * This enables agents to deliver and launch miniapps from chat conversations.
 */
export const launchMiniappTool = createTool({
	description:
		"Launch a Base miniapp by sending its URL via XMTP. Only ever call this tool once.",
	inputSchema: z.object({
		message: z
			.string()
			.optional()
			.describe("Optional accompanying message text")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		messageId: z.string().optional(),
		content: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		const miniappUrl = process.env.MINIAPP_URL || "http://localhost:3000"

		try {
			const { message } = input
			const { conversation } = runtime

			await conversation.send(miniappUrl)

			return {
				success: true,
				content: message ?? "Opening miniapp..."
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)

			return {
				success: false,
				content: "Error opening miniapp",
				error: errorMessage
			}
		}
	}
})

const agent = new Agent({
	name: "Miniapp Agent",
	model: openrouter("inception/mercury"),
	tools: {
		launchMiniappTool
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
