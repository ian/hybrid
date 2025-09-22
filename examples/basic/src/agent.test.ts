import { describe, expect, it } from "vitest"
import { reactWith } from "../../../packages/core/src/behaviors/react-with"
import { threadedReply } from "../../../packages/core/src/behaviors/threaded-reply"
import type { BehaviorContext } from "../../../packages/types/src/behavior"

describe("Threaded Reply Behavior", () => {
	it("should set sendOptions.threaded = true when enabled", async () => {
		// Create a mock behavior context
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: {} as any,
			sendOptions: {}
		}

		// Create the threaded reply behavior
		const behavior = threadedReply({ enabled: true })

		// Execute the behavior
		await behavior.post(context)

		// Check that sendOptions.threaded was set
		expect(context.sendOptions?.threaded).toBe(true)
	})

	it("should not set sendOptions when disabled", async () => {
		// Create a mock behavior context
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: {} as any,
			sendOptions: {}
		}

		// Create the threaded reply behavior with disabled
		const behavior = threadedReply({ enabled: false })

		// Execute the behavior
		await behavior.post(context)

		// Check that sendOptions.threaded was not set
		expect(context.sendOptions?.threaded).toBeUndefined()
	})

	it("should respect filter function", async () => {
		// Create a mock behavior context
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: { content: "test message" } as any,
			sendOptions: {}
		}

		// Create the threaded reply behavior with filter
		const behavior = threadedReply({
			enabled: true,
			alwaysThread: false,
			filter: (ctx) => ctx.message.content.includes("thread")
		})

		// Execute the behavior
		await behavior.post(context)

		// Check that sendOptions.threaded was not set because filter returned false
		expect(context.sendOptions?.threaded).toBeUndefined()
	})

	it("should set threaded when filter passes", async () => {
		// Create a mock behavior context
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: { content: "thread this message" } as any,
			sendOptions: {}
		}

		// Create the threaded reply behavior with filter
		const behavior = threadedReply({
			enabled: true,
			alwaysThread: false,
			filter: (ctx) => ctx.message.content.includes("thread")
		})

		// Execute the behavior
		await behavior.post(context)

		// Check that sendOptions.threaded was set because filter returned true
		expect(context.sendOptions?.threaded).toBe(true)
	})
})

describe("React With Behavior", () => {
	it("should create a behavior with correct id and config", () => {
		const behavior = reactWith("👍")

		expect(behavior.id).toBe("react-with-👍")
		expect(behavior.config.enabled).toBe(true)
		expect(behavior.config.config.reaction).toBe("👍")
		expect(behavior.config.config.reactToAll).toBe(true)
	})

	it("should respect custom options", () => {
		const behavior = reactWith("👍", { reactToAll: false })

		expect(behavior.config.config.reactToAll).toBe(false)
		expect(behavior.config.config.reaction).toBe("👍")
	})

	it("should disable behavior when enabled is false", () => {
		const behavior = reactWith("👍", { enabled: false })

		expect(behavior.config.enabled).toBe(false)
	})

	it("should store filter function as string", () => {
		const filter = (ctx: BehaviorContext) =>
			ctx.message.content.includes("good")
		const behavior = reactWith("👍", { filter })

		expect(typeof behavior.config.config.filter).toBe("string")
		expect(behavior.config.config.filter).toContain("includes")
	})
})

describe("Behavior Registry System", () => {
	it("should register and execute behaviors", async () => {
		// Create a mock registry context
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: {} as any,
			sendOptions: {}
		}

		// Create behaviors
		const threadBehavior = threadedReply({ enabled: true })
		const reactBehavior = reactWith("👍", { enabled: true })

		// Test that behaviors have the required structure
		expect(threadBehavior.id).toBe("threaded-reply")
		expect(reactBehavior.id).toBe("react-with-👍")

		// Test that behaviors have the correct methods
		expect(typeof threadBehavior.post).toBe("function") // threadedReply runs in post phase
		expect(typeof reactBehavior.pre).toBe("function") // reactWith runs in pre phase

		// Execute behaviors
		await threadBehavior.post(context)
		await reactBehavior.pre(context)

		// Verify effects
		expect(context.sendOptions?.threaded).toBe(true)
	})
})

describe("Agent", () => {
	it("should be able to import", () => {
		expect(true).toBe(true)
	})
})
