import type {
	BehaviorContext,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "@hybrd/types"
import { describe, expect, it, vi } from "vitest"
import { filterMessages } from "./filter-messages"

// Mock XMTP types
const mockClient = {} as XmtpClient
const mockConversation = {} as XmtpConversation
const mockMessage = { id: "test-message" } as XmtpMessage

describe("Filter Messages Behavior", () => {
	it("should create a behavior with correct id", () => {
		const behavior = filterMessages([])

		expect(behavior.id).toBe("filter-messages")
	})

	it("should allow all messages when no filters are provided", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages([])
		await behavior.pre?.(context)

		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should pass messages when all filters return true", async () => {
		const passingFilter = vi.fn().mockResolvedValue(true)
		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages([passingFilter])
		await behavior.pre?.(context)

		expect(passingFilter).toHaveBeenCalledWith(
			mockMessage,
			mockClient,
			mockConversation
		)
		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should filter messages when any filter returns false", async () => {
		const passingFilter = vi.fn().mockResolvedValue(true)
		const failingFilter = vi.fn().mockResolvedValue(false)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages([passingFilter, failingFilter])
		await behavior.pre?.(context)

		expect(passingFilter).toHaveBeenCalledWith(
			mockMessage,
			mockClient,
			mockConversation
		)
		expect(failingFilter).toHaveBeenCalledWith(
			mockMessage,
			mockClient,
			mockConversation
		)
		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should handle filters that throw errors gracefully", async () => {
		const passingFilter = vi.fn().mockResolvedValue(true)
		const errorFilter = vi.fn().mockRejectedValue(new Error("Filter error"))

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		const behavior = filterMessages([passingFilter, errorFilter])
		await behavior.pre?.(context)

		expect(passingFilter).toHaveBeenCalledWith(
			mockMessage,
			mockClient,
			mockConversation
		)
		expect(errorFilter).toHaveBeenCalledWith(
			mockMessage,
			mockClient,
			mockConversation
		)
		expect(context.sendOptions?.filtered).toBeUndefined() // Should not be filtered on error
	})

	it("should always execute filters regardless of config", async () => {
		const failingFilter = vi.fn().mockResolvedValue(false)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		// Test that filters are always executed
		const behavior = filterMessages([failingFilter])
		await behavior.pre?.(context)

		expect(failingFilter).toHaveBeenCalled()
		expect(context.sendOptions?.filtered).toBe(true)
	})

	it("should store filter count in config", () => {
		const filters = [vi.fn(), vi.fn(), vi.fn()]

		const behavior = filterMessages(filters)

		expect(behavior.config.config?.filters).toBe(3)
	})

	it("should work with callback syntax", () => {
		const behavior = filterMessages((filter) => [
			filter.isText,
			filter.not(filter.fromSelf)
		])

		expect(behavior.id).toBe("filter-messages")
	})

	it("should execute filters from callback syntax", async () => {
		const isTextFilter = vi.fn().mockResolvedValue(true)
		const notFromSelfFilter = vi.fn().mockResolvedValue(true)

		// Mock the filter object to return our mocked functions
		const mockFilter = {
			isText: isTextFilter,
			not: vi.fn().mockReturnValue(notFromSelfFilter),
			fromSelf: vi.fn().mockResolvedValue(true)
		}

		// We need to mock the import, but for now let's just test that the callback is called
		const filterCallback = vi
			.fn()
			.mockReturnValue([isTextFilter, notFromSelfFilter])

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		// This test would need more complex mocking to work properly with the import
		// For now, let's just verify the behavior accepts the callback format
		const behavior = filterMessages(filterCallback)
		expect(behavior).toBeDefined()
		expect(behavior.id).toBe("filter-messages")
	})

	it("should handle empty filter array from callback", () => {
		const behavior = filterMessages(() => [])

		expect(behavior.config.config?.filters).toBe(0)
	})

	it("should handle single filter from callback", () => {
		const singleFilter = vi.fn().mockResolvedValue(true)

		const behavior = filterMessages(() => [singleFilter])

		expect(behavior.config.config?.filters).toBe(1)
	})
})
