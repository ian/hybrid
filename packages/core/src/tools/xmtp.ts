/**
 * @fileoverview XMTP Communication Tools for Crypto Agents
 *
 * This module provides comprehensive XMTP messaging tools for crypto-enabled agents.
 * Includes capabilities for sending messages, replies, reactions, and managing conversations.
 *
 * @module XMTPTools
 */

import { z } from "zod"
import { createTool } from "../core/tool"

/**
 * Send Reaction Tool
 *
 * Sends an emoji reaction to a specific message to indicate the message has been seen.
 * This is used to acknowledge receipt of messages before responding.
 *
 * @tool sendReaction
 * @category Communication
 *
 * @param {string} emoji - The emoji to send as a reaction (defaults to 👀)
 * @param {string} [referenceMessageId] - The message ID to react to (uses current message if not provided)
 *
 * @returns {Promise<{success: boolean, emoji: string, error?: string}>}
 */
export const sendReactionTool = createTool({
	id: "sendReaction",
	description:
		"Send an emoji reaction to a message to indicate it has been seen",
	inputSchema: z.object({
		emoji: z
			.string()
			.default("👀")
			.describe(
				"The emoji to send as a reaction (supports common emoji like 👍, ❤️, 🔥, etc.)"
			),
		referenceMessageId: z
			.string()
			.optional()
			.describe(
				"The message ID to react to (uses current message if not provided)"
			)
	}),
	outputSchema: z.object({
		success: z.boolean(),
		emoji: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const xmtpClient = runtime.xmtpClient
			const currentMessage = runtime.message

			if (!xmtpClient) {
				const errorMsg = "❌ XMTP service not available"
				return { success: false, emoji: input.emoji, error: errorMsg }
			}

			if (!currentMessage) {
				const errorMsg = "❌ No message to react to"
				return { success: false, emoji: input.emoji, error: errorMsg }
			}

			// Use provided reference message ID or current message ID
			const messageIdToReactTo = input.referenceMessageId || currentMessage.id

			console.log(
				`👀 [sendReaction] Sending ${input.emoji} reaction to message ${messageIdToReactTo}`
			)

			const reactionResult = await xmtpClient.sendReaction({
				messageId: messageIdToReactTo,
				emoji: input.emoji,
				action: "added"
			})

			if (!reactionResult.success) {
				const errorMsg = `❌ Failed to send reaction: ${reactionResult.error || "Unknown error"}`
				return { success: false, emoji: input.emoji, error: errorMsg }
			}

			console.log(`✅ [sendReaction] Successfully sent ${input.emoji} reaction`)
			return { success: true, emoji: input.emoji }
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [sendReaction] Error:", errorMessage)
			return { success: false, emoji: input.emoji, error: errorMessage }
		}
	}
})

/**
 * Send Message Tool
 *
 * Sends a message to an XMTP conversation or creates a new conversation.
 *
 * @tool sendMessage
 * @category Communication
 *
 * @param {string} content - The message content to send
 * @param {string} [recipientAddress] - Recipient address for new conversations
 * @param {string} [conversationId] - Existing conversation ID to send to
 *
 * @returns {Promise<{success: boolean, messageId?: string, conversationId?: string, error?: string}>}
 */
export const sendMessageTool = createTool({
	id: "sendMessage",
	description: "Send a message to an XMTP conversation",
	inputSchema: z
		.object({
			content: z.string().describe("The message content to send"),
			recipientAddress: z
				.string()
				.optional()
				.describe("Recipient address for new conversations"),
			conversationId: z
				.string()
				.optional()
				.describe("Existing conversation ID to send to")
		})
		.refine((data) => data.recipientAddress || data.conversationId, {
			message: "Either recipientAddress or conversationId must be provided"
		}),
	outputSchema: z.object({
		success: z.boolean(),
		messageId: z.string().optional(),
		conversationId: z.string().optional(),
		content: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const xmtpClient = runtime.xmtpClient
			const { content, recipientAddress, conversationId } = input

			if (!xmtpClient) {
				return {
					success: false,
					content,
					error: "XMTP service not available"
				}
			}

			console.log(
				`💬 [sendMessage] Sending message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`
			)

			let targetConversationId = conversationId

			// If no conversation ID provided, create or find conversation with recipient
			if (!targetConversationId && recipientAddress) {
				console.log(
					`🔍 [sendMessage] Creating/finding conversation with ${recipientAddress}`
				)
				// This would depend on your XMTP client implementation
				// For now, we'll assume the client handles conversation creation
				targetConversationId = recipientAddress // Simplified for this example
			}

			// Send the message using the XMTP client
			const messageResult = await xmtpClient.sendMessage({
				content
			})

			if (!messageResult.success) {
				return {
					success: false,
					content,
					error: messageResult.error || "Failed to send message"
				}
			}

			console.log(`✅ [sendMessage] Message sent successfully`)

			return {
				success: true,
				messageId: messageResult.data?.conversationId,
				conversationId: messageResult.data?.conversationId,
				content
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [sendMessage] Error:", errorMessage)
			return {
				success: false,
				content: input.content,
				error: errorMessage
			}
		}
	}
})

/**
 * Send Reply Tool
 *
 * Sends a reply to a specific message in an XMTP conversation.
 *
 * @tool sendReply
 * @category Communication
 *
 * @param {string} content - The reply content to send
 * @param {string} [replyToMessageId] - Message ID to reply to (uses current message if not provided)
 *
 * @returns {Promise<{success: boolean, messageId?: string, replyToMessageId?: string, error?: string}>}
 */
export const sendReplyTool = createTool({
	id: "sendReply",
	description: "Send a reply to a specific message in an XMTP conversation",
	inputSchema: z.object({
		content: z.string().describe("The reply content to send"),
		replyToMessageId: z
			.string()
			.optional()
			.describe("Message ID to reply to (uses current message if not provided)")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		messageId: z.string().optional(),
		replyToMessageId: z.string().optional(),
		content: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const xmtpClient = runtime.xmtpClient
			const currentMessage = runtime.message
			const { content, replyToMessageId } = input

			if (!xmtpClient) {
				return {
					success: false,
					content,
					error: "XMTP service not available"
				}
			}

			if (!currentMessage && !replyToMessageId) {
				return {
					success: false,
					content,
					error: "No message to reply to"
				}
			}

			const targetMessageId = replyToMessageId || currentMessage?.id

			console.log(
				`↩️ [sendReply] Sending reply to message ${targetMessageId}: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`
			)

			const replyResult = await xmtpClient.sendReply({
				content,
				messageId: targetMessageId
			})

			if (!replyResult.success) {
				return {
					success: false,
					content,
					replyToMessageId: targetMessageId,
					error: replyResult.error || "Failed to send reply"
				}
			}

			console.log(`✅ [sendReply] Reply sent successfully`)

			return {
				success: true,
				messageId: replyResult.data?.conversationId,
				replyToMessageId: targetMessageId,
				content
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [sendReply] Error:", errorMessage)
			return {
				success: false,
				content: input.content,
				replyToMessageId: input.replyToMessageId,
				error: errorMessage
			}
		}
	}
})

/**
 * Get Message Tool
 *
 * Retrieves a specific message by ID from the XMTP service.
 *
 * @tool getMessage
 * @category Communication
 *
 * @param {string} messageId - The message ID to retrieve
 *
 * @returns {Promise<{success: boolean, message?: object, error?: string}>}
 */
export const getMessageTool = createTool({
	id: "getMessage",
	description: "Get a specific message by ID from XMTP",
	inputSchema: z.object({
		messageId: z.string().describe("The message ID to retrieve")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		message: z
			.object({
				id: z.string(),
				conversationId: z.string(),
				content: z.union([z.string(), z.record(z.unknown())]),
				senderInboxId: z.string(),
				sentAt: z.string(),
				contentType: z
					.object({
						typeId: z.string(),
						authorityId: z.string().optional(),
						versionMajor: z.number().optional(),
						versionMinor: z.number().optional()
					})
					.optional()
			})
			.optional(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		try {
			const xmtpClient = runtime.xmtpClient
			const { messageId } = input

			if (!xmtpClient) {
				return {
					success: false,
					error: "XMTP service not available"
				}
			}

			console.log(`📜 [getMessage] Retrieving message ${messageId}`)

			const messageResult = await xmtpClient.getMessage({
				messageId
			})

			if (!messageResult.success) {
				return {
					success: false,
					error: messageResult.error || "Failed to get message"
				}
			}

			console.log(
				`✅ [getMessage] Retrieved message from ${messageResult.data?.senderInboxId}`
			)

			return {
				success: true,
				message: messageResult.data
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("❌ [getMessage] Error:", errorMessage)
			return {
				success: false,
				error: errorMessage
			}
		}
	}
})

/**
 * Collection of XMTP communication tools for crypto agents
 *
 * These tools provide comprehensive messaging capabilities including sending messages,
 * replies, reactions, and retrieving message information.
 *
 * @namespace xmtpTools
 *
 * @property {Tool} sendMessage - Send a message to an XMTP conversation
 * @property {Tool} sendReply - Send a reply to a specific message
 * @property {Tool} sendReaction - Send an emoji reaction to a message
 * @property {Tool} getMessage - Get a specific message by ID
 */
export const xmtpTools = {
	sendMessage: sendMessageTool,
	sendReply: sendReplyTool,
	sendReaction: sendReactionTool,
	getMessage: getMessageTool
}
