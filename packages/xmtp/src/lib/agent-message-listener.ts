import { EventEmitter } from "node:events"
import type { MessageEvent, XmtpClient } from "../types"

export interface AgentMessageListenerConfig {
	client: XmtpClient
	filter?: {
		senderAddress?: string
		conversationId?: string
	}
	resolver?: (messageOrCtx: any) => Promise<MessageEvent>
}

export class AgentMessageListener extends EventEmitter {
	private client: XmtpClient
	private agent: any
	private filter?: AgentMessageListenerConfig["filter"]
	private resolver?: AgentMessageListenerConfig["resolver"]
	private isListening = false

	constructor(config: AgentMessageListenerConfig) {
		super()
		this.client = config.client
		this.agent = (config.client as any).getAgent()
		this.filter = config.filter
		this.resolver = config.resolver
	}

	async start(): Promise<void> {
		if (this.isListening) {
			console.warn("AgentMessageListener is already listening")
			return
		}

		this.isListening = true

		try {
			console.log("Starting XMTP agent message listener...")

			this.agent.on("text", async (ctx: any) => {
				try {
					if (this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing text message:", error)
					this.emit("error", error)
				}
			})

			this.agent.on("reaction", async (ctx: any) => {
				try {
					if (this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing reaction message:", error)
					this.emit("error", error)
				}
			})

			this.agent.on("reply", async (ctx: any) => {
				try {
					if (this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing reply message:", error)
					this.emit("error", error)
				}
			})

			await this.agent.start()
			console.log("XMTP agent started successfully")
		} catch (error) {
			console.error("Error starting agent:", error)
			this.emit("error", error)
			this.isListening = false
		}
	}

	stop(): void {
		if (this.agent) {
			this.agent.removeAllListeners()
		}
		this.isListening = false
		console.log("XMTP agent message listener stopped")
	}

	private shouldProcessMessage(ctx: any): boolean {
		if (!this.filter) return true

		if (this.filter.senderAddress && ctx.message?.senderAddress !== this.filter.senderAddress) {
			return false
		}

		if (this.filter.conversationId && ctx.conversation?.id !== this.filter.conversationId) {
			return false
		}

		return true
	}

	private createDefaultMessageEvent(ctx: any): MessageEvent {
		const message = ctx.message || ctx
		const conversation = ctx.conversation

		return {
			conversation: conversation || {
				id: "",
				topic: "",
				peerAddress: "",
				createdAt: new Date(),
				send: async () => ({ id: "", content: "", senderAddress: "", sentAt: new Date(), conversation: null }),
				messages: async () => []
			},
			message: {
				id: message.id || Date.now().toString(),
				content: message.content || ctx.content,
				senderAddress: message.senderAddress || ctx.senderAddress,
				sentAt: message.sentAt || new Date(),
				conversation: conversation
			},
			rootMessage: {
				id: message.id || Date.now().toString(),
				content: message.content || ctx.content,
				senderAddress: message.senderAddress || ctx.senderAddress,
				sentAt: message.sentAt || new Date(),
				conversation: conversation
			},
			sender: {
				address: message.senderAddress || ctx.senderAddress || "",
				inboxId: "",
				name: ""
			},
			subjects: {}
		}
	}

	get listening(): boolean {
		return this.isListening
	}
}
