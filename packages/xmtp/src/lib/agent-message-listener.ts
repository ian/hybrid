import { EventEmitter } from "node:events"
import type { MessageEvent, XmtpClient } from "../types"

export interface AgentMessageListenerConfig {
	client: XmtpClient
	filter?: (
		event: Pick<MessageEvent, "conversation" | "message" | "rootMessage">
	) => Promise<boolean> | boolean
	resolver?: (messageOrCtx: any) => Promise<MessageEvent>
}

export class AgentMessageListener extends EventEmitter {
	private client: XmtpClient
	private agent: any
	private filter?: AgentMessageListenerConfig["filter"]
	private resolver?: AgentMessageListenerConfig["resolver"]
	private isListening = false
	private textHandler?: (ctx: any) => Promise<void>
	private reactionHandler?: (ctx: any) => Promise<void>
	private replyHandler?: (ctx: any) => Promise<void>

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

			this.textHandler = async (ctx: any) => {
				try {
					if (await this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing text message:", error)
					this.emit("error", error)
				}
			}

			this.reactionHandler = async (ctx: any) => {
				try {
					if (await this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing reaction message:", error)
					this.emit("error", error)
				}
			}

			this.replyHandler = async (ctx: any) => {
				try {
					if (await this.shouldProcessMessage(ctx)) {
						const messageEvent = this.resolver
							? await this.resolver(ctx)
							: this.createDefaultMessageEvent(ctx)

						this.emit("message", messageEvent)
					}
				} catch (error) {
					console.error("Error processing reply message:", error)
					this.emit("error", error)
				}
			}

			await this.agent.start()
			
			this.agent.on("text", this.textHandler)
			this.agent.on("reaction", this.reactionHandler)
			this.agent.on("reply", this.replyHandler)

			console.log("XMTP agent started successfully")
			this.emit("started")
		} catch (error) {
			console.error("Error starting agent:", error)
			this.emit("error", error)
			this.isListening = false
			this.cleanupHandlers()
		}
	}

	stop(): void {
		this.cleanupHandlers()
		this.isListening = false
		console.log("XMTP agent message listener stopped")
		this.emit("stopped")
	}

	private cleanupHandlers(): void {
		if (this.agent) {
			if (this.textHandler) {
				this.agent.off("text", this.textHandler)
			}
			if (this.reactionHandler) {
				this.agent.off("reaction", this.reactionHandler)
			}
			if (this.replyHandler) {
				this.agent.off("reply", this.replyHandler)
			}
		}
	}

	private async shouldProcessMessage(ctx: any): Promise<boolean> {
		if (!this.filter) return true

		const messageEvent = this.createDefaultMessageEvent(ctx)
		return await this.filter(messageEvent)
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
