---
title: Behaviors
description: Configure message processing behaviors and filters for your agents
---

# Behaviors

Learn how to configure behaviors that control how your agent processes and responds to messages.

## How Behaviors Work

Behaviors are hooks that process messages in the agent lifecycle. They run:

- **Before** - Before AI processes the message (filter, react)
- **After** - After AI generates response (threading)

Behaviors are passed to `agent.listen()`:

```typescript
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"

const agent = new Agent({
  name: "My Agent",
  model: yourModel,
  instructions: "..."
})

await agent.listen({
  port: "8454",
  behaviors: [
    filterMessages(/* filter logic */), // Runs first
    reactWith("👀"),                     // Runs if message passes filter
    threadedReply()                      // Configures response threading
  ]
})
```

### Behavior Lifecycle

1. **Message received** from XMTP
2. **Before hooks** run (filterMessages, reactWith)
3. **AI processing** (if not filtered out)
4. **After hooks** run (threadedReply)
5. **Response sent** to XMTP

## Message Filtering with `filterMessages`

The `filterMessages` behavior determines which messages your agent should process.

### Basic Text Filtering

```typescript
import { filterMessages, filter } from "@hybrd/core/behaviors"

// Only process text messages that aren't from the agent itself
agent.use(filterMessages(filter => 
  filter.isText() && !filter.fromSelf()
))
```

### Available Filter Methods

#### Content Type Filters

```typescript
// Message is text content
filter.isText()

// Message is a reaction
filter.isReaction()

// Message is a specific reaction
filter.isReaction("👍") // Specific emoji
filter.isReaction("👍", "added") // Specific emoji and action

// Message is a reply
filter.isReply()

// Message is a text reply (combination)
filter.isTextReply()

// Message has remote attachment
filter.isRemoteAttachment()

// Message has any content
filter.hasContent()
```

#### Conversation Type Filters

```typescript
// Message is a direct message (1:1 conversation)
filter.isDM()

// Message is in a group conversation
filter.isGroup()

// Message sender is group admin
filter.isGroupAdmin()

// Message sender is group super admin
filter.isGroupSuperAdmin()
```

#### Sender Filters

```typescript
// Message is from the agent itself
filter.fromSelf()

// Message contains a mention
filter.hasMention("@username")
filter.hasMention("0x1234...") // Ethereum address mention
```

### Complex Filter Combinations

```typescript
// Only process DMs that are text and not from self
agent.use(filterMessages(filter => 
  filter.isDM() && filter.isText() && !filter.fromSelf()
))

// Process group messages that mention the agent
agent.use(filterMessages(filter => 
  filter.isGroup() && filter.hasMention(agent.address)
))

// Process reactions but not from the agent itself
agent.use(filterMessages(filter => 
  filter.isReaction() && !filter.fromSelf()
))

// Complex business logic
agent.use(filterMessages(filter => {
  // Only process during business hours
  const hour = new Date().getHours()
  const isBusinessHours = hour >= 9 && hour <= 17
  
  return filter.isText() && 
         !filter.fromSelf() && 
         isBusinessHours
}))
```

### Custom Filter Logic

```typescript
agent.use(filterMessages(filter => {
  // Custom spam detection
  if (filter.content?.includes("spam") || 
      filter.content?.includes("promotion")) {
    return false
  }
  
  // Rate limiting per sender
  const senderId = filter.sender
  if (this.isRateLimited(senderId)) {
    return false
  }
  
  // Only process if user has sufficient reputation
  const reputation = this.getUserReputation(senderId)
  if (reputation < 10) {
    return false
  }
  
  return filter.isText() && !filter.fromSelf()
}))
```

## Automatic Reactions with `reactWith`

The `reactWith` behavior automatically adds emoji reactions to messages that pass the filter.

### Basic Usage

```typescript
import { reactWith } from "hybrid/behaviors"

// React with eyes emoji to all processed messages
reactWith("👀")

// React with thumbs up
reactWith("👍")

// React with robot emoji
reactWith("🤖")
```

### Options

```typescript
// Enable/disable reactWith
reactWith("👀", {
  enabled: true  // default: true
})

// React to all messages (even filtered ones)
reactWith("👀", {
  reactToAll: true  // default: true
})
```

### When Reactions Happen

Reactions are sent during the `before` hook, which means:
- They happen **before** AI processing
- They acknowledge message receipt
- They don't depend on AI response

### Example Usage

```typescript
await agent.listen({
  port: "8454",
  behaviors: [
    // Only process certain messages
    filterMessages((filter) => filter.isDM() || filter.hasMention("@agent")),
    
    // React to acknowledge we're processing it
    reactWith("👀"),
    
    // Reply in threads
    threadedReply()
  ]
})
```

## Threaded Replies with `threadedReply`

The `threadedReply` behavior configures the agent to reply in threads instead of sending top-level messages.

### Basic Usage

```typescript
import { threadedReply } from "hybrid/behaviors"

// Always reply in threads
threadedReply()

// Disable threading (reply at top level)
threadedReply({ enabled: false })
```

### How It Works

When enabled, `threadedReply`:
- Sets `sendOptions.threaded = true` in the `after` hook
- Makes agent reply to the original message instead of sending new top-level message
- Keeps conversations organized

### Example Usage

```typescript
await agent.listen({
  port: "8454",
  behaviors: [
    filterMessages((filter) => filter.isText() && !filter.fromSelf()),
    reactWith("👀"),
    threadedReply()  // Always thread replies
  ]
})
```

**With threading:**
```
User: Hey agent, what's my balance?
  └─ Agent: Your balance is 1.5 ETH
```

**Without threading:**
```
User: Hey agent, what's my balance?
Agent: Your balance is 1.5 ETH
```

## Creating Custom Behaviors

Custom behaviors follow the `BehaviorObject` interface with `before` and `after` hooks.

### BehaviorObject Interface

```typescript
interface BehaviorObject {
  id: string
  config: {
    enabled: boolean
    config?: Record<string, unknown>
  }
  before?(context: BehaviorContext): Promise<void>
  after?(context: BehaviorContext): Promise<void>
}
```

### Custom Behavior Example

```typescript
import type { BehaviorObject, BehaviorContext } from "hybrid/behaviors"

function customLogger(): BehaviorObject {
  return {
    id: "custom-logger",
    config: {
      enabled: true
    },
    async before(context: BehaviorContext) {
      console.log(`📥 Message from: ${context.message.senderInboxId}`)
      console.log(`📝 Content: ${context.message.content}`)
    },
    async after(context: BehaviorContext) {
      console.log(`✅ Response sent`)
    }
  }
}

// Use it
await agent.listen({
  port: "8454",
  behaviors: [
    customLogger(),
    filterMessages((filter) => filter.isText()),
    reactWith("👀")
  ]
})
```

### Behavior Context

The `BehaviorContext` provides access to:

```typescript
interface BehaviorContext {
  message: Message          // The incoming XMTP message
  conversation: Conversation // The XMTP conversation
  client: XmtpClient        // The XMTP client instance
  sendOptions?: {
    threaded?: boolean      // Set by threadedReply
    filtered?: boolean      // Set by filterMessages
  }
  next?: () => Promise<void> // Call to continue behavior chain
}
```

### Stopping the Behavior Chain

To stop processing (filter out a message), set `filtered` and don't call `next()`:

```typescript
function customFilter(): BehaviorObject {
  return {
    id: "custom-filter",
    config: { enabled: true },
    async before(context: BehaviorContext) {
      // Filter out messages containing "spam"
      if (typeof context.message.content === "string" && 
          context.message.content.includes("spam")) {
        if (!context.sendOptions) {
          context.sendOptions = {}
        }
        context.sendOptions.filtered = true
        // Don't call next() - stops the chain
        return
      }
      
      // Continue to next behavior
      await context.next?.()
    }
  }
}
```

## Next Steps

- Learn about [XMTP Tools](/xmtp/tools) for messaging capabilities
- Explore [Blockchain Tools](/blockchain/tools) for crypto functionality
- Check out [Tools](/tools) for creating custom agent capabilities
- See [Mini Apps](/mini-apps) for mini app integration
