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

	it("should respect enabled/disabled configuration", async () => {
		const failingFilter = vi.fn().mockResolvedValue(false)

		const context: BehaviorContext = {
			runtime: {} as any,
			client: mockClient,
			conversation: mockConversation,
			message: mockMessage,
			sendOptions: {}
		}

		// Test disabled behavior
		const disabledBehavior = filterMessages([failingFilter])
		disabledBehavior.config.enabled = false

		await disabledBehavior.pre?.(context)

		expect(failingFilter).not.toHaveBeenCalled()
		expect(context.sendOptions?.filtered).toBeUndefined()
	})

	it("should store filter count in config", () => {
		const filters = [vi.fn(), vi.fn(), vi.fn()]

		const behavior = filterMessages(filters)

		expect(behavior.config.config?.filters).toBe(3)
	})
})
