export interface BlockchainEvent {
	type: string
	data: Record<string, unknown>
}

export interface BlockchainForwarderConfig {
	agentUrl: string
	apiKey?: string
	maxRetries?: number
	timeout?: number
}

export class BlockchainForwarder {
	private config: BlockchainForwarderConfig
	private readonly maxRetries: number
	private readonly timeout: number

	constructor(config: BlockchainForwarderConfig) {
		this.config = config
		this.maxRetries = config.maxRetries || 3
		this.timeout = config.timeout || 10000
	}

	private async request(
		endpoint: string,
		body: BlockchainEvent
	): Promise<{ success: boolean; error?: string }> {
		try {
			const url = `${this.config.agentUrl}${endpoint}`

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), this.timeout)

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(this.config.apiKey && {
						Authorization: `Bearer ${this.config.apiKey}`
					})
				},
				body: JSON.stringify(body),
				signal: controller.signal
			})

			clearTimeout(timeoutId)

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
				throw new Error(errorMessage)
			}

			return { success: true }
		} catch (error) {
			console.error(
				`❌ [BLOCKCHAIN-FORWARDER] Request to ${endpoint} failed:`,
				error
			)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error"
			}
		}
	}

	async forwardEvent(event: BlockchainEvent): Promise<boolean> {
		for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
			const result = await this.request("/blockchain-event", event)

			if (result.success) {
				return true
			}

			// Don't retry on 4xx errors (client errors)
			if (result.error?.includes("HTTP 4")) {
				return false
			}

			if (attempt === this.maxRetries) {
				return false
			}

			// Wait before retry with exponential backoff
			const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
			await new Promise((resolve) => setTimeout(resolve, delay))
		}

		return false
	}
}

// Ponder integration - automatically forward blockchain events
export function createPonderBlockchainForwarder(
	options: { apiKey?: string; agentUrl?: string } = {}
) {
	const agentUrl = deriveAgentUrl(options.agentUrl)
	const forwarder = new BlockchainForwarder({
		agentUrl,
		apiKey: options.apiKey || process.env.XMTP_API_KEY,
		maxRetries: 3,
		timeout: 10000
	})

	// Return a function that Ponder can use to forward events
	return async (eventType: string, eventData: Record<string, unknown>) => {
		try {
			const success = await forwarder.forwardEvent({
				type: eventType,
				data: eventData
			})

			if (success) {
				console.log(`✅ [PONDER] Successfully forwarded ${eventType}`)
			} else {
				console.error(`❌ [PONDER] Failed to forward ${eventType}`)
			}

			return success
		} catch (error) {
			console.error(`💥 [PONDER] Error forwarding ${eventType}:`, error)
			return false
		}
	}
}

function deriveAgentUrl(defaultUrl?: string) {
	if (defaultUrl) {
		return defaultUrl.startsWith("http") ? defaultUrl : `https://${defaultUrl}`
	}

	if (process.env.AGENT_URL) {
		return process.env.AGENT_URL.startsWith("http")
			? process.env.AGENT_URL
			: `https://${process.env.AGENT_URL}`
	}

	return "http://localhost:8454"
}
