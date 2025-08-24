import { Agent, PonderPlugin, XMTPPlugin } from "../src"

// Example 1: Basic plugin usage (now in listen options)
const basicAgent = new Agent({
	name: "basic-agent",
	model: "gpt-4",
	instructions: "You are a helpful AI assistant."
})

// Example 2: Dynamic plugin registration
const dynamicAgent = new Agent({
	name: "dynamic-agent",
	model: "gpt-4",
	instructions: "You are a helpful AI assistant."
})

// Register plugins after agent creation
dynamicAgent.use(XMTPPlugin())
dynamicAgent.use(PonderPlugin())

// Example 3: Custom plugin
import type { Plugin } from "../src"

function CustomHealthPlugin(): Plugin {
	return {
		name: "custom-health",
		description: "Provides custom health check endpoint",
		apply: (app) => {
			app.get("/custom-health", (c) => {
				return c.json({
					status: "healthy",
					service: "custom",
					timestamp: new Date().toISOString()
				})
			})
		}
	}
}

const customAgent = new Agent({
	name: "custom-agent",
	model: "gpt-4",
	instructions: "You are a helpful AI assistant."
})

// Example 4: Plugin registry inspection
console.log(`Basic agent has ${basicAgent.plugins.size} plugins`)
console.log(`Dynamic agent has ${dynamicAgent.plugins.size} plugins`)
console.log(`Custom agent has ${customAgent.plugins.size} plugins`)

// Check if specific plugins are registered
console.log(`Basic agent has XMTP: ${basicAgent.plugins.has("xmtp")}`)
console.log(`Basic agent has Ponder: ${basicAgent.plugins.has("ponder")}`)

// Get plugin information
const xmtpPlugin = basicAgent.plugins.get("xmtp")
if (xmtpPlugin) {
	console.log(`XMTP plugin description: ${xmtpPlugin.description}`)
}

// Example 5: Starting the server with plugins
async function startServer() {
	await basicAgent.listen({
		port: "3000",
		filter: async ({ message }) => {
			console.log("Received message:", message)
			return true // Accept all messages
		},
		plugins: [XMTPPlugin(), PonderPlugin()] // Plugins now go in listen options
	})
}

// Uncomment to start the server
// startServer().catch(console.error)
