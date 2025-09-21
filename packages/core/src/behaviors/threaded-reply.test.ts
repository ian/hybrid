import type { BehaviorContext } from "@hybrd/types"
import { describe, expect, it } from "vitest"
import { threadedReply } from "./threaded-reply"

describe("Threaded Reply Behavior", () => {
	it("should create a behavior with correct id", () => {
		const behavior = threadedReply()

		expect(behavior.id).toBe("threaded-reply")
	})

	it("should enable threading when enabled", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: {} as any,
			sendOptions: {}
		}

		const behavior = threadedReply()
		await behavior.post?.(context)

		expect(context.sendOptions?.threaded).toBe(true)
	})

	it("should always set threading regardless of config", async () => {
		const context: BehaviorContext = {
			runtime: {} as any,
			client: {} as any,
			conversation: {} as any,
			message: {} as any,
			sendOptions: {}
		}

		const behavior = threadedReply()
		await behavior.post?.(context)

		expect(context.sendOptions?.threaded).toBe(true)
	})
})
