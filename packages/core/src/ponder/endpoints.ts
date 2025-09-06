import { Hono } from "hono"

// Create Hono app for blockchain events
const app = new Hono()

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok", service: "ponder-agent" }))

/**
 * Handles blockchain events forwarded from Ponder via the hybrid blockchain forwarder
 *
 * @description
 * This is a simple endpoint that receives blockchain events from Ponder through
 * the hybrid blockchain forwarder service. The agent just needs to handle the
 * events and respond appropriately.
 *
 * @returns {Promise<Response>} JSON response indicating success or failure
 *
 * @example
 * ```typescript
 * // POST /blockchain-event
 * {
 *   "type": "blockchain.bet.created",
 *   "data": {
 *     "betId": "123",
 *     "conversationId": "abc",
 *     "messageId": "def",
 *     "creator": "0x123...",
 *     "transactionHash": "0xabc..."
 *   }
 * }
 * ```
 */
app.post("/blockchain-event", async (c) => {
	console.log(
		"🔗 [BLOCKCHAIN-EVENT] Received event from hybrid blockchain forwarder"
	)

	try {
		const body = await c.req.json()
		const { type, data } = body

		if (!type || !data) {
			return c.json(
				{ error: "Invalid event format. Expected { type, data }" } as const,
				400
			)
		}

		console.log(`📡 [BLOCKCHAIN-EVENT] Processing event: ${type}`, data)

		// TODO: Implement your agent's blockchain event handling logic here
		// This could involve:
		// - Sending notifications to XMTP conversations
		// - Updating internal state
		// - Triggering other actions
		// - etc.

		console.log(`✅ [BLOCKCHAIN-EVENT] Event ${type} processed successfully`)

		return c.json({
			success: true,
			message: `Event ${type} processed successfully`
		} as const)
	} catch (error) {
		console.error("❌ [BLOCKCHAIN-EVENT] Error processing event:", error)
		return c.json({ error: "Failed to process blockchain event" } as const, 500)
	}
})

export { app }
