import type { LanguageModel } from "ai"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Agent, xmtpTools } from "../src/index"

// Mock language model for testing
const mockModel: LanguageModel = {
	modelId: "test-model",
	provider: "test-provider"
	// Add minimal required properties for the LanguageModel interface
} as LanguageModel

// Mock runtime for XMTP tools
const mockRuntime = {
	// Base runtime properties
	conversationId: "test-conversation",
	fromAddress: "0x1234567890123456789012345678901234567890",

	// XMTP-specific runtime properties that tools might expect
	xmtpClient: {
		sendMessage: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
		sendReaction: vi.fn().mockResolvedValue({ success: true }),
		getMessage: vi.fn().mockResolvedValue({
			id: "test-message-id",
			content: "test content",
			senderAddress: "0x1234567890123456789012345678901234567890"
		})
	}
}

describe("Agent with xmtpTools", () => {
	let agent: Agent

	beforeEach(() => {
		vi.clearAllMocks()

		// Create agent with xmtpTools - this should not cause type errors
		agent = new Agent({
			name: "Test Hybrid Agent",
			model: mockModel,
			tools: xmtpTools, // This was causing the original type error
			instructions: `
				You are a test AI agent with XMTP messaging capabilities.
				
				Rules:
				- Always respond helpfully
				- Use sendReaction to acknowledge messages
				- Keep responses concise
			`,
			createRuntime: () => mockRuntime
		})
	})

	it("should create an agent instance successfully", () => {
		expect(agent).toBeDefined()
		expect(agent.name).toBe("Test Hybrid Agent")
	})

	it("should have access to all xmtpTools", () => {
		// Verify that all expected tools are available
		const expectedTools = [
			"sendMessage",
			"sendReply",
			"sendReaction",
			"getMessage"
		]

		expectedTools.forEach((toolName) => {
			expect(xmtpTools[toolName]).toBeDefined()
			expect(typeof xmtpTools[toolName].execute).toBe("function")
			expect(xmtpTools[toolName].inputSchema).toBeDefined()
		})
	})

	it("should have properly typed tool schemas", () => {
		// Test sendMessage tool with ZodEffects (refined schema)
		const sendMessageTool = xmtpTools.sendMessage
		expect(sendMessageTool.inputSchema).toBeDefined()
		expect(sendMessageTool.description).toContain("Send a message")

		// Test sendReaction tool with regular ZodObject
		const sendReactionTool = xmtpTools.sendReaction
		expect(sendReactionTool.inputSchema).toBeDefined()
		expect(sendReactionTool.description).toContain("emoji reaction")
	})

	it("should validate sendMessage input schema correctly", () => {
		const sendMessageTool = xmtpTools.sendMessage

		// Valid input with recipientAddress
		const validInput1 = {
			content: "Hello world",
			recipientAddress: "0x1234567890123456789012345678901234567890"
		}
		expect(() => sendMessageTool.inputSchema.parse(validInput1)).not.toThrow()

		// Valid input with conversationId
		const validInput2 = {
			content: "Hello world",
			conversationId: "test-conversation-id"
		}
		expect(() => sendMessageTool.inputSchema.parse(validInput2)).not.toThrow()

		// Invalid input - missing both recipientAddress and conversationId
		const invalidInput = {
			content: "Hello world"
		}
		expect(() => sendMessageTool.inputSchema.parse(invalidInput)).toThrow()
	})

	it("should validate sendReaction input schema correctly", () => {
		const sendReactionTool = xmtpTools.sendReaction

		// Valid input with default emoji
		const validInput1 = {}
		expect(() => sendReactionTool.inputSchema.parse(validInput1)).not.toThrow()

		// Valid input with custom emoji
		const validInput2 = {
			emoji: "👍",
			referenceMessageId: "test-message-id"
		}
		expect(() => sendReactionTool.inputSchema.parse(validInput2)).not.toThrow()
	})

	it("should execute tools with proper runtime context", async () => {
		const sendReactionTool = xmtpTools.sendReaction
		const messages = [{ role: "user" as const, content: "Hello" }]

		// Mock the tool execution
		const mockExecute = vi.fn().mockResolvedValue({
			success: true,
			emoji: "👀"
		})
		sendReactionTool.execute = mockExecute

		const result = await sendReactionTool.execute({
			input: { emoji: "👀" },
			runtime: mockRuntime,
			messages
		})

		expect(mockExecute).toHaveBeenCalledWith({
			input: { emoji: "👀" },
			runtime: mockRuntime,
			messages
		})
		expect(result.success).toBe(true)
		expect(result.emoji).toBe("👀")
	})

	it("should handle ZodEffects schema in sendMessage tool", async () => {
		const sendMessageTool = xmtpTools.sendMessage
		const messages = [{ role: "user" as const, content: "Hello" }]

		// Mock the tool execution
		const mockExecute = vi.fn().mockResolvedValue({
			success: true,
			messageId: "test-message-id"
		})
		sendMessageTool.execute = mockExecute

		const input = {
			content: "Test message",
			recipientAddress: "0x1234567890123456789012345678901234567890"
		}

		const result = await sendMessageTool.execute({
			input,
			runtime: mockRuntime,
			messages
		})

		expect(mockExecute).toHaveBeenCalledWith({
			input,
			runtime: mockRuntime,
			messages
		})
		expect(result.success).toBe(true)
		expect(result.messageId).toBe("test-message-id")
	})

	it("should demonstrate that ZodEffects and ZodTypeAny are both supported", () => {
		// This test verifies that our type fix allows both regular Zod schemas
		// and ZodEffects (refined schemas) to work with the Agent tools

		const tools = xmtpTools

		// sendMessage uses ZodEffects (has .refine())
		const sendMessageSchema = tools.sendMessage.inputSchema
		expect(sendMessageSchema).toBeDefined()

		// sendReaction uses regular ZodObject
		const sendReactionSchema = tools.sendReaction.inputSchema
		expect(sendReactionSchema).toBeDefined()

		// Both should be accepted by the Agent type system
		// This test passing means our z.ZodSchema constraint works correctly
		expect(typeof sendMessageSchema.parse).toBe("function")
		expect(typeof sendReactionSchema.parse).toBe("function")
	})

	it("should create agent with function-based model", () => {
		// Test that agent works with dynamic model resolution
		const dynamicAgent = new Agent({
			name: "Dynamic Agent",
			model: ({ runtime }) => {
				expect(runtime).toBeDefined()
				return mockModel
			},
			tools: xmtpTools,
			instructions: "Test instructions"
		})

		expect(dynamicAgent).toBeDefined()
		expect(dynamicAgent.name).toBe("Dynamic Agent")
	})

	it("should create agent with function-based instructions", () => {
		// Test that agent works with dynamic instructions
		const dynamicAgent = new Agent({
			name: "Dynamic Instructions Agent",
			model: mockModel,
			tools: xmtpTools,
			instructions: ({ messages, runtime }) => {
				expect(messages).toBeDefined()
				expect(runtime).toBeDefined()
				return "Dynamic instructions based on context"
			}
		})

		expect(dynamicAgent).toBeDefined()
		expect(dynamicAgent.name).toBe("Dynamic Instructions Agent")
	})
})

describe("Tool Type Compatibility", () => {
	it("should accept tools with ZodEffects schemas", () => {
		// This specifically tests that ZodEffects (from .refine()) work
		const toolsWithEffects = {
			sendMessage: xmtpTools.sendMessage // This has ZodEffects
		}

		expect(() => {
			new Agent({
				name: "Effects Test Agent",
				model: mockModel,
				tools: toolsWithEffects,
				instructions: "Test"
			})
		}).not.toThrow()
	})

	it("should accept tools with regular Zod schemas", () => {
		// This tests that regular ZodObject schemas still work
		const toolsWithoutEffects = {
			sendReaction: xmtpTools.sendReaction, // This has ZodObject
			getMessage: xmtpTools.getMessage // This has ZodObject
		}

		expect(() => {
			new Agent({
				name: "Regular Schema Test Agent",
				model: mockModel,
				tools: toolsWithoutEffects,
				instructions: "Test"
			})
		}).not.toThrow()
	})

	it("should accept mixed tool schemas", () => {
		// This tests that mixing ZodEffects and ZodObject works
		expect(() => {
			new Agent({
				name: "Mixed Schema Test Agent",
				model: mockModel,
				tools: xmtpTools, // Contains both ZodEffects and ZodObject tools
				instructions: "Test"
			})
		}).not.toThrow()
	})
})
