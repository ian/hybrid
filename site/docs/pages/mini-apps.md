---
title: Mini Apps
description: Plugin-based extensibility for Hybrid agents
---

# Mini Apps & Plugins

Extend your Hybrid agents with custom plugins and integrations.

## Plugin System

Hybrid supports a plugin architecture for extending agent functionality. Plugins can:

- Add custom HTTP routes to the agent server
- Hook into the message processing lifecycle
- Provide additional tools and capabilities
- Integrate with external services

### Basic Plugin Structure

```typescript
import type { Plugin, PluginContext } from "hybrid"
import type { Hono } from "hono"

const myPlugin: Plugin<PluginContext> = {
  name: "my-plugin",
  
  async apply(app: Hono, context: PluginContext) {
    // Add custom routes
    app.get("/my-route", (c) => {
      return c.json({ message: "Hello from plugin!" })
    })
    
    // Access agent
    const agent = context.agent
    
    // Access behaviors registry if available
    if (context.behaviors) {
      // Register behaviors
    }
  }
}
```

### Using Plugins

Register plugins with your agent:

```typescript
import { Agent } from "hybrid"

const agent = new Agent({
  name: "My Agent",
  model: yourModel,
  instructions: "..."
})

// Register plugin via agent
agent.use(myPlugin)

// Or pass to listen
await agent.listen({
  port: "8454",
  behaviors: [...],
  plugins: [myPlugin]
})
```

### XMTP Plugin

The XMTP plugin is automatically included and handles:
- Connecting to XMTP network
- Streaming messages
- Processing messages through behaviors
- Sending responses

### Built-in HTTP Routes

Your agent automatically has these routes:

- `GET /health` - Health check endpoint
- XMTP webhook routes (added by XMTP plugin)

### Creating Custom Plugins

Example: Analytics plugin

```typescript
import type { Plugin, PluginContext } from "hybrid"

const analyticsPlugin: Plugin<PluginContext> = {
  name: "analytics",
  
  async apply(app, context) {
    let messageCount = 0
    let lastMessage: Date | null = null
    
    // Add analytics endpoint
    app.get("/analytics", (c) => {
      return c.json({
        messageCount,
        lastMessage,
        uptime: process.uptime()
      })
    })
    
    // Hook into behaviors to count messages
    if (context.behaviors) {
      context.behaviors.registerAll([{
        id: "analytics-counter",
        config: { enabled: true },
        async before(behaviorContext) {
          messageCount++
          lastMessage = new Date()
          await behaviorContext.next?.()
        }
      }])
    }
  }
}
```

## Future: Mini Apps

Mini apps (interactive UI components that work with agents) are planned for future releases. Stay tuned!

### Planned Features

- Interactive UI components for XMTP clients
- Frame-based interactions
- Transaction signing flows
- Portfolio dashboards
- Trading interfaces

## Next Steps

- Learn about [Tools Standard Library](/tools) for extending agent capabilities
- Explore [Behaviors](/agent/behaviors) for message processing
- Check out [Blockchain Tools](/tools/blockchain) for crypto functionality
- See [XMTP Tools](/tools/xmtp) for messaging features
