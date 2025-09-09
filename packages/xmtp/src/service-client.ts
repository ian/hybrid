/**
 * @fileoverview XMTP Service Client Library
 *
 * Clean, reusable client for making HTTP calls to the XMTP listener service.
 * Handles authentication, request formatting, and error handling.
 *
 * This is different from the direct XMTP client - this is for external services
 * talking to our XMTP listener service.
 */

import type {
	GetMessageParams,
	SendMessageParams,
	SendMessageResponse,
	SendReactionParams,
	SendReactionResponse,
	SendReplyParams,
	SendReplyResponse,
	SendTransactionParams,
	SendTransactionResponse,
	XmtpServiceClientConfig,
	XmtpServiceMessage,
	XmtpServiceResponse
} from "./types"
import { xmtpDebug, xmtpDebugError } from "./lib/jwt"

export class XmtpServiceClient {
	private config: XmtpServiceClientConfig

	constructor(config: XmtpServiceClientConfig) {
		this.config = config
	}

	private async request<T = unknown>(
		endpoint: string,
		body?: Record<string, unknown>,
		method: "GET" | "POST" = "POST"
	): Promise<XmtpServiceResponse<T>> {
		const startTime = performance.now()
		xmtpDebug(`🌐 [HTTP] Starting ${method} request to ${endpoint}`)
		
		try {
			const baseUrl = this.config.serviceUrl.replace(/\/+$/, "")

			// Use Authorization header for xmtp-tools endpoints, query parameter for others
			const isXmtpToolsEndpoint = endpoint.startsWith("/xmtp-tools/")
			const url = `${baseUrl}${endpoint}?token=${this.config.serviceToken}`

			const headers: Record<string, string> = {
				"Content-Type": "application/json"
			}

			// Add Authorization header for xmtp-tools endpoints
			if (isXmtpToolsEndpoint) {
				headers.Authorization = `Bearer ${this.config.serviceToken}`
			}

			const fetchOptions: RequestInit = {
				method,
				headers
			}

			if (method === "POST" && body) {
				fetchOptions.body = JSON.stringify(body)
			}

			const sanitizedUrl = `${baseUrl}${endpoint}?token=***`
			xmtpDebug(`🌐 [HTTP] Making fetch request to ${sanitizedUrl}`)
			const fetchStartTime = performance.now()
			
			const response = await fetch(url, fetchOptions)
			
			const fetchEndTime = performance.now()
			xmtpDebug(`🌐 [HTTP] Fetch completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms, status: ${response.status}`)

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}`
				try {
					const responseText = await response.text()
					try {
						const errorData = JSON.parse(responseText) as { error?: string }
						errorMessage = errorData.error || errorMessage
					} catch {
						errorMessage = responseText || errorMessage
					}
				} catch {
					// If we can't read the response at all, use the status
				}
				
				const endTime = performance.now()
				xmtpDebug(`🌐 [HTTP] Request failed in ${(endTime - startTime).toFixed(2)}ms: ${errorMessage}`)
				throw new Error(errorMessage)
			}

			const jsonStartTime = performance.now()
			const result = {
				success: true,
				data: (await response.json()) as T
			}
			const jsonEndTime = performance.now()
			xmtpDebug(`🌐 [HTTP] JSON parsing completed in ${(jsonEndTime - jsonStartTime).toFixed(2)}ms`)
			
			const endTime = performance.now()
			xmtpDebug(`🌐 [HTTP] Total request completed in ${(endTime - startTime).toFixed(2)}ms`)
			
			return result
		} catch (error) {
			const endTime = performance.now()
			xmtpDebugError(
				`❌ [XmtpServiceClient] Request to ${endpoint} failed in ${(endTime - startTime).toFixed(2)}ms:`,
				error
			)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error"
			}
		}
	}

	async sendMessage(
		params: SendMessageParams
	): Promise<XmtpServiceResponse<SendMessageResponse>> {
		return this.request<SendMessageResponse>("/xmtp-tools/send", {
			content: params.content
		})
	}

	async sendReply(
		params: SendReplyParams
	): Promise<XmtpServiceResponse<SendReplyResponse>> {
		return this.request<SendReplyResponse>("/xmtp-tools/reply", {
			content: params.content,
			messageId: params.messageId
		})
	}

	async sendReaction(
		params: SendReactionParams
	): Promise<XmtpServiceResponse<SendReactionResponse>> {
		return this.request<SendReactionResponse>("/xmtp-tools/react", {
			messageId: params.messageId,
			emoji: params.emoji,
			action: params.action
		})
	}

	async sendTransaction(
		params: SendTransactionParams
	): Promise<XmtpServiceResponse<SendTransactionResponse>> {
		return this.request<SendTransactionResponse>("/xmtp-tools/transaction", {
			fromAddress: params.fromAddress,
			chainId: params.chainId,
			calls: params.calls.map((call) => ({
				to: call.to,
				data: call.data,
				...(call.gas && { gas: call.gas }),
				value: call.value || "0x0",
				metadata: {
					...call.metadata,
					chainId: params.chainId,
					from: params.fromAddress,
					version: "1"
				}
			}))
		})
	}

	/**
	 * Get a single message by ID
	 */
	async getMessage(
		params: GetMessageParams
	): Promise<XmtpServiceResponse<XmtpServiceMessage>> {
		return this.request<XmtpServiceMessage>(
			`/xmtp-tools/messages/${params.messageId}`,
			undefined,
			"GET"
		)
	}

	// getConversationMessages removed - superseded by thread-based approach
}

/**
 * Create an XMTP service client from runtime context
 * Expects the runtime context to have xmtpServiceUrl and xmtpServiceToken
 */
export function createXmtpServiceClient(
	serviceUrl: string,
	serviceToken: string
): XmtpServiceClient {
	if (!serviceUrl || !serviceToken) {
		throw new Error("Missing XMTP service URL or token from runtime context")
	}

	return new XmtpServiceClient({
		serviceUrl,
		serviceToken
	})
}

export interface XmtpAuthConfig {
	serviceUrl: string
	serviceToken: string
	source: "callback" | "environment"
}

/**
 * Get XMTP authentication configuration from multiple sources
 * Priority: callback credentials > environment credentials
 */
export function getXmtpAuthConfig(
	callbackUrl?: string,
	callbackToken?: string
): XmtpAuthConfig | null {
	// Priority 1: Use callback credentials if available
	if (callbackUrl && callbackToken) {
		console.log("🔑 [XmtpAuth] Using callback-provided credentials")
		return {
			serviceUrl: callbackUrl,
			serviceToken: callbackToken,
			source: "callback"
		}
	}

	// Priority 2: Use environment credentials
	const envUrl = process.env.XMTP_HOST
	const envToken = process.env.XMTP_API_KEY

	if (envUrl && envToken) {
		console.log("🔑 [XmtpAuth] Using environment credentials")
		return {
			serviceUrl: envUrl,
			serviceToken: envToken,
			source: "environment"
		}
	}

	// No valid credentials found
	console.error(
		"❌ [XmtpAuth] No XMTP credentials found in callback or environment"
	)
	console.error(
		"💡 [XmtpAuth] Expected: XMTP_HOST + XMTP_API_KEY or callback credentials"
	)
	return null
}

/**
 * Create an authenticated XMTP service client
 * Handles both callback and environment credential sources
 */
export function createAuthenticatedXmtpClient(
	callbackUrl?: string,
	callbackToken?: string
): XmtpServiceClient {
	const authConfig = getXmtpAuthConfig(callbackUrl, callbackToken)

	if (!authConfig) {
		throw new Error("No XMTP credentials found")
	}

	console.log(
		`🔗 [XmtpAuth] Creating XMTP client (${authConfig.source} credentials)`
	)

	return createXmtpServiceClient(authConfig.serviceUrl, authConfig.serviceToken)
}

/**
 * Constructs a URL for XMTP tools API endpoints with token authentication
 *
 * @param {string} baseUrl - The base URL of the XMTP service (e.g., "https://api.example.com")
 * @param {string} action - The specific action/endpoint to call (e.g., "send", "receive", "status")
 * @param {string} token - Authentication token (either JWT or API key)
 * @returns {string} Complete URL with token as query parameter
 *
 * @description
 * Builds URLs for XMTP tools endpoints using query parameter authentication.
 * The token is appended as a query parameter for GET request authentication,
 * following the pattern: `/xmtp-tools/{action}?token={token}`
 *
 * @example
 * ```typescript
 * const url = getXMTPToolsUrl(
 *   "https://api.hybrid.dev",
 *   "send",
 *   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * );
 * // Returns: "https://api.hybrid.dev/xmtp-tools/send?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * ```
 *
 * @example
 * ```typescript
 * // Using with API key
 * const url = getXMTPToolsUrl(
 *   process.env.XMTP_BASE_URL,
 *   "status",
 *   process.env.XMTP_API_KEY
 * );
 * ```
 */
export function getXMTPToolsUrl(
	baseUrl: string,
	action: string,
	token: string
): string {
	return `${baseUrl}/xmtp-tools/${action}?token=${token}`
}
