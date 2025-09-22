import type {
	BehaviorContext,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { describe, expect, it, vi } from "vitest"
import { filterMessages } from "./filter-messages"

// Import the mocked filter
import { filter as xmtpFilter } from "@hybrd/xmtp"

// Mock the XMTP filter
vi.mock("@hybrd/xmtp", () => ({
	filter: {
		fromSelf: vi.fn(() => false),
		hasContent: vi.fn(() => true),
		isDM: vi.fn(() => false),
		isGroup: vi.fn(() => true),
		isGroupAdmin: vi.fn(() => false),
		isGroupSuperAdmin: vi.fn(() => false),
		isReaction: vi.fn(() => false),
		isRemoteAttachment: vi.fn(() => false),
		isReply: vi.fn(() => false),
		isText: vi.fn(() => true),
		isTextReply: vi.fn(() => false)
	}
}))

// Mock XMTP types
const mockClient = {} as XmtpClient
const mockConversation = {} as XmtpConversation
const mockMessage = { id: "test-message" } as XmtpMessage

describe("Filter Messages Behavior", () => {
	it("should create a behavior with correct id", () => {
		const behavior = filterMessages(() => true)

		expect(behavior.id).toBe("filter-messages")
	})

	it("should allow all messages when filter returns true", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => true)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should pass messages when filter returns true", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => true)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter messages when filter returns false", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => false)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should handle filters that throw errors gracefully", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => {
			throw new Error("Filter error")
		})

		await expect(behavior.before?.(context)).rejects.toThrow("Filter error")
	})

	it("should always execute filters regardless of config", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		// Test that filters are always executed
		const behavior = filterMessages(() => false)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should store filter count in config", () => {
		const behavior = filterMessages((filter) => filter.isText())

		expect(behavior.config.config?.filters).toBe(1)
	})

	it("should work with callback syntax", () => {
		const behavior = filterMessages(
			(filter) => filter.isText() && !filter.fromSelf()
		)

		expect(behavior.id).toBe("filter-messages")
	})

	it("should execute filters from callback syntax", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			(filter) => filter.isText() && !filter.fromSelf()
		)

		await behavior.before?.(context)

		expect(behavior).toBeDefined()
		expect(behavior.id).toBe("filter-messages")
	})

	it("should handle empty filter from callback", () => {
		const behavior = filterMessages(() => false)

		expect(behavior.id).toBe("filter-messages")
	})

	it("should handle single filter from callback", () => {
		const behavior = filterMessages((filter) => filter.isText())

		expect(behavior.id).toBe("filter-messages")
	})

	it("should handle all known XMTP filter signatures", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => true)

		await behavior.before?.(context)

		// Should not be filtered out
		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should handle test mock filter gracefully", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(() => true)

		// Should handle gracefully and not throw
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter messages based on reaction emoji", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "added",
					contentType: { toString: () => "reaction" },
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isReaction("👍"))

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter messages based on reaction action", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "removed",
					contentType: { toString: () => "reaction" },
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) =>
			filter.isReaction(undefined, "removed")
		)

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter messages based on reaction emoji and action", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "added",
					contentType: { toString: () => "reaction" },
					content: "❤️"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isReaction("❤️", "added"))

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter out messages with wrong reaction emoji", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "added",
					contentType: { toString: () => "reaction" },
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isReaction("❤️"))

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should filter out messages with wrong reaction action", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "added",
					contentType: { toString: () => "reaction" },
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) =>
			filter.isReaction(undefined, "removed")
		)

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should filter out messages with wrong reaction emoji and action", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					schema: "unicode",
					reference: "original-msg-id",
					action: "added",
					contentType: { toString: () => "reaction" },
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) =>
			filter.isReaction("❤️", "removed")
		)

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should filter out non-reaction messages when checking reaction details", async () => {
		// Don't set isReaction to true for non-reaction messages
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(false)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: "This is not a reaction"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isReaction("👍"))

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should filter out messages without proper reaction content structure", async () => {
		// Set up mock for reaction message
		vi.mocked(xmtpFilter.isReaction).mockReturnValue(true)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: {
				id: "test-message",
				content: {
					// Missing required reaction properties
					content: "👍"
				}
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) =>
			filter.isReaction("👍", "added")
		)

		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})
})
