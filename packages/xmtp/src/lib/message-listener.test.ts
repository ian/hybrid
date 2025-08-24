import { EventEmitter } from "node:events"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MessageListener } from "./message-listener"

/**
 * Check if content contains any of the supported agent mention patterns
 */
function hasAgentMention(content: string | undefined): boolean {
	if (!content) return false

	const lowerContent = content.toLowerCase()
	const mentionPatterns = [
		"@agent",
		"@hybrid",
		"@hybrid.base.eth",
		"@hybrid.eth",
		"@agent.eth",
		"@agent.base.eth"
	]

	return mentionPatterns.some((pattern) => lowerContent.includes(pattern))
}

// Mock the XmtpResolver
vi.mock("./xmtp-resolver", () => ({
	XmtpResolver: vi.fn().mockImplementation(() => ({
		resolveAddress: vi.fn().mockResolvedValue("0x456789abcdef"),
		findRootMessage: vi.fn().mockResolvedValue(null),
		prePopulateCache: vi.fn().mockResolvedValue(undefined)
	}))
}))

// Mock the BasenameResolver
vi.mock("./basename-resolver", () => ({
	BasenameResolver: vi.fn().mockImplementation(() => ({
		getBasename: vi.fn().mockResolvedValue("testuser.base.eth"),
		getBasenameAddress: vi.fn().mockResolvedValue("0x456789abcdef"),
		resolveBasenameProfile: vi.fn().mockResolvedValue({
			basename: "testuser.base.eth",
			avatar: "https://example.com/avatar.jpg",
			description: "Test user profile",
			twitter: "@testuser",
			github: "testuser",
			url: "https://testuser.com"
		})
	}))
}))

// Mock the ENSResolver
vi.mock("./ens-resolver", () => ({
	ENSResolver: vi.fn().mockImplementation(() => ({
		resolveAddressToENS: vi.fn().mockResolvedValue(null),
		resolveENSName: vi.fn().mockResolvedValue(null),
		isENSName: vi.fn().mockReturnValue(false)
	}))
}))

// Mock the subjects
vi.mock("./subjects", () => ({
	extractSubjects: vi.fn().mockResolvedValue({})
}))

// Mock the XMTP client
const mockClient = {
	inboxId: "test-inbox-id",
	accountIdentifier: { identifier: "0x123" },
	conversations: {
		sync: vi.fn(),
		list: vi.fn().mockResolvedValue([]),
		streamAllMessages: vi.fn(),
		getConversationById: vi.fn()
	},
	preferences: {
		inboxStateFromInboxIds: vi.fn()
	}
}

describe("MessageListener", () => {
	let listener: MessageListener

	beforeEach(() => {
		vi.clearAllMocks()
		listener = new MessageListener({
			xmtpClient: mockClient as any,
			publicClient: {} as any,
			filter: ({ message }) => {
				const content = message.content as string
				return hasAgentMention(content)
			}
		})
	})

	it("should be an instance of EventEmitter", () => {
		expect(listener).toBeInstanceOf(EventEmitter)
	})

	it("should emit message events with enriched sender information", async () => {
		const mockMessage = {
			id: "test-message-id",
			content: "@agent test message",
			senderInboxId: "sender-inbox-id",
			conversationId: "conversation-id",
			sentAt: new Date(),
			contentType: { typeId: "text" }
		}

		// Mock the stream to emit our test message
		const mockStream = {
			async *[Symbol.asyncIterator]() {
				yield mockMessage
			}
		}

		mockClient.conversations.streamAllMessages.mockResolvedValue(mockStream)
		mockClient.conversations.getConversationById.mockResolvedValue({
			id: "conversation-id"
		})

		// Set up message event listener
		const messageHandler = vi.fn()
		listener.on("message", messageHandler)

		// Start the listener (but don't wait for it to complete since it runs indefinitely)
		const startPromise = listener.start()

		// Give it a moment to process the message
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(messageHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				message: expect.objectContaining({
					id: "test-message-id",
					content: "@agent test message",
					senderInboxId: "sender-inbox-id",
					conversationId: "conversation-id"
				}),
				sender: expect.objectContaining({
					address: "0x456789abcdef",
					inboxId: "sender-inbox-id",
					basename: "testuser.base.eth",
					name: "testuser.base.eth"
				}),
				subjects: expect.any(Object),
				rootMessage: undefined
			})
		)

		listener.stop()
	})

	it("should handle messages without basenames gracefully", async () => {
		// Mock resolvers to return no basename
		const listenerWithoutBasename = new MessageListener({
			xmtpClient: mockClient as any,
			publicClient: {} as any,
			filter: ({ message }) => {
				const content = message.content as string
				return hasAgentMention(content)
			}
		})

		// Mock basename resolver to return null
		const mockBasenameResolver = (listenerWithoutBasename as any)
			.basenameResolver
		mockBasenameResolver.getBasename = vi.fn().mockResolvedValue(null)

		const mockMessage = {
			id: "test-message-id-2",
			content: "@agent test message 2",
			senderInboxId: "sender-inbox-id-2",
			conversationId: "conversation-id-2",
			sentAt: new Date(),
			contentType: { typeId: "text" }
		}

		const mockStream = {
			async *[Symbol.asyncIterator]() {
				yield mockMessage
			}
		}

		mockClient.conversations.streamAllMessages.mockResolvedValue(mockStream)
		mockClient.conversations.getConversationById.mockResolvedValue({
			id: "conversation-id-2"
		})

		const messageHandler = vi.fn()
		listenerWithoutBasename.on("message", messageHandler)

		const startPromise = listenerWithoutBasename.start()
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(messageHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				sender: expect.objectContaining({
					address: "0x456789abcdef",
					inboxId: "sender-inbox-id-2",
					basename: undefined,
					name: expect.stringContaining("0x4567") // Should use truncated address
				}),
				subjects: expect.any(Object),
				rootMessage: undefined
			})
		)

		listenerWithoutBasename.stop()
	})

	it("should handle all supported agent mention patterns", async () => {
		const mentionPatterns = [
			"@agent test message",
			"@hybrid test message",
			"@hybrid.base.eth test message",
			"@hybrid.eth test message",
			"@agent.eth test message",
			"@agent.base.eth test message"
		]

		for (const content of mentionPatterns) {
			const testListener = new MessageListener({
				xmtpClient: mockClient as any,
				publicClient: {} as any,
				filter: ({ message }) => {
					const messageContent = message.content as string
					return hasAgentMention(messageContent)
				}
			})

			const mockMessage = {
				id: `test-message-${content}`,
				content: content,
				senderInboxId: "sender-inbox-id",
				conversationId: "conversation-id",
				sentAt: new Date(),
				contentType: { typeId: "text" }
			}

			const mockStream = {
				async *[Symbol.asyncIterator]() {
					yield mockMessage
				}
			}

			mockClient.conversations.streamAllMessages.mockResolvedValue(mockStream)
			mockClient.conversations.getConversationById.mockResolvedValue({
				id: "conversation-id"
			})

			const messageHandler = vi.fn()
			testListener.on("message", messageHandler)

			const startPromise = testListener.start()
			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(messageHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.objectContaining({
						content: content
					})
				})
			)

			testListener.stop()
		}
	})

	it("should allow replies without mention checking", async () => {
		const testListener = new MessageListener({
			xmtpClient: mockClient as any,
			publicClient: {} as any,
			filter: ({ message }) => {
				const contentTypeId = message.contentType?.typeId
				if (contentTypeId === "reply") {
					return true
				}
				if (contentTypeId === "text") {
					const messageContent = message.content as string
					return hasAgentMention(messageContent)
				}
				return false
			}
		})

		const mockReplyMessage = {
			id: "test-reply-message",
			content: { content: "yes I'm in" },
			senderInboxId: "sender-inbox-id",
			conversationId: "conversation-id",
			sentAt: new Date(),
			contentType: { typeId: "reply" }
		}

		const mockStream = {
			async *[Symbol.asyncIterator]() {
				yield mockReplyMessage
			}
		}

		mockClient.conversations.streamAllMessages.mockResolvedValue(mockStream)
		mockClient.conversations.getConversationById.mockResolvedValue({
			id: "conversation-id"
		})

		const messageHandler = vi.fn()
		testListener.on("message", messageHandler)

		const startPromise = testListener.start()
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(messageHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				message: expect.objectContaining({
					content: expect.objectContaining({
						content: "yes I'm in"
					})
				})
			})
		)

		testListener.stop()
	})

	it("should properly clean up when stopped", () => {
		const removeAllListenersSpy = vi.spyOn(listener, "removeAllListeners")

		listener.stop()

		expect(removeAllListenersSpy).toHaveBeenCalled()
	})

	it("should get stats", () => {
		const stats = listener.getStats()

		expect(stats).toEqual({
			messageCount: 0,
			conversationCount: 0,
			isActive: false
		})
	})

	it("should emit started and stopped events", async () => {
		const startedHandler = vi.fn()
		const stoppedHandler = vi.fn()

		listener.on("started", startedHandler)
		listener.on("stopped", stoppedHandler)

		// Mock to prevent infinite stream
		mockClient.conversations.streamAllMessages.mockResolvedValue({
			async *[Symbol.asyncIterator]() {
				// Empty iterator that ends immediately
			}
		})

		await listener.start()

		// Give a moment for the events to be processed
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(startedHandler).toHaveBeenCalled()

		listener.stop()

		// Give a moment for the stop event to be processed
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(stoppedHandler).toHaveBeenCalled()
	})
})
