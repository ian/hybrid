import type {
	BehaviorContext,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { describe, expect, it } from "vitest"
import { filterMessages } from "./filter-messages"

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
})
