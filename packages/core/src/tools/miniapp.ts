import { createTool } from "../core/tool"
import { logger } from "@hybrd/utils"
import { z } from "zod"

/**
 * Launch Miniapp Tool
 *
 * Launches a Base miniapp by sending its URL via XMTP message.
 * This enables agents to deliver and launch miniapps from chat conversations.
 *
 * @tool launchMiniapp
 * @category Communication
 *
 * @param {string} miniappUrl - The URL of the Base miniapp to launch
 * @param {string} [message] - Optional accompanying message text
 *
 * @returns {Promise<{success: boolean, messageId?: string, content: string, error?: string}>}
 */
export const launchMiniappTool = createTool({
	id: "launchMiniapp",
	description: "Launch a Base miniapp by sending its URL via XMTP",
	inputSchema: z.object({
		miniappUrl: z.string().url().describe("The URL of the Base miniapp to launch"),
		message: z.string().optional().describe("Optional accompanying message text")
	}),
	outputSchema: z.object({
		success: z.boolean(),
		messageId: z.string().optional(),
		content: z.string(),
		error: z.string().optional()
	}),
	execute: async ({ input, runtime }) => {
		const startTime = performance.now()
		logger.debug(
			`🚀 [Tool:launchMiniapp] Starting execution with URL: "${input.miniappUrl}"`
		)

		try {
			const xmtpClient = runtime.xmtpClient
			const { miniappUrl, message } = input
			const { conversation } = runtime

			if (!xmtpClient) {
				const endTime = performance.now()
				logger.debug(
					`🚀 [Tool:launchMiniapp] Failed - no XMTP client in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content: miniappUrl,
					error: "XMTP service not available"
				}
			}

			const content = message ? `${message}\n\n${miniappUrl}` : miniappUrl

			logger.debug(
				`🚀 [launchMiniapp] Sending miniapp URL: "${miniappUrl}"`
			)

			const sendStartTime = performance.now()
			const messageId = await conversation.send(content)
			const sendEndTime = performance.now()
			logger.debug(
				`🚀 [Tool:launchMiniapp] XMTP client send completed in ${(sendEndTime - sendStartTime).toFixed(2)}ms`
			)

			if (!messageId) {
				const endTime = performance.now()
				logger.debug(
					`🚀 [Tool:launchMiniapp] Failed in ${(endTime - startTime).toFixed(2)}ms`
				)
				return {
					success: false,
					content,
					error: "Failed to send miniapp URL"
				}
			}

			logger.debug(`✅ [launchMiniapp] Miniapp URL sent successfully`)

			const endTime = performance.now()
			logger.debug(
				`🚀 [Tool:launchMiniapp] Total execution completed in ${(endTime - startTime).toFixed(2)}ms`
			)

			return {
				success: true,
				messageId,
				content
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			const endTime = performance.now()
			logger.error(
				`❌ [Tool:launchMiniapp] Error in ${(endTime - startTime).toFixed(2)}ms:`,
				errorMessage
			)
			return {
				success: false,
				content: input.message ? `${input.message}\n\n${input.miniappUrl}` : input.miniappUrl,
				error: errorMessage
			}
		}
	}
})

/**
 * Collection of miniapp tools for crypto agents
 *
 * These tools provide capabilities for launching and delivering miniapps
 * through conversational interfaces via XMTP messaging.
 *
 * @namespace miniAppTools
 *
 * @property {Tool} launchMiniapp - Launch a Base miniapp by sending its URL
 */
export const miniAppTools = {
	launchMiniapp: launchMiniappTool
}
