import { describe, expect, it } from "vitest"
import { agent } from "./agent.js"

describe("Agent", () => {
	it("should generate a response", async () => {
		const response = await agent.generate("Hello, how are you?")
		expect(response).toBeDefined()
		expect(typeof response).toBe("string")
		expect(response.length).toBeGreaterThan(0)
	})
})
