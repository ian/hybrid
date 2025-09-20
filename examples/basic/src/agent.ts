/**
 * Example: Behavior-Based Plugin System
 *
 * This example demonstrates how to use the behavior system to customize
 * your agent's responses without writing custom code.
 */

import { Agent, behaviors, filters } from "@hybrd/core"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "My Hybrid Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a XMTP agent that responds to messages and reactions. Try and be as conversational as possible."
})

await agent.listen({
	port: process.env.PORT || "8454",
	behaviors: [
		// React with eyes to all messages
		behaviors.reactWith("👀"),

		// Always thread replies
		behaviors.threadedReply(),

		// React with thumbs up only to messages containing "good"
		behaviors.reactWith("👍", {
			reactToAll: false,
			filter: (context) => context.message.content.includes("good")
		}),

		// React with fire only to messages containing "awesome"
		behaviors.reactWith("🔥", {
			reactToAll: false,
			filter: (context) => context.message.content.includes("awesome")
		}),

		// Disable a behavior by setting enabled: false
		behaviors.reactWith("😀", { enabled: false })
	],
	filters: [
		filters.isText,
		filters.not(filters.fromSelf),
		filters.startsWith("@agent")
	]
})

/**
 * How Behaviors Work:
 *
 * 1. **Pre-Response Behaviors** (execute before agent responds):
 *    - reactWith: Adds reactions to incoming messages
 *    - Custom behaviors that modify the message or context
 *
 * 2. **Post-Response Behaviors** (execute after agent responds):
 *    - threadedReply: Ensures responses are threaded
 *    - Custom behaviors that modify the response
 *
 * 3. **Execution Flow**:
 *    Message received → Pre-response behaviors → Agent generates response →
 *    Post-response behaviors → Response sent
 *
 * 4. **Error Handling**:
 *    - Behaviors execute in isolation
 *    - Errors don't crash the main processing
 *    - Comprehensive logging for debugging
 *
 * 5. **Configuration Options**:
 *    - enabled: Enable/disable behaviors dynamically
 *    - Custom filters for conditional execution
 *    - Configurable parameters for each behavior type
 */
