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
 *   name: "my-agent",
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

// Export Miniapp tools
export {
	launchMiniappTool
} from "./miniapp"
