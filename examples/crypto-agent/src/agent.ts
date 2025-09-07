/**
 * @fileoverview Crypto-Enabled Agent Example
 *
 * This example demonstrates the structure for creating a crypto-enabled agent
 * using the Hybrid Tools standard library. Due to TypeScript complexity with
 * runtime extensions, this serves as a reference implementation.
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, type MessageListenerConfig, type Reaction } from "hybrid"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

/**
 * Example crypto-enabled agent structure
 *
 * To use blockchain and XMTP tools, you would:
 * 1. Import tools from "hybrid/tools"
 * 2. Add them to the tools object
 * 3. Configure runtime with blockchain settings
 */
const cryptoAgent = new Agent({
	name: "Crypto Assistant",
	model: openrouter("x-ai/grok-4"),

	instructions: `You are a helpful crypto assistant.

This is a reference implementation showing how to structure a crypto-enabled agent.

To add blockchain and XMTP tools, you would:

1. Import tools:
   import { blockchainTools, xmtpTools } from "hybrid/tools"

2. Add to agent:
   tools: { ...blockchainTools, ...xmtpTools }

3. Configure runtime:
   createRuntime: (runtime) => ({
     rpcUrl: process.env.RPC_URL,
     privateKey: process.env.PRIVATE_KEY,
     defaultChain: "mainnet" as const
   })

Available tools:
- Blockchain: getBalance, sendTransaction, getTransaction, getGasPrice, estimateGas, getBlock
- XMTP: sendMessage, sendReply, sendReaction, getMessage

Supported chains: mainnet, sepolia, polygon, arbitrum, optimism, base

See ../tools-usage/ for complete examples and documentation.`
})

/**
 * Message filter - responds to crypto-related mentions and keywords
 */
const filter: MessageListenerConfig["filter"] = async ({ message }) => {
	const messageContent = message.content?.toString()
	const contentTypeId = message.contentType?.typeId
	const isMessage = contentTypeId === "text"
	const isReaction = contentTypeId === "reaction"
	const isReply = contentTypeId === "reply"

	// Always respond to replies
	if (isReply) {
		return true
	}

	// Respond to 👍 reactions (good for confirming transactions)
	if (isReaction) {
		const { content, action } = message.content as Reaction

		if (action === "added") {
			if (content.toLowerCase().includes("👍")) {
				return true
			}
		}
	}

	// Respond to messages with crypto-related mentions or keywords
	if (isMessage) {
		const lowerContent = messageContent?.toLowerCase()
		const cryptoKeywords = [
			"@crypto",
			"@bot",
			// Blockchain keywords
			"balance",
			"send",
			"transaction",
			"tx",
			"gas",
			"eth",
			"ethereum",
			"matic",
			"polygon",
			"arbitrum",
			"optimism",
			"base",
			"block",
			"wei",
			"gwei",
			// XMTP keywords
			"message",
			"reply",
			"react"
		]

		return cryptoKeywords.some((keyword) => lowerContent?.includes(keyword))
	}

	return false
}

// Start the agent
cryptoAgent.listen({
	port: process.env.PORT || "8455",
	filter
})

console.log(
	`🚀 Crypto Agent Example started on port ${process.env.PORT || "8455"}`
)
console.log(`📚 This is a reference implementation for crypto-enabled agents`)
console.log(
	`🔗 Available blockchain tools: getBalance, sendTransaction, getTransaction, getGasPrice, estimateGas, getBlock`
)
console.log(
	`💬 Available XMTP tools: sendMessage, sendReply, sendReaction, getMessage`
)
console.log(
	`🌐 Supported chains: mainnet, sepolia, polygon, arbitrum, optimism, base`
)
console.log(`📖 See ../tools-usage/ for complete examples and documentation`)

export default cryptoAgent
