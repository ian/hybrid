/**
 * Get the agent application URL for webhooks and callbacks
 *
 * This function constructs the URL for the main agent application, used primarily
 * for QStash webhooks and external callbacks. It supports multiple deployment
 * environments with fallback logic.
 *
 * @param path - Optional path to append to the base URL (leading slashes are normalized)
 * @returns The complete URL for the agent application
 *
 * @example
 * ```typescript
 * // Get base URL
 * getUrl() // "http://localhost:8454/"
 *
 * // Get URL with path
 * getUrl("/qstash/webhook") // "http://localhost:8454/qstash/webhook"
 * getUrl("api/health") // "http://localhost:8454/api/health"
 * ```
 *
 * @remarks
 * URL resolution priority:
 * 1. `AGENT_URL` environment variable (custom deployment)
 * 2. `RAILWAY_PUBLIC_DOMAIN` environment variable (Railway deployment)
 * 3. `http://localhost:8454/` (default)
 */
export function getUrl(path = "") {
	const trimmedPath = path.replace(/^\/+/, "")

	if (process.env.AGENT_URL) {
		return `https://${process.env.AGENT_URL}/${trimmedPath}`
	}

	if (process.env.RAILWAY_PUBLIC_DOMAIN) {
		return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/${trimmedPath}`
	}

	return `https://localhost:8454/${trimmedPath}`
}
