import {
	type MessageEvent,
	AgentMessageListener,
	XmtpClient,
	createAuthenticatedXmtpClient,
	generateXMTPToolsToken
} from "@hybrd/xmtp"
import { type MiddlewareHandler } from "hono"
import { randomUUID } from "node:crypto"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"
import type { Agent } from "../core/agent"
import type { AgentRuntime } from "../types"

// Global state management
const BG_STARTED = Symbol("BG_STARTED")
const BG_STATE = Symbol("BG_STATE")
const BG_STOP = Symbol("BG_STOP")

interface BgState {
	running: boolean
	lastStartAt: number
	lastOkAt?: number
	lastErrAt?: number
	consecutiveErrors: number
	messagesProcessed: number
	listenerRunning: boolean
}

interface BackgroundMessageProcessorOptions<
	TRuntimeExtension = Record<string, never>
> {
	agent: Agent<TRuntimeExtension>
	xmtpClient: XmtpClient
	messageFilter?: (
		event: Pick<MessageEvent, "conversation" | "message" | "rootMessage">
	) => Promise<boolean> | boolean
	intervalMs?: number
	backoffMs?: number
	maxBackoffMs?: number
}

function sleep(ms: number, signal?: AbortSignal) {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new Error("AbortError"))
			return
		}

		const timeout = setTimeout(resolve, ms)

		if (signal) {
			signal.addEventListener(
				"abort",
				() => {
					clearTimeout(timeout)
					reject(new Error("AbortError"))
				},
				{ once: true }
			)
		}
	})
}

export function createBackgroundMessageProcessor<
	TRuntimeExtension = Record<string, never>
>(
	opts: BackgroundMessageProcessorOptions<TRuntimeExtension>
): MiddlewareHandler {
	if (!opts?.agent || !opts?.xmtpClient) {
		throw new Error(
			"createBackgroundMessageProcessor: agent and xmtpClient are required"
		)
	}

	const intervalMs = Math.max(250, opts.intervalMs ?? 5_000) // Check every 5 seconds by default
	const baseBackoffMs = Math.max(100, opts.backoffMs ?? 1_000)
	const maxBackoffMs = Math.max(baseBackoffMs, opts.maxBackoffMs ?? 30_000)

	// Ensure singleton in this process
	if (!(globalThis as any)[BG_STARTED]) {
		;(globalThis as any)[BG_STARTED] = true

		const state: BgState = {
			running: true,
			lastStartAt: Date.now(),
			consecutiveErrors: 0,
			messagesProcessed: 0,
			listenerRunning: false
		}
		;(globalThis as any)[BG_STATE] = state

		const ac = new AbortController()
		const signal = ac.signal

		const stop = () => {
			if (!state.running) return
			state.running = false
			ac.abort()
			console.log("[XMTP Background] Stopping message processor...")
		}
		;(globalThis as any)[BG_STOP] = stop

		process.once("SIGINT", stop)
		process.once("SIGTERM", stop)

		// Create public client for address resolution
		const publicClient = createPublicClient({
			chain: base,
			transport: http()
		})

		// Create message listener using Agent SDK
		const listener = new AgentMessageListener({
			client: opts.xmtpClient,
			filter: opts.messageFilter
		})

		// Set up message event handler
		listener.on("message", async (messageEvent: MessageEvent) => {
			try {
				console.log(
					`[XMTP Background] Processing message: ${messageEvent.message.content}`
				)
				console.log(
					`[XMTP Background] Sender: ${messageEvent.sender?.address || "unknown"}`
				)
				console.log(
					`[XMTP Background] Conversation: ${messageEvent.message.conversationId}`
				)

				// Create a simple message for the agent
				const messages = [
					{
						id: randomUUID(),
						role: "user" as const,
						parts: [
							{
								type: "text" as const,
								text: messageEvent.message.content?.toString() || ""
							}
						]
					}
				]

				// Create service client for agent runtime
				const serviceUrl = process.env.AGENT_URL || "http://localhost:8454"
				const serviceToken = generateXMTPToolsToken({
					action: "send",
					conversationId: messageEvent.message.conversationId || messageEvent.conversation.id,
					content: messageEvent.message.content?.toString() || ""
				})
				const serviceClient = createAuthenticatedXmtpClient(
					serviceUrl,
					serviceToken
				)

				// Create base runtime context
				const baseRuntime: AgentRuntime = {
					chatId: messageEvent.message.conversationId || messageEvent.conversation.id,
					messages: messages,
					conversation: messageEvent.conversation,
					message: messageEvent.message,
					parentMessage: messageEvent.parentMessage,
					rootMessage: messageEvent.rootMessage,
					sender: messageEvent.sender,
					subjects: messageEvent.subjects,
					xmtpClient: serviceClient
				}

				// Create complete runtime context using agent's createRuntime function
				const runtime = await opts.agent.createRuntimeContext(baseRuntime)

				// Call the agent to process the message
				console.log("[XMTP Background] Calling agent to process message...")
				const result = await opts.agent.generate(messages, { runtime })

				if (result.text) {
					// Send the response back to the conversation
					await messageEvent.conversation.send(result.text)
					console.log(`[XMTP Background] Agent response sent: ${result.text}`)
				}

				state.messagesProcessed++
				state.lastOkAt = Date.now()
				state.consecutiveErrors = 0

				console.log(
					`[XMTP Background] Message processed successfully. Total: ${state.messagesProcessed}`
				)
			} catch (error) {
				state.lastErrAt = Date.now()
				state.consecutiveErrors++
				console.error("[XMTP Background] Error processing message:", error)

				// Try to send an error response
				try {
					await messageEvent.conversation.send(
						"Sorry, I encountered an error processing your message."
					)
				} catch (sendError) {
					console.error(
						"[XMTP Background] Failed to send error message:",
						sendError
					)
				}
			}
		})

		listener.on("error", (error: Error) => {
			state.lastErrAt = Date.now()
			state.consecutiveErrors++
			console.error("[XMTP Background] Message listener error:", error)
		})

		listener.on("started", () => {
			state.listenerRunning = true
			console.log("[XMTP Background] Message listener started")
		})

		listener.on("stopped", () => {
			state.listenerRunning = false
			console.log("[XMTP Background] Message listener stopped")
		})

		listener.on("heartbeat", (stats: any) => {
			console.log(
				`[XMTP Background] Heartbeat - Messages: ${stats.messageCount}, Conversations: ${stats.conversationCount}`
			)
		})

		// Background supervisor loop
		;(async function supervise() {
			let nextDelay = intervalMs

			while (state.running) {
				try {
					// Start the listener if not already running
					if (!state.listenerRunning) {
						console.log("[XMTP Background] Starting message listener...")
						await listener.start()
					}

					// Check listener health
					if (state.listenerRunning) {
						state.lastOkAt = Date.now()
						state.consecutiveErrors = 0
						nextDelay = intervalMs
					} else {
						throw new Error("Message listener is not running")
					}
				} catch (error) {
					state.lastErrAt = Date.now()
					state.consecutiveErrors += 1
					const backoff = Math.min(
						maxBackoffMs,
						baseBackoffMs * 2 ** (state.consecutiveErrors - 1)
					)
					nextDelay = backoff
					console.error("[XMTP Background] Supervisor error:", error)

					// Try to restart the listener
					try {
						if (state.listenerRunning) {
							await listener.stop()
						}
						await sleep(1000) // Wait 1 second before restarting
					} catch (restartError) {
						console.error(
							"[XMTP Background] Error restarting listener:",
							restartError
						)
					}
				}

				// Sleep with abort signal support for faster shutdown
				try {
					await sleep(nextDelay, signal)
				} catch (error) {
					if (error instanceof Error && error.name === "AbortError") {
						break // Exit the loop on abort
					}
					throw error
				}
			}

			// Cleanup on exit
			try {
				if (state.listenerRunning) {
					console.log("[XMTP Background] Stopping message listener...")
					await listener.stop()
				}
			} catch (error) {
				console.error("[XMTP Background] Error stopping listener:", error)
			}

			console.log("[XMTP Background] Supervisor stopped")
		})()

		console.log(
			"[XMTP Background] Message processor started (always-on, in-process)"
		)
	}

	// Middleware is a pass-through; registering it ensures the processor is active
	return async (_c, next) => next()
}

// Optional helpers to inspect/stop from your server code
export function getBgState(): BgState | undefined {
	return (globalThis as any)[BG_STATE] as BgState | undefined
}

export function stopBackground(): void {
	const fn = (globalThis as any)[BG_STOP] as (() => void) | undefined
	if (fn) fn()
}
