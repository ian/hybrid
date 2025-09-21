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

// Example 1: Agent with threaded replies
const threadedAgent = new Agent({
	name: "Threaded Reply Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a threaded reply agent that responds to messages. Always be helpful and conversational."
})

await threadedAgent.listen({
	port: process.env.PORT || "8454",
	behaviors: [
		// Always thread replies - this will reply to the original message
		behaviors.threadedReply(),

		// React with eyes to all messages
		behaviors.reactWith("👀")
	],
	filters: [
		filters.isText,
		filters.not(filters.fromSelf),
		filters.startsWith("@threaded")
	]
})

// Example 2: Agent with normal replies (no threading)
const normalAgent = new Agent({
	name: "Normal Reply Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a normal reply agent that responds to messages. Always be helpful and conversational."
})

await normalAgent.listen({
	port: process.env.PORT2 || "8455",
	behaviors: [
		// No threading behavior - this will send top-level messages
		behaviors.reactWith("👀")
	],
	filters: [
		filters.isText,
		filters.not(filters.fromSelf),
		filters.startsWith("@normal")
	]
})

/**
 * Testing Threaded vs Normal Replies:
 *
 * To test the threading functionality:
 *
 * 1. Start both agents:
 *    yarn dev:threaded  # Starts agent on port 8454 with threading
 *    yarn dev:normal    # Starts agent on port 8455 without threading
 *
 * 2. Send messages to each:
 *    @threaded hello    # This will reply as a thread
 *    @normal hello      # This will reply as a top-level message
 *
 * 3. In XMTP, you should see:
 *    - Threaded agent: Creates a thread conversation
 *    - Normal agent: Creates separate top-level messages
 *
 * How Behaviors Work:
 *
 * 1. **Pre-Response Behaviors** (execute before agent responds):
 *    - reactWith: Adds reactions to incoming messages
 *    - Custom behaviors that modify the message or context
 *
 * 2. **Post-Response Behaviors** (execute after agent responds):
 *    - threadedReply: Sets sendOptions.threaded = true to control reply behavior
 *    - Custom behaviors that modify the response or send options
 *
 * 3. **Execution Flow**:
 *    Message received → Pre-response behaviors → Agent generates response →
 *    Post-response behaviors → Response sent with threading options
 *
 * 4. **Send Options Middleware**:
 *    - Behaviors can modify sendOptions to control HOW responses are sent
 *    - threaded: boolean - whether to reply to original message
 *    - contentType: string - override content type
 *    - metadata: object - additional send metadata
 *
 * 5. **Error Handling**:
 *    - Behaviors execute in isolation
 *    - Errors don't crash the main processing
 *    - Comprehensive logging for debugging
 */
