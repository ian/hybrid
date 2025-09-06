# Hybrid Agent Framework

A flexible framework for building AI agents with plugin-based HTTP server extensions.

## Features

- **AI Agent Core**: Built on AI SDK 5 with streaming and tool support
- **Plugin System**: Extensible HTTP server with Hono integration
- **XMTP Integration**: Built-in XMTP messaging capabilities
- **Blockchain Events**: Ponder integration for blockchain event handling
- **TypeScript First**: Full type safety and modern TypeScript patterns

## Quick Start

```typescript
import { Agent, XMTPPlugin, PonderPlugin } from "hybrid"

// Create an agent
const agent = new Agent({
  name: "my-agent",
  model: "gpt-4",
  instructions: "You are a helpful AI assistant."
})

// Start the server with plugins
await agent.listen({
  port: "3000",
  filter: async ({ message }) => {
    console.log("Received message:", message)
    return true // Accept all messages
  },
  plugins: [
    XMTPPlugin(),
    PonderPlugin()
  ]
})
```

## Plugin System

The framework uses a plugin-based architecture that allows you to extend the agent's HTTP server with additional functionality.

### Built-in Plugins

- **XMTPPlugin**: Provides XMTP messaging capabilities
- **PonderPlugin**: Handles blockchain events via Ponder

### Creating Custom Plugins

```typescript
import type { Plugin } from "hybrid"
import { Hono } from "hono"

function MyCustomPlugin(): Plugin {
  return {
    name: "my-custom",
    description: "My custom functionality",
    apply: (app) => {
      app.get("/custom", (c) => c.json({ message: "Hello from custom plugin!" }))
    }
  }
}

// Use the plugin
const agent = new Agent({
  name: "my-agent",
  model: "gpt-4",
  instructions: "You are a helpful AI assistant."
})

// Start server with plugins
await agent.listen({
  port: "3000",
  plugins: [
    XMTPPlugin(),
    PonderPlugin(),
    MyCustomPlugin()
  ]
})
```

### Plugin Registry

You can also register plugins dynamically:

```typescript
// Register a plugin after agent creation
agent.use(MyCustomPlugin())

// Check registered plugins
console.log(`Agent has ${agent.plugins.size} plugins`)

// Get a specific plugin
const plugin = agent.plugins.get("my-custom")

// Check if a plugin is registered
if (agent.plugins.has("xmtp")) {
  console.log("XMTP plugin is registered")
}
```

### Plugin Context

Plugins receive a context object with the agent instance:

```typescript
function MyPlugin(): Plugin {
  return {
    name: "my-plugin",
    description: "My plugin",
    apply: (app, context) => {
      if (context) {
        console.log(`Plugin applied to agent: ${context.agent.name}`)
      }
      
      app.get("/my-endpoint", (c) => c.json({ message: "Hello!" }))
    }
  }
}
```

## Architecture

The framework consists of several core components:

- **Agent**: Main AI agent with streaming and tool support
- **Plugin System**: Extensible HTTP server architecture with Hono
- **Tool System**: AI SDK compatible tool framework
- **Server**: Hono-based HTTP server with plugin support

### Plugin Lifecycle

1. **Registration**: Plugins are registered during agent creation or via `agent.use()`
2. **Application**: When `agent.listen()` is called, all plugins are applied to the Hono app
3. **Execution**: Plugins can add routes, middleware, and other functionality to the app

## Examples

See the `examples/` directory for complete usage examples:

- `plugin-usage.ts`: Comprehensive plugin usage examples
- Basic plugin registration
- Dynamic plugin registration
- Custom plugin creation
- Plugin registry inspection
- Server startup with plugins

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## License

MIT

