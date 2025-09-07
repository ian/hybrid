/**
 * @fileoverview Hybrid Agent Tools Standard Library
 *
 * This module provides a comprehensive set of tools for building crypto-enabled agents.
 * Tools are organized by category and can be imported individually or as complete sets.
 *
 * @example
 * ```typescript
 * import { blockchainTools, xmtpTools } from "hybrid/tools"
 * import { Agent } from "hybrid"
 *
 * const agent = new Agent({
 *   name: "crypto-agent",
 *   model: myModel,
 *   tools: {
 *     ...blockchainTools,
 *     ...xmtpTools
 *   },
 *   instructions: "You are a crypto agent with blockchain and messaging capabilities.",
 *   createRuntime: (runtime) => ({
 *     rpcUrl: process.env.RPC_URL,
 *     privateKey: process.env.PRIVATE_KEY,
 *     defaultChain: "mainnet" as const
 *   })
 * })
 * ```
 *
 * @module HybridTools
 */

// Export blockchain tools
export {
	blockchainTools,
	estimateGasTool,
	getBalanceTool,
	getBlockTool,
	getGasPriceTool,
	getTransactionTool,
	sendTransactionTool,
	type BlockchainRuntimeExtension
} from "./blockchain"

// Export XMTP tools
export {
	getMessageTool,
	sendMessageTool,
	sendReactionTool,
	sendReplyTool,
	xmtpTools
} from "./xmtp"

// Export all tools as a single collection
export const allTools = async () => {
	const { blockchainTools } = await import("./blockchain")
	const { xmtpTools } = await import("./xmtp")

	return {
		...blockchainTools,
		...xmtpTools
	}
}

/**
 * Tool categories for easy selection
 */
export const toolCategories = {
	blockchain: "blockchain",
	communication: "communication"
} as const

/**
 * Type definitions for runtime extensions
 */
export interface CryptoAgentRuntime {
	// Blockchain configuration
	rpcUrl?: string
	privateKey?: string
	defaultChain?:
		| "mainnet"
		| "sepolia"
		| "polygon"
		| "arbitrum"
		| "optimism"
		| "base"

	// XMTP is already included in the base runtime
	// Additional crypto-specific runtime properties can be added here
}

/**
 * Utility function to create a crypto-enabled runtime extension
 *
 * @param config - Configuration for the crypto runtime
 * @returns Runtime extension object
 *
 * @example
 * ```typescript
 * const agent = new Agent({
 *   // ... other config
 *   createRuntime: createCryptoRuntime({
 *     rpcUrl: process.env.RPC_URL,
 *     privateKey: process.env.PRIVATE_KEY,
 *     defaultChain: "mainnet"
 *   })
 * })
 * ```
 */
export function createCryptoRuntime(config: {
	rpcUrl?: string
	privateKey?: string
	defaultChain?:
		| "mainnet"
		| "sepolia"
		| "polygon"
		| "arbitrum"
		| "optimism"
		| "base"
}) {
	return (runtime: any) => ({
		...config
	})
}
