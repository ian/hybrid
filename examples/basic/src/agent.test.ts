import type { XmtpClient, XmtpConversation, XmtpMessage } from "@hybrd/types"
import type { BehaviorContext } from "hybrid/behaviors"
import { reactWith, threadedReply } from "hybrid/behaviors"
import { describe, expect, it } from "vitest"

describe("Threaded Reply Behavior", () => {
	it("should set sendOptions.threaded = true when enabled", async () => {
		// Create a mock behavior context
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

		// Create the threaded reply behavior
		const behavior = threadedReply({ enabled: true })

		// Execute the behavior
		await behavior.after?.(context)

		// Check that sendOptions.threaded was set
		expect(context.sendOptions?.threaded).toBe(true)
	})

	it("should not set sendOptions when disabled", async () => {
		// Create a mock behavior context
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

		// Create the threaded reply behavior with disabled
		const behavior = threadedReply({ enabled: false })

		// Execute the behavior
		await behavior.after?.(context)

		// Check that sendOptions.threaded was not set
		expect(context.sendOptions?.threaded).toBeUndefined()
	})

	it("should set sendOptions.threaded = true when enabled", async () => {
		// Create a mock behavior context
		const mockMessage = {
			id: "test-message-id",
			content: "threaded message",
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

		// Create the threaded reply behavior
		const behavior = threadedReply({ enabled: true })

		// Execute the behavior
		await behavior.after?.(context)

		// Check that sendOptions.threaded was set
		expect(context.sendOptions?.threaded).toBe(true)
	})

	it("should not set sendOptions when disabled", async () => {
		// Create a mock behavior context
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

		// Create the threaded reply behavior with disabled
		const behavior = threadedReply({ enabled: false })

		// Execute the behavior
		await behavior.after?.(context)

		// Check that sendOptions.threaded was not set
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

	it("should create a behavior with correct config", () => {
		const behavior = reactWith("👍", { reactToAll: false })

		expect(behavior.config.config).toBeDefined()
		expect(
			(behavior.config.config as { reaction: string; reactToAll: boolean })
				.reaction
		).toBe("👍")
		expect(
			(behavior.config.config as { reaction: string; reactToAll: boolean })
				.reactToAll
		).toBe(false)
	})
})

describe("Behavior Registry System", () => {
	it("should register and execute behaviors", async () => {
		// Create a mock registry context
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

		// Create behaviors
		const threadBehavior = threadedReply({ enabled: true })
		const reactBehavior = reactWith("👍", { enabled: true })

		// Test that behaviors have the required structure
		expect(threadBehavior.id).toBe("threaded-reply")
		expect(reactBehavior.id).toBe("react-with-👍")

		// Test that behaviors have the correct methods
		expect(typeof threadBehavior.after).toBe("function") // threadedReply runs in post phase
		expect(typeof reactBehavior.before).toBe("function") // reactWith runs in pre phase

		// Execute behaviors
		await threadBehavior.after?.(context)
		await reactBehavior.before?.(context)

		// Verify effects
		expect(context.sendOptions?.threaded).toBe(true)
	})
})

describe("Agent", () => {
	it("should be able to import", () => {
		expect(true).toBe(true)
	})
})
