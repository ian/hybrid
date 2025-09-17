/**
 * @fileoverview XMTP Communication Tools for Crypto Agents
 *
 * This module provides comprehensive XMTP messaging tools for crypto-enabled agents.
 * Includes capabilities for sending messages, replies, reactions, and managing conversations.
 *
 * @module XMTPTools
 */

import {
	ContentTypeReaction,
	ContentTypeReply,
	ContentTypeText,
	Reply
} from "@hybrd/xmtp"
import { z } from "zod"
import { createTool } from "../core/tool"
import { logger } from "../lib/logger"

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
				content: z
					.union([z.string(), z.record(z.unknown()), z.unknown()])
					.optional(),
				senderInboxId: z.string(),
				sentAt: z.date(),
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
		const startTime = performance.now()
		logger.debug(
			`📜 [Tool:getMessage] Starting execution for message: ${input.messageId}`
		)

		try {
			const { xmtpClient, conversation } = runtime
			const { messageId } = input

			if (!xmtpClient) {
				const endTime = performance.now()
				logger.debug(
					`📜 [Tool:getMessage] Failed - no XMTP client in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					error: "XMTP service not available"
				}
			}

			logger.debug(`📜 [getMessage] Retrieving message ${messageId}`)

			const sendStartTime = performance.now()
			const message = await xmtpClient.conversations.getMessageById(messageId)
			const sendEndTime = performance.now()
			logger.debug(
				`📜 [Tool:getMessage] XMTP client getMessage completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`
			)

			if (!message) {
				const endTime = performance.now()
				logger.debug(
					`📜 [Tool:getMessage] Failed in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					error: "Failed to get message"
				}
			}

			logger.debug(
				`✅ [getMessage] Retrieved message from ${message.senderInboxId}`
			)

			const endTime = performance.now()
			logger.debug(
				`📜 [Tool:getMessage] Total execution completed in ${(endTime - startTime).toFixed(2)}ms`
			)

			return {
				success: true,
				message: message
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			const endTime = performance.now()
			logger.error(
				`❌ [Tool:getMessage] Error in ${(endTime - startTime).toFixed(2)}ms:`,
				errorMessage
			)
			return {
				success: false,
				error: errorMessage
			}
		}
	}
})

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
		const startTime = performance.now()

		logger.debug(
			`👀 [Tool:sendReaction] Starting execution with emoji: ${input.emoji}`
		)

		try {
			const xmtpClient = runtime.xmtpClient
			const { referenceMessageId, emoji } = input
			const { message, conversation } = runtime

			if (!xmtpClient) {
				const endTime = performance.now()
				logger.debug(
					`👀 [Tool:sendReaction] Failed - no XMTP client in ${(endTime - startTime).toFixed(2)}ms`
				)
				const errorMsg = "❌ XMTP service not available"
				return { success: false, emoji: input.emoji, error: errorMsg }
			}

			const messageIdToReactTo = input.referenceMessageId

			logger.debug(
				`👀 [sendReaction] Sending ${input.emoji} reaction to message ${messageIdToReactTo}`
			)

			const sendStartTime = performance.now()

			const reaction = {
				schema: "unicode",
				reference: message.id,
				action: "added",
				contentType: ContentTypeReaction,
				content: emoji
			}

			const reactionResult = await conversation.send(
				reaction,
				ContentTypeReaction
			)

			const sendEndTime = performance.now()
			logger.debug(
				`👀 [Tool:sendReaction] XMTP client sendReaction completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`
			)

			if (!reactionResult) {
				const endTime = performance.now()
				logger.debug(
					`👀 [Tool:sendReaction] Failed in ${(endTime - startTime).toFixed(2)}ms`
				)
				const errorMsg = `❌ Failed to send reaction`
				return { success: false, emoji: input.emoji, error: errorMsg }
			}

			logger.debug(`✅ [sendReaction] Successfully sent ${input.emoji} reaction`)

			const endTime = performance.now()
			logger.debug(
				`👀 [Tool:sendReaction] Total execution completed in ${(endTime - startTime).toFixed(2)}ms`
			)

			return { success: true, emoji: input.emoji }
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			const endTime = performance.now()
			logger.error(
				`❌ [Tool:sendReaction] Error in ${(endTime - startTime).toFixed(2)}ms:`,
				errorMessage
			)
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
		const startTime = performance.now()
		logger.debug(
			`💬 [Tool:sendMessage] Starting execution with content: "${input.content.substring(0, 50)}${input.content.length > 50 ? "..." : ""}"`
		)

		try {
			const xmtpClient = runtime.xmtpClient
			const { content, recipientAddress, conversationId } = input
			const { conversation } = runtime

			if (!xmtpClient) {
				const endTime = performance.now()
				logger.debug(
					`💬 [Tool:sendMessage] Failed - no XMTP client in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					error: "XMTP service not available"
				}
			}

			logger.debug(
				`💬 [sendMessage] Sending message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`
			)

			let targetConversationId = conversationId

			// If no conversation ID provided, create or find conversation with recipient
			if (!targetConversationId && recipientAddress) {
				logger.debug(
					`🔍 [sendMessage] Creating/finding conversation with ${recipientAddress}`
				)
				// This would depend on your XMTP client implementation
				// For now, we'll assume the client handles conversation creation
				targetConversationId = recipientAddress // Simplified for this example
			}

			// Send the message using the XMTP client
			const sendStartTime = performance.now()
			const messageId = await conversation.send(content)
			const sendEndTime = performance.now()
			logger.debug(
				`💬 [Tool:sendMessage] XMTP client sendMessage completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`
			)

			if (!messageId) {
				const endTime = performance.now()
				logger.debug(
					`💬 [Tool:sendMessage] Failed in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					error: "Failed to send message"
				}
			}

			logger.debug(`✅ [sendMessage] Message sent successfully`)

			const endTime = performance.now()
			logger.debug(
				`💬 [Tool:sendMessage] Total execution completed in ${(endTime - startTime).toFixed(2)}ms`
			)

			return {
				success: true,
				messageId,
				conversationId: conversation.id,
				content
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			const endTime = performance.now()
			logger.error(
				`❌ [Tool:sendMessage] Error in ${(endTime - startTime).toFixed(2)}ms:`,
				errorMessage
			)
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
		const startTime = performance.now()
		logger.debug(
			`↩️ [Tool:sendReply] Starting execution with content: "${input.content.substring(0, 50)}${input.content.length > 50 ? "..." : ""}"`
		)

		try {
			const { xmtpClient, conversation } = runtime
			const { content, replyToMessageId } = input

			if (!xmtpClient) {
				const endTime = performance.now()
				logger.debug(
					`↩️ [Tool:sendReply] Failed - no XMTP client in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					replyToMessageId: replyToMessageId || "",
					error: "XMTP service not available"
				}
			}

			if (!replyToMessageId) {
				const endTime = performance.now()
				logger.debug(
					`↩️ [Tool:sendReply] Failed - no message to reply to in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					replyToMessageId: "",
					error: "No message to reply to"
				}
			}

			const targetMessageId = replyToMessageId //|| currentMessage?.id

			logger.debug(
				`↩️ [sendReply] Sending reply to message ${targetMessageId}: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`
			)

			const reply: Reply = {
				reference: replyToMessageId,
				contentType: ContentTypeText,
				content
			}

			const sendStartTime = performance.now()
			const replyMessageId = await conversation.send(reply, ContentTypeReply)
			const sendEndTime = performance.now()
			logger.debug(
				`↩️ [Tool:sendReply] XMTP client sendReply completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`
			)

			if (!replyMessageId) {
				const endTime = performance.now()
				logger.debug(
					`↩️ [Tool:sendReply] Failed in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					messageId: replyMessageId,
					replyToMessageId: targetMessageId,
					error: "Failed to send reply"
				}
			}

			logger.debug(`✅ [sendReply] Reply sent successfully`)

			const endTime = performance.now()
			logger.debug(
				`↩️ [Tool:sendReply] Total execution completed in ${(endTime - startTime).toFixed(2)}ms`
			)

			return {
				success: true,
				messageId: replyMessageId,
				replyToMessageId: targetMessageId,
				content
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			const endTime = performance.now()
			logger.error(
				`❌ [Tool:sendReply] Error in ${(endTime - startTime).toFixed(2)}ms:`,
				errorMessage
			)
			return {
				success: false,
				content: input.content,
				replyToMessageId: input.replyToMessageId || "",
				messageId: "",
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
	getMessage: getMessageTool,
	sendMessage: sendMessageTool,
	sendReply: sendReplyTool,
	sendReaction: sendReactionTool
}
