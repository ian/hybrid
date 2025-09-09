import { ContentTypeReaction } from "@xmtp/content-type-reaction"
import { ContentTypeReply, Reply } from "@xmtp/content-type-reply"
import { ContentTypeText } from "@xmtp/content-type-text"
import { ContentTypeWalletSendCalls, WalletSendCallsParams } from "@xmtp/content-type-wallet-send-calls"
import { Hono } from "hono"
import { getValidatedPayload, validateXMTPToolsToken } from "./lib/jwt"
import { logger } from "./lib/logger"
import type { HonoVariables, SendMessageParams, SendReactionParams, SendReplyParams, SendTransactionParams } from "./types"

const app = new Hono<{ Variables: HonoVariables }>()

app.get("/messages/:messageId", async (c) => {
	const xmtpClient = c.get("xmtpClient")

	if (!xmtpClient) {
		return c.json({ error: "XMTP client not initialized" }, 500)
	}

	const token = c.req.query("token")

	if (!token) {
		return c.json({ error: "Token required" }, 401)
	}

	const payload = validateXMTPToolsToken(token)
	if (!payload) {
		return c.json({ error: "Invalid or expired token" }, 401)
	}

	const messageId = c.req.param("messageId")

	try {
		const message = await xmtpClient.conversations.getMessageById(messageId)
		if (!message) {
			return c.json({ error: "Message not found" }, 404)
		}

		console.log(`✅ Retrieved message ${messageId}`)

		const transformedMessage = {
			id: message.id,
			senderInboxId: message.senderInboxId,
			sentAt: message.sentAt.toISOString(),
			content:
				typeof message.content === "object"
					? JSON.stringify(message.content)
					: message.content,
			contentType: message.contentType?.typeId || "text",
			conversationId: message.conversationId,
			parameters: (message.contentType as any)?.parameters || {}
		}

		return c.json(transformedMessage)
	} catch (error) {
		console.error("❌ Error fetching message:", error)
		return c.json({ error: "Failed to fetch message" }, 500)
	}
})

// XMTP Tools endpoints
app.post("/send", async (c) => {
	const startTime = performance.now()
	logger.debug("📨 [Endpoint] Starting /send endpoint processing")
	
	const xmtpClient = c.get("xmtpClient")

	if (!xmtpClient) {
		logger.debug(`📨 [Endpoint] /send failed - no XMTP client in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "XMTP client not initialized" }, 500)
	}

	const authStartTime = performance.now()
	const payload = getValidatedPayload(c)
	if (!payload) {
		logger.debug(`📨 [Endpoint] /send failed - invalid token in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Invalid or expired token" }, 401)
	}
	const authEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Token validation completed in ${(authEndTime - authStartTime).toFixed(2)}ms`)

	// Get request body data
	const bodyStartTime = performance.now()
	const body = await c.req.json<SendMessageParams>()
	const bodyEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Request body parsing completed in ${(bodyEndTime - bodyStartTime).toFixed(2)}ms`)

	// Content can come from JWT payload or request body
	const content = body.content || payload.content
	if (!content) {
		logger.debug(`📨 [Endpoint] /send failed - no content in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Content required for send action" }, 400)
	}

	const conversationId = payload.conversationId

	// Conversation ID can come from JWT payload or request body (for API key auth)
	// const conversationId = payload.conversationId || body.conversationId
	if (!conversationId) {
		logger.debug(`📨 [Endpoint] /send failed - no conversation ID in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Conversation ID required" }, 400)
	}

	try {
		const convStartTime = performance.now()
		const conversation =
			await xmtpClient.conversations.getConversationById(conversationId)
		const convEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Conversation lookup completed in ${(convEndTime - convStartTime).toFixed(2)}ms`)
		
		if (!conversation) {
			logger.debug(`📨 [Endpoint] /send failed - conversation not found in ${(performance.now() - startTime).toFixed(2)}ms`)
			return c.json({ error: "Conversation not found" }, 404)
		}

		const sendStartTime = performance.now()
		await conversation.send(content)
		const sendEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Message send completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`)
		console.log(`➡ Sent message to conversation ${conversationId}`)

		const endTime = performance.now()
		logger.debug(`📨 [Endpoint] Total /send endpoint completed in ${(endTime - startTime).toFixed(2)}ms`)

		return c.json({
			success: true,
			action: "send",
			conversationId: payload.conversationId
		})
	} catch (error) {
		const endTime = performance.now()
		logger.error(`❌ Error sending message in ${(endTime - startTime).toFixed(2)}ms:`, error)
		return c.json({ error: "Failed to send message" }, 500)
	}
})

app.post("/reply", async (c) => {
	const startTime = performance.now()
	logger.debug("📨 [Endpoint] Starting /reply endpoint processing")
	
	const xmtpClient = c.get("xmtpClient")

	if (!xmtpClient) {
		logger.debug(`📨 [Endpoint] /reply failed - no XMTP client in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "XMTP client not initialized" }, 500)
	}

	const authStartTime = performance.now()
	const payload = getValidatedPayload(c)
	if (!payload) {
		logger.debug(`📨 [Endpoint] /reply failed - invalid token in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Invalid or expired token" }, 401)
	}
	const authEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Token validation completed in ${(authEndTime - authStartTime).toFixed(2)}ms`)

	// Get request body data
	const bodyStartTime = performance.now()
	const body = await c.req.json<SendReplyParams>()
	const bodyEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Request body parsing completed in ${(bodyEndTime - bodyStartTime).toFixed(2)}ms`)

	// Content can come from JWT payload or request body
	const content = body.content || payload.content
	if (!content) {
		logger.debug(`📨 [Endpoint] /reply failed - no content in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Content required for reply action" }, 400)
	}

	// Reference message ID can come from JWT payload or request body
	const messageId = body.messageId

	if (!messageId) {
		logger.debug(`📨 [Endpoint] /reply failed - no message ID in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json(
			{ error: "Reference message ID required for reply action" },
			400
		)
	}

	try {
		const convStartTime = performance.now()
		const conversation = await xmtpClient.conversations.getConversationById(
			payload.conversationId
		)
		const convEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Conversation lookup completed in ${(convEndTime - convStartTime).toFixed(2)}ms`)
		
		if (!conversation) {
			logger.debug(`📨 [Endpoint] /reply failed - conversation not found in ${(performance.now() - startTime).toFixed(2)}ms`)
			return c.json({ error: "Conversation not found" }, 404)
		}

		// Create proper XMTP reply structure
		const reply: Reply = {
			reference: messageId,
			contentType: ContentTypeText,
			content: content
		}

		// Send as a proper threaded reply
		const sendStartTime = performance.now()
		await conversation.send(reply, ContentTypeReply)
		const sendEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Reply send completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`)
		console.log(
			`➡ Sent reply "${content}" to conversation ${payload.conversationId}`
		)

		const endTime = performance.now()
		logger.debug(`📨 [Endpoint] Total /reply endpoint completed in ${(endTime - startTime).toFixed(2)}ms`)

		return c.json({
			success: true,
			action: "reply",
			conversationId: payload.conversationId
		})
	} catch (error) {
		const endTime = performance.now()
		logger.error(`❌ Error sending reply in ${(endTime - startTime).toFixed(2)}ms:`, error)
		return c.json({ error: "Failed to send reply" }, 500)
	}
})

app.post("/react", async (c) => {
	const startTime = performance.now()
	logger.debug("📨 [Endpoint] Starting /react endpoint processing")
	
	const xmtpClient = c.get("xmtpClient")

	if (!xmtpClient) {
		logger.debug(`📨 [Endpoint] /react failed - no XMTP client in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "XMTP client not initialized" }, 500)
	}

	const authStartTime = performance.now()
	const payload = getValidatedPayload(c)
	if (!payload) {
		logger.debug(`📨 [Endpoint] /react failed - invalid token in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Invalid or expired token" }, 401)
	}
	const authEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Token validation completed in ${(authEndTime - authStartTime).toFixed(2)}ms`)

	// Get request body data
	const bodyStartTime = performance.now()
	const body = await c.req.json<SendReactionParams>()
	const bodyEndTime = performance.now()
	logger.debug(`📨 [Endpoint] Request body parsing completed in ${(bodyEndTime - bodyStartTime).toFixed(2)}ms`)

	if (!body.emoji) {
		logger.debug(`📨 [Endpoint] /react failed - no emoji in ${(performance.now() - startTime).toFixed(2)}ms`)
		return c.json({ error: "Emoji required for react action" }, 400)
	}

	try {
		const convStartTime = performance.now()
		const conversation = await xmtpClient.conversations.getConversationById(
			payload.conversationId
		)
		const convEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Conversation lookup completed in ${(convEndTime - convStartTime).toFixed(2)}ms`)
		
		if (!conversation) {
			logger.debug(`📨 [Endpoint] /react failed - conversation not found in ${(performance.now() - startTime).toFixed(2)}ms`)
			return c.json({ error: "Conversation not found" }, 404)
		}

		const reaction = {
			schema: "unicode",
			reference: body.messageId,
			action: body.action,
			contentType: ContentTypeReaction,
			content: body.emoji
		}

		// For now, send the reaction content as a simple text message
		// This will send "eyes" as text content to indicate message was seen
		const sendStartTime = performance.now()
		await conversation.send(reaction, ContentTypeReaction)
		const sendEndTime = performance.now()
		logger.debug(`📨 [Endpoint] Reaction send completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`)

		console.log(
			`➡ Sent reaction ${body.emoji} to message ${body.messageId} in conversation ${payload.conversationId}`
		)

		const endTime = performance.now()
		logger.debug(`📨 [Endpoint] Total /react endpoint completed in ${(endTime - startTime).toFixed(2)}ms`)

		return c.json({
			success: true,
			action: "react",
			conversationId: payload.conversationId
		})
	} catch (error) {
		const endTime = performance.now()
		logger.error(`❌ Error sending reaction in ${(endTime - startTime).toFixed(2)}ms:`, error)
		return c.json({ error: "Failed to send reaction" }, 500)
	}
})

app.post("/transaction", async (c) => {
	const xmtpClient = c.get("xmtpClient")

	if (!xmtpClient) {
		return c.json({ error: "XMTP client not initialized" }, 500)
	}

	const payload = getValidatedPayload(c)
	if (!payload) {
		return c.json({ error: "Invalid or expired token" }, 401)
	}

	// Get request body data for backward compatibility
	let body: any = {}
	try {
		body = await c.req.json<SendTransactionParams>()
	} catch (error) {
		body = {}
	}

	// Transaction data can come from JWT payload (preferred) or request body (fallback)
	const fromAddress = payload.fromAddress || body.fromAddress
	const chainId = payload.chainId || body.chainId
	const calls = payload.calls || body.calls

	if (!calls || !fromAddress || !chainId) {
		return c.json(
			{ error: "Transaction data required for transaction action" },
			400
		)
	}

	// CRITICAL: Detect data truncation that can cause transaction failures
	calls.forEach((call: any, index: number) => {
		if (call.data && typeof call.data === "string") {
			const actualStart = call.data.substring(0, 10)

			if (actualStart === "0x010f2e2e") {
				console.error("🚨 CRITICAL: Transaction data truncation detected!")
				console.error("   Function selector corrupted - transaction will fail")
				console.error(
					"   This indicates a bug in wallet software or XMTP transmission"
				)
			}
		}
	})

	try {
		const conversation = await xmtpClient.conversations.getConversationById(
			payload.conversationId
		)
		if (!conversation) {
			return c.json({ error: "Conversation not found" }, 404)
		}

		const params: WalletSendCallsParams = {
			version: "1",
			chainId,
			from: fromAddress,
			calls
		}

		await conversation.send(params, ContentTypeWalletSendCalls)

		console.log(
			`✅ Sent transaction request to conversation ${payload.conversationId}`
		)

		return c.json({
			success: true,
			action: "transaction",
			conversationId: payload.conversationId
		})
	} catch (error) {
		console.error("❌ Error sending transaction:", error)
		return c.json({ error: "Failed to send transaction" }, 500)
	}
})

export default app
