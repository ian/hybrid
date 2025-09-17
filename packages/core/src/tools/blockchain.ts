/**
 * @fileoverview Blockchain Tools for Crypto Agents
 *
 * This module provides comprehensive blockchain interaction tools for crypto-enabled agents.
 * Supports Ethereum and other EVM-compatible chains with features like balance checking,
 * transaction sending, contract interaction, and more.
 *
 * @module BlockchainTools
 */

import {
	createPublicClient,
	createWalletClient,
	formatEther,
	http,
	parseEther,
	type Address,
	type Hash
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import {
	arbitrum,
	base,
	mainnet,
	optimism,
	polygon,
	sepolia
} from "viem/chains"
import { z } from "zod"
import { createTool } from "../core/tool"
import { logger } from "../lib/logger"

// Supported chains configuration
const SUPPORTED_CHAINS = {
	mainnet,
	sepolia,
	polygon,
	arbitrum,
	optimism,
	base
} as const

type SupportedChain = keyof typeof SUPPORTED_CHAINS

// Runtime extension interface for blockchain tools
export interface BlockchainRuntimeExtension {
	rpcUrl?: string
	privateKey?: string
	defaultChain?: SupportedChain
}

/**
 * Get Balance Tool
 *
 * Retrieves the native token balance for a given address on a specified chain.
 *
 * @tool getBalance
 * @category Blockchain
 *
 * @param {string} address - The wallet address to check balance for
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, balance: string, balanceWei: string, address: string, chain: string, error?: string}>}
 */
export const getBalanceTool = createTool({
	id: "getBalance",
	description:
		"Get the native token balance for a wallet address on a blockchain",
	inputSchema: z.object({
		address: z.string().describe("The wallet address to check balance for"),
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to check on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		balance: z
			.string()
			.describe("Balance in human readable format (ETH, MATIC, etc.)"),
		balanceWei: z.string().describe("Balance in wei (smallest unit)"),
		address: z.string(),
		chain: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { address, chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			// Use runtime RPC URL if provided, otherwise use default
			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]

			const client = createPublicClient({
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			logger.debug(`🔍 [getBalance] Checking balance for ${address} on ${chain}`)

			const balanceWei = await client.getBalance({
				address: address as Address
			})

			const balance = formatEther(balanceWei)

			logger.debug(
				`✅ [getBalance] Balance: ${balance} ${chainConfig.nativeCurrency.symbol}`
			)

			return {
				success: true,
				balance: `${balance} ${chainConfig.nativeCurrency.symbol}`,
				balanceWei: balanceWei.toString(),
				address,
				chain
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [getBalance] Error:", errorMessage)
			return {
				success: false,
				balance: "0",
				balanceWei: "0",
				address: input.address,
				chain: input.chain,
				error: errorMessage
			}
		}
	}
})

/**
 * Get Transaction Tool
 *
 * Retrieves transaction details by transaction hash.
 *
 * @tool getTransaction
 * @category Blockchain
 *
 * @param {string} hash - The transaction hash to look up
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, transaction?: object, error?: string}>}
 */
export const getTransactionTool = createTool({
	id: "getTransaction",
	description: "Get transaction details by transaction hash",
	inputSchema: z.object({
		hash: z.string().describe("The transaction hash to look up"),
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to check on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		transaction: z
			.object({
				hash: z.string(),
				from: z.string(),
				to: z.string().nullable(),
				value: z.string(),
				gasUsed: z.string().optional(),
				gasPrice: z.string().optional(),
				blockNumber: z.string().optional(),
				status: z.string().optional()
			})
			.optional(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { hash, chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]

			const client = createPublicClient({
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			logger.debug(
				`🔍 [getTransaction] Looking up transaction ${hash} on ${chain}`
			)

			const transaction = await client.getTransaction({
				hash: hash as Hash
			})

			const receipt = await client
				.getTransactionReceipt({
					hash: hash as Hash
				})
				.catch(() => null) // Transaction might be pending

			logger.debug(
				`✅ [getTransaction] Found transaction from ${transaction.from} to ${transaction.to}`
			)

			return {
				success: true,
				transaction: {
					hash: transaction.hash,
					from: transaction.from,
					to: transaction.to,
					value: formatEther(transaction.value),
					gasUsed: receipt?.gasUsed.toString(),
					gasPrice: transaction.gasPrice?.toString(),
					blockNumber: transaction.blockNumber?.toString(),
					status:
						receipt?.status === "success"
							? "success"
							: receipt?.status === "reverted"
								? "failed"
								: "pending"
				}
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [getTransaction] Error:", errorMessage)
			return {
				success: false,
				error: errorMessage
			}
		}
	}
})

/**
 * Send Transaction Tool
 *
 * Sends a native token transaction to another address.
 * Requires a private key to be configured in the runtime.
 *
 * @tool sendTransaction
 * @category Blockchain
 *
 * @param {string} to - The recipient address
 * @param {string} amount - The amount to send (in ETH, MATIC, etc.)
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, hash?: string, error?: string}>}
 */
export const sendTransactionTool = createTool({
	id: "sendTransaction",
	description: "Send native tokens to another address",
	inputSchema: z.object({
		to: z.string().describe("The recipient address"),
		amount: z.string().describe("The amount to send (in ETH, MATIC, etc.)"),
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to send on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		hash: z.string().optional(),
		from: z.string().optional(),
		to: z.string(),
		amount: z.string(),
		chain: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { to, amount, chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			const privateKey = (runtime as any).privateKey
			if (!privateKey) {
				return {
					success: false,
					to,
					amount,
					chain,
					error: "Private key not configured in runtime"
				}
			}

			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]
			const account = privateKeyToAccount(privateKey as `0x${string}`)

			const client = createWalletClient({
				account,
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			logger.debug(
				`💸 [sendTransaction] Sending ${amount} ${chainConfig.nativeCurrency.symbol} to ${to} on ${chain}`
			)

			const hash = await client.sendTransaction({
				to: to as Address,
				value: parseEther(amount)
			})

			logger.debug(`✅ [sendTransaction] Transaction sent: ${hash}`)

			return {
				success: true,
				hash,
				from: account.address,
				to,
				amount,
				chain
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [sendTransaction] Error:", errorMessage)
			return {
				success: false,
				to: input.to,
				amount: input.amount,
				chain: input.chain,
				error: errorMessage
			}
		}
	}
})

/**
 * Get Block Tool
 *
 * Retrieves information about a specific block.
 *
 * @tool getBlock
 * @category Blockchain
 *
 * @param {string} [blockNumber] - Block number (defaults to latest)
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, block?: object, error?: string}>}
 */
export const getBlockTool = createTool({
	id: "getBlock",
	description: "Get information about a blockchain block",
	inputSchema: z.object({
		blockNumber: z
			.string()
			.optional()
			.describe("Block number (defaults to latest)"),
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to check on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		block: z
			.object({
				number: z.string(),
				hash: z.string(),
				timestamp: z.string(),
				transactionCount: z.number(),
				gasUsed: z.string(),
				gasLimit: z.string()
			})
			.optional(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { blockNumber, chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]

			const client = createPublicClient({
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			logger.debug(
				`🔍 [getBlock] Getting block ${blockNumber || "latest"} on ${chain}`
			)

			const block = await client.getBlock({
				blockNumber: blockNumber ? BigInt(blockNumber) : undefined
			})

			logger.debug(
				`✅ [getBlock] Found block ${block.number} with ${block.transactions.length} transactions`
			)

			return {
				success: true,
				block: {
					number: block.number.toString(),
					hash: block.hash,
					timestamp: block.timestamp.toString(),
					transactionCount: block.transactions.length,
					gasUsed: block.gasUsed.toString(),
					gasLimit: block.gasLimit.toString()
				}
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [getBlock] Error:", errorMessage)
			return {
				success: false,
				error: errorMessage
			}
		}
	}
})

/**
 * Get Gas Price Tool
 *
 * Retrieves current gas price information for a blockchain.
 *
 * @tool getGasPrice
 * @category Blockchain
 *
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, gasPrice?: string, error?: string}>}
 */
export const getGasPriceTool = createTool({
	id: "getGasPrice",
	description: "Get current gas price for a blockchain",
	inputSchema: z.object({
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to check on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		gasPrice: z.string().optional().describe("Gas price in gwei"),
		gasPriceWei: z.string().optional().describe("Gas price in wei"),
		chain: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]

			const client = createPublicClient({
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			logger.debug(`⛽ [getGasPrice] Getting gas price for ${chain}`)

			const gasPrice = await client.getGasPrice()
			const gasPriceGwei = formatEther(gasPrice * BigInt(1000000000)) // Convert to gwei

			logger.debug(`✅ [getGasPrice] Current gas price: ${gasPriceGwei} gwei`)

			return {
				success: true,
				gasPrice: `${gasPriceGwei} gwei`,
				gasPriceWei: gasPrice.toString(),
				chain
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [getGasPrice] Error:", errorMessage)
			return {
				success: false,
				chain: input.chain,
				error: errorMessage
			}
		}
	}
})

/**
 * Estimate Gas Tool
 *
 * Estimates gas required for a transaction.
 *
 * @tool estimateGas
 * @category Blockchain
 *
 * @param {string} to - The recipient address
 * @param {string} [amount] - The amount to send (defaults to 0)
 * @param {string} [data] - Transaction data (for contract calls)
 * @param {string} [chain] - The blockchain network (defaults to mainnet)
 *
 * @returns {Promise<{success: boolean, gasEstimate?: string, error?: string}>}
 */
export const estimateGasTool = createTool({
	id: "estimateGas",
	description: "Estimate gas required for a transaction",
	inputSchema: z.object({
		to: z.string().describe("The recipient address"),
		amount: z
			.string()
			.default("0")
			.describe("The amount to send (defaults to 0)"),
		data: z
			.string()
			.optional()
			.describe("Transaction data (for contract calls)"),
		chain: z
			.enum(["mainnet", "sepolia", "polygon", "arbitrum", "optimism", "base"])
			.default("mainnet")
			.describe("The blockchain network to estimate on")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		gasEstimate: z.string().optional(),
		to: z.string(),
		amount: z.string(),
		chain: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const { to, amount, data, chain } = input
			const chainConfig = SUPPORTED_CHAINS[chain]

			const privateKey = (runtime as any).privateKey
			if (!privateKey) {
				return {
					success: false,
					to,
					amount,
					chain,
					error: "Private key not configured in runtime"
				}
			}

			const rpcUrl =
				(runtime as any).rpcUrl || chainConfig.rpcUrls.default.http[0]
			const account = privateKeyToAccount(privateKey as `0x${string}`)

			const client = createPublicClient({
				chain: chainConfig,
				transport: http(rpcUrl)
			})

			console.log(
				`⛽ [estimateGas] Estimating gas for transaction to ${to} on ${chain}`
			)

			const gasEstimate = await client.estimateGas({
				account: account.address,
				to: to as Address,
				value: parseEther(amount),
				data: data as `0x${string}` | undefined
			})

			console.log(`✅ [estimateGas] Estimated gas: ${gasEstimate.toString()}`)

			return {
				success: true,
				gasEstimate: gasEstimate.toString(),
				to,
				amount,
				chain
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [estimateGas] Error:", errorMessage)
			return {
				success: false,
				to: input.to,
				amount: input.amount,
				chain: input.chain,
				error: errorMessage
			}
		}
	}
})

/**
 * Collection of blockchain tools for crypto agents
 *
 * These tools provide comprehensive blockchain interaction capabilities including
 * balance checking, transaction sending, gas estimation, and more.
 *
 * @namespace blockchainTools
 *
 * @property {Tool} getBalance - Get native token balance for an address
 * @property {Tool} getTransaction - Get transaction details by hash
 * @property {Tool} sendTransaction - Send native tokens to another address
 * @property {Tool} getBlock - Get information about a blockchain block
 * @property {Tool} getGasPrice - Get current gas price for a blockchain
 * @property {Tool} estimateGas - Estimate gas required for a transaction
 */
export const blockchainTools = {
	getBalance: getBalanceTool,
	getTransaction: getTransactionTool,
	sendTransaction: sendTransactionTool,
	getBlock: getBlockTool,
	getGasPrice: getGasPriceTool,
	estimateGas: estimateGasTool
}
