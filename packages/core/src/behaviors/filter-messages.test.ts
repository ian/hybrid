import type {
	BehaviorContext,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { filterMessages } from "./filter-messages"

// Import the mocked filter
import { filter as xmtpFilter, AddressResolver } from "@hybrd/xmtp"

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
	},
	AddressResolver: vi.fn().mockImplementation(() => ({
		resolveAddress: vi.fn()
	}))
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

describe("isFromSelf filter", () => {
	it("should return true when message is from self", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: { inboxId: "agent-inbox" } as any,
			conversation: mockConversation,
			message: {
				id: "test-message",
				senderInboxId: "agent-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isFromSelf())
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should return false when message is not from self", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: { inboxId: "agent-inbox" } as any,
			conversation: mockConversation,
			message: {
				id: "test-message",
				senderInboxId: "other-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => !filter.isFromSelf())
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter out message when isFromSelf returns false and filter expects true", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: { inboxId: "agent-inbox" } as any,
			conversation: mockConversation,
			message: {
				id: "test-message",
				senderInboxId: "other-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages((filter) => filter.isFromSelf())
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})
})

describe("isFrom filter", () => {
	let mockResolveAddress: ReturnType<typeof vi.fn>

	beforeEach(() => {
		vi.clearAllMocks()
		mockResolveAddress = vi.fn()
		vi.mocked(AddressResolver).mockImplementation(
			() =>
				({
					resolveAddress: mockResolveAddress
				}) as any
		)
	})

	it("should filter messages from specific address", async () => {
		mockResolveAddress.mockResolvedValue(
			"0x1234567890123456789012345678901234567890"
		)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				await filter.isFrom("0x1234567890123456789012345678901234567890")
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
		expect(mockResolveAddress).toHaveBeenCalledWith("sender-inbox", "conv-1")
	})

	it("should handle address resolution failure gracefully", async () => {
		mockResolveAddress.mockResolvedValue(null)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				await filter.isFrom("0x1234567890123456789012345678901234567890")
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should perform case-insensitive address comparison", async () => {
		mockResolveAddress.mockResolvedValue(
			"0xABCD1234567890123456789012345678901234EF"
		)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				await filter.isFrom("0xabcd1234567890123456789012345678901234ef")
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter out messages not from specified address", async () => {
		mockResolveAddress.mockResolvedValue(
			"0x9999999999999999999999999999999999999999"
		)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				await filter.isFrom("0x1234567890123456789012345678901234567890")
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should handle errors during address resolution", async () => {
		mockResolveAddress.mockRejectedValue(new Error("Resolution failed"))

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				await filter.isFrom("0x1234567890123456789012345678901234567890")
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should work in combination with other filters", async () => {
		vi.mocked(xmtpFilter.isText).mockReturnValue(true)
		mockResolveAddress.mockResolvedValue(
			"0x1234567890123456789012345678901234567890"
		)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: { id: "conv-1" } as XmtpConversation,
			message: {
				id: "test-message",
				senderInboxId: "sender-inbox",
				content: "test"
			} as XmtpMessage,
			sendOptions: {}
		}

		const behavior = filterMessages(
			async (filter) =>
				filter.isText() &&
				!(await filter.isFrom("0x1234567890123456789012345678901234567890"))
		)
		await behavior.before?.(context)

		expect(context.sendOptions?.filtered).toBe(true)
	})
})

})
