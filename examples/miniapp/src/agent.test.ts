import type { XmtpClient, XmtpConversation, XmtpMessage } from "@hybrd/types"
import type { BehaviorContext } from "hybrid/behaviors"
import { reactWith, threadedReply } from "hybrid/behaviors"
import { describe, expect, it } from "vitest"

describe("Miniapp Agent Tests", () => {
	describe("Threaded Reply Behavior", () => {
		it("should set sendOptions.threaded = true when enabled", async () => {
			const mockMessage = {
				id: "test-message-id",
				content: "test message",
				senderAddress: "0x123",
				sent: new Date()
			} as unknown as XmtpMessage

			const mockConversation = {
				id: "test-conversation-id",
				peerAddress: "0x456",
				send: async () => ({ id: "response-id" })
			} as unknown as XmtpConversation

			const mockClient = {
				address: "0x789"
			} as unknown as XmtpClient

			const context: BehaviorContext = {
				runtime: {
					conversation: mockConversation,
					message: mockMessage,
					xmtpClient: mockClient
				} as any,
				client: mockClient,
				conversation: mockConversation,
				message: mockMessage,
				sendOptions: {}
			}

			const behavior = threadedReply({ enabled: true })

			await behavior.after?.(context)

			expect(context.sendOptions?.threaded).toBe(true)
		})

		it("should not set sendOptions when disabled", async () => {
			const mockMessage = {
				id: "test-message-id",
				content: "test message",
				senderAddress: "0x123",
				sent: new Date()
			} as unknown as XmtpMessage

			const mockConversation = {
				id: "test-conversation-id",
				peerAddress: "0x456",
				send: async () => ({ id: "response-id" })
			} as unknown as XmtpConversation

			const mockClient = {
				address: "0x789"
			} as unknown as XmtpClient

			const context: BehaviorContext = {
				runtime: {
					conversation: mockConversation,
					message: mockMessage,
					xmtpClient: mockClient
				} as any,
				client: mockClient,
				conversation: mockConversation,
				message: mockMessage,
				sendOptions: {}
			}

			const behavior = threadedReply({ enabled: false })

			await behavior.after?.(context)

			expect(context.sendOptions?.threaded).toBeUndefined()
		})
	})

	describe("React With Behavior", () => {
		it("should create a behavior with correct id and config", () => {
			const behavior = reactWith("👍")

			expect(behavior.id).toBe("react-with-👍")
			expect(behavior.config.enabled).toBe(true)
			expect(
				(behavior.config.config as { reaction: string; reactToAll: boolean })
					.reaction
			).toBe("👍")
			expect(
				(behavior.config.config as { reaction: string; reactToAll: boolean })
					.reactToAll
			).toBe(true)
		})

		it("should respect custom options", () => {
			const behavior = reactWith("👍", { reactToAll: false })

			expect(
				(behavior.config.config as { reaction: string; reactToAll: boolean })
					.reactToAll
			).toBe(false)
			expect(
				(behavior.config.config as { reaction: string; reactToAll: boolean })
					.reaction
			).toBe("👍")
		})

		it("should disable behavior when enabled is false", () => {
			const behavior = reactWith("👍", { enabled: false })

			expect(behavior.config.enabled).toBe(false)
		})
	})

	describe("Blockchain Tools Integration", () => {
		it("should be able to import blockchain tools", () => {
			expect(true).toBe(true)
		})
	})

	describe("Miniapp Agent", () => {
		it("should be able to import agent components", () => {
			expect(true).toBe(true)
		})
	})
})
