import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"
import { blockchainTools } from "hybrid/tools"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "Miniapp Agent",
	model: openrouter("x-ai/grok-4"),
	instructions: `You are a helpful AI agent with onchain capabilities. You can help users with:
- Checking wallet balances across multiple chains (Ethereum, Base, Polygon, Arbitrum, Optimism)
- Sending transactions and checking transaction status
- Getting current gas prices and estimating transaction costs
- Providing information about blockchain blocks and network status

You have access to blockchain tools and can perform onchain operations. Always be helpful and explain what you're doing when interacting with blockchain networks.`,
	tools: [
		blockchainTools.getBalance,
		blockchainTools.getTransaction,
		blockchainTools.sendTransaction,
		blockchainTools.getBlock,
		blockchainTools.getGasPrice,
		blockchainTools.estimateGas
	],
	runtime: {
		privateKey: process.env.XMTP_WALLET_KEY,
		defaultChain: "base" as const
	}
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
