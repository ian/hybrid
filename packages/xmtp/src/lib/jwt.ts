import { Context } from "hono"
import jwt from "jsonwebtoken"

export interface XMTPToolsPayload {
	action: "send" | "reply" | "react" | "transaction" | "blockchain-event"
	conversationId: string
	// Action-specific data
	content?: string
	referenceMessageId?: string
	emoji?: string
	actionType?: "added" | "removed"
	fromAddress?: string
	chainId?: string
	calls?: Array<{
		to: string
		data: string
		metadata?: {
			description: string
			transactionType: string
		}
	}>
	// Metadata
	issued: number
	expires: number
}

/**
 * Validates token and returns payload for both GET and POST endpoints
 *
 * @param {Context} c - Hono context object containing request information
 * @returns {XMTPToolsPayload | null} The validated payload or null if invalid
 *
 * @description
 * Supports two authentication methods:
 * - Authorization header with Bearer token (for POST endpoints)
 * - Query parameter token (for GET endpoints)
 *
 * @example
 * ```typescript
 * app.post("/api/endpoint", async (c) => {
 *   const payload = getValidatedPayload(c);
 *   if (!payload) {
 *     return c.json({ error: "Invalid token" }, 401);
 *   }
 *   // Use payload data
 * });
 * ```
 */
export function getValidatedPayload(c: Context): XMTPToolsPayload | null {
	// Try Authorization header first (for POST endpoints)
	const authHeader = c.req.header("Authorization")
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.substring(7) // Remove "Bearer " prefix
		return validateXMTPToolsToken(token)
	}

	// Fall back to query parameter (for GET endpoints)
	const token = c.req.query("token")
	if (!token) {
		return null
	}

	return validateXMTPToolsToken(token)
}

/**
 * JWT secret key used for signing and verifying tokens
 * Requires XMTP_JWT_SECRET environment variable in production
 * Only falls back to development secret in development/test environments
 */
const JWT_SECRET = (() => {
	const secret = process.env.XMTP_JWT_SECRET
	const nodeEnv = process.env.NODE_ENV || "development"

	// In production, require a real JWT secret
	if (nodeEnv === "production" && !secret) {
		throw new Error(
			"XMTP_JWT_SECRET environment variable is required in production. " +
				"Generate a secure random secret for JWT token signing."
		)
	}

	// In development/test, allow fallback but warn
	if (!secret) {
		console.warn(
			"⚠️  [SECURITY] Using fallback JWT secret for development. " +
				"Set XMTP_JWT_SECRET environment variable for production."
		)
		return "fallback-secret-for-dev-only"
	}

	return secret
})()

/**
 * API key used for simple authentication bypass
 * Requires XMTP_API_KEY environment variable in production
 * Only falls back to development key in development/test environments
 */
const API_KEY = (() => {
	const apiKey = process.env.XMTP_API_KEY
	const nodeEnv = process.env.NODE_ENV || "development"

	// In production, require a real API key
	if (nodeEnv === "production" && !apiKey) {
		throw new Error(
			"XMTP_API_KEY environment variable is required in production. " +
				"Generate a secure random API key for authentication."
		)
	}

	// In development/test, allow fallback but warn
	if (!apiKey) {
		console.warn(
			"⚠️  [SECURITY] Using fallback API key for development. " +
				"Set XMTP_API_KEY environment variable for production."
		)
		return "fallback-api-key-for-dev-only"
	}

	return apiKey
})()

/**
 * JWT token expiry time in seconds (5 minutes)
 */
const JWT_EXPIRY = 5 * 60 // 5 minutes in seconds

/**
 * Generates a signed JWT token for XMTP tools authentication
 *
 * @param {Omit<XMTPToolsPayload, "issued" | "expires">} payload - Token payload without timestamp fields
 * @returns {string} Signed JWT token
 *
 * @description
 * Creates a JWT token with automatic timestamp fields:
 * - issued: Current timestamp
 * - expires: Current timestamp + JWT_EXPIRY
 *
 * @example
 * ```typescript
 * const token = generateXMTPToolsToken({
 *   action: "send",
 *   conversationId: "0x123..."
 * });
 * ```
 */
export function generateXMTPToolsToken(
	payload: Omit<XMTPToolsPayload, "issued" | "expires">
): string {
	const now = Math.floor(Date.now() / 1000)
	const fullPayload: XMTPToolsPayload = {
		...payload,
		issued: now,
		expires: now + JWT_EXPIRY
	}

	return jwt.sign(fullPayload, JWT_SECRET, {
		expiresIn: JWT_EXPIRY
	})
}

/**
 * Validates an XMTP tools token using either API key or JWT verification
 *
 * @param {string} token - Token to validate (either API key or JWT)
 * @returns {XMTPToolsPayload | null} Validated payload or null if invalid
 *
 * @description
 * Supports two authentication methods in order of precedence:
 * 1. API key authentication - Direct comparison with XMTP_API_KEY
 * 2. JWT token authentication - Signature verification and expiry check
 *
 * For API key authentication, returns a default payload with 1-hour expiry.
 * For JWT authentication, validates signature and checks expiry timestamp.
 *
 * @example
 * ```typescript
 * const payload = validateXMTPToolsToken(userToken);
 * if (payload) {
 *   console.log(`Action: ${payload.action}`);
 *   console.log(`Conversation: ${payload.conversationId}`);
 * }
 * ```
 */
export function validateXMTPToolsToken(token: string): XMTPToolsPayload | null {
	// First try API key authentication
	if (token === API_KEY) {
		console.log("🔑 [Auth] Using API key authentication")
		// Return a valid payload for API key auth
		const now = Math.floor(Date.now() / 1000)
		return {
			action: "send", // Default action
			conversationId: "", // Will be filled by endpoint
			issued: now,
			expires: now + 3600 // API keys are valid for 1 hour
		}
	}

	// Then try JWT token authentication
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as XMTPToolsPayload
		console.log("🔑 [Auth] Using JWT token authentication")

		// Additional expiry check
		const now = Math.floor(Date.now() / 1000)
		if (decoded.expires < now) {
			console.warn("🔒 XMTP tools token has expired")
			return null
		}

		return decoded
	} catch (error) {
		console.error(
			"🔒 Invalid XMTP tools token and not matching API key:",
			error
		)
		return null
	}
}
