import { type MiddlewareHandler } from "hono"
import { randomUUID } from "node:crypto"
import type { Agent as HybridAgent } from "../core/agent"
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
	agentRunning: boolean
}

interface AgentMessageProcessorOptions<
	TRuntimeExtension = Record<string, never>
> {
	hybridAgent: HybridAgent<TRuntimeExtension>
	xmtpAgent: any // Agent SDK instance
}

export function createAgentMessageProcessor<
	TRuntimeExtension = Record<string, never>
>(
	opts: AgentMessageProcessorOptions<TRuntimeExtension>
): MiddlewareHandler {
	if (!opts?.hybridAgent || !opts?.xmtpAgent) {
		throw new Error(
			"createAgentMessageProcessor: hybridAgent and xmtpAgent are required"
		)
	}

	// Ensure singleton in this process
	if (!(globalThis as any)[BG_STARTED]) {
		;(globalThis as any)[BG_STARTED] = true

		const state: BgState = {
			running: true,
			lastStartAt: Date.now(),
			consecutiveErrors: 0,
			messagesProcessed: 0,
			agentRunning: false
		}
		;(globalThis as any)[BG_STATE] = state

		const ac = new AbortController()
		const signal = ac.signal

		const stop = () => {
			if (!state.running) return
			state.running = false
			ac.abort()
			console.log("[XMTP Agent] Stopping message processor...")
		}
		;(globalThis as any)[BG_STOP] = stop

		process.once("SIGINT", stop)
		process.once("SIGTERM", stop)

		opts.xmtpAgent.on("text", async (ctx: any) => {
			try {
				const selfAddress = await opts.xmtpAgent.client.address
				if (ctx.message.senderAddress === selfAddress) {
					return
				}

				console.log(
					`[XMTP Agent] Processing message: ${ctx.message.content}`
				)
				console.log(
					`[XMTP Agent] Sender: ${ctx.message.senderAddress}`
				)
				console.log(
					`[XMTP Agent] Conversation: ${ctx.conversation.id}`
				)

				// Create a simple message for the hybrid agent
				const messages = [
					{
						id: randomUUID(),
						role: "user" as const,
						parts: [
							{
								type: "text" as const,
								text: ctx.message.content?.toString() || ""
							}
						]
					}
				]

				// Create base runtime context
				const baseRuntime: AgentRuntime = {
					chatId: ctx.conversation.id,
					messages: messages,
					conversation: {
						id: ctx.conversation.id,
						topic: ctx.conversation.topic || ctx.conversation.id,
						peerAddress: ctx.conversation.peerAddress || ctx.message.senderAddress,
						createdAt: ctx.conversation.createdAt || new Date(),
						send: async (content: any) => {
							return await ctx.conversation.send(content)
						},
						messages: async () => {
							const msgs = await ctx.conversation.messages()
							return msgs.map((msg: any) => ({
								id: msg.id,
								content: msg.content,
								contentType: msg.contentType,
								senderAddress: msg.senderAddress,
								senderInboxId: msg.senderInboxId,
								sentAt: msg.sentAt,
								conversation: ctx.conversation,
								conversationId: ctx.conversation.id
							}))
						},
						members: async () => []
					},
					message: {
						id: ctx.message.id,
						content: ctx.message.content,
						contentType: ctx.message.contentType,
						senderAddress: ctx.message.senderAddress,
						senderInboxId: ctx.message.senderInboxId,
						sentAt: ctx.message.sentAt,
						conversation: ctx.conversation,
						conversationId: ctx.conversation.id
					},
					parentMessage: undefined,
					rootMessage: {
						id: ctx.message.id,
						content: ctx.message.content,
						contentType: ctx.message.contentType,
						senderAddress: ctx.message.senderAddress,
						senderInboxId: ctx.message.senderInboxId,
						sentAt: ctx.message.sentAt,
						conversation: ctx.conversation,
						conversationId: ctx.conversation.id
					},
					sender: {
						address: ctx.message.senderAddress,
						inboxId: ctx.message.senderInboxId,
						name: ctx.message.senderAddress
					},
					subjects: {} as Record<string, `0x${string}`>,
					xmtpClient: {
						conversations: () => Promise.resolve([]),
						conversation: () => Promise.resolve(null)
					} as any
				}

				// Create complete runtime context using hybrid agent's createRuntime function
				const runtime = await opts.hybridAgent.createRuntimeContext(baseRuntime)

				console.log("[XMTP Agent] Calling hybrid agent to process message...")
				const result = await opts.hybridAgent.generate(messages, { runtime })

				if (result.text) {
					// Send the response back to the conversation
					await ctx.conversation.send(result.text)
					console.log(`[XMTP Agent] Agent response sent: ${result.text}`)
				}

				state.messagesProcessed++
				state.lastOkAt = Date.now()
				state.consecutiveErrors = 0

				console.log(
					`[XMTP Agent] Message processed successfully. Total: ${state.messagesProcessed}`
				)
			} catch (error) {
				state.lastErrAt = Date.now()
				state.consecutiveErrors++
				console.error("[XMTP Agent] Error processing message:", error)

				// Try to send an error response
				try {
					await ctx.conversation.send(
						"Sorry, I encountered an error processing your message."
					)
				} catch (sendError) {
					console.error(
						"[XMTP Agent] Failed to send error message:",
						sendError
					)
				}
			}
		})

		opts.xmtpAgent.on("error", (error: Error) => {
			state.lastErrAt = Date.now()
			state.consecutiveErrors++
			console.error("[XMTP Agent] Agent error:", error)
		})

		opts.xmtpAgent.start().then(() => {
			state.agentRunning = true
			console.log("[XMTP Agent] Agent started and listening for messages")
		}).catch((error: any) => {
			console.error("[XMTP Agent] Failed to start agent:", error)
		})

		console.log(
			"[XMTP Agent] Message processor started using Agent SDK"
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
