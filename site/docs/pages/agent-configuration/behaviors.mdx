---
title: Behaviors
description: Configure message processing behaviors and filters for your agents
---

# Behaviors

Learn how to configure behaviors that control how your agent processes and responds to messages.

## How Behaviors Work in the Agent Lifecycle

Behaviors are middleware functions that process messages before they reach your agent's AI model. They can:

- **Filter messages** - Determine which messages to process
- **Transform messages** - Modify message content or context
- **Add reactions** - Automatically react to messages
- **Control threading** - Manage conversation threading
- **Implement custom logic** - Add specialized processing

### Behavior Execution Order

```typescript
import { Agent } from "@hybrd/core"
import { filterMessages, reactWith, threadedReply } from "@hybrd/core/behaviors"

const agent = new Agent({
  behaviors: [
    filterMessages(/* filter logic */), // 1. Filter first
    reactWith("👍"),                    // 2. React to valid messages
    threadedReply(),                    // 3. Configure threading
    // Custom behaviors...              // 4. Additional processing
  ]
})
```

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

The `reactWith` behavior automatically adds emoji reactions to messages.

### Basic Reactions

```typescript
import { reactWith } from "@hybrd/core/behaviors"

// React with thumbs up to all processed messages
agent.use(reactWith("👍"))

// React with multiple emojis
agent.use(reactWith(["👍", "🤖", "✅"]))
```

### Conditional Reactions

```typescript
// React based on message content
agent.use(reactWith((message) => {
  if (message.content.includes("help")) {
    return "🆘"
  }
  if (message.content.includes("thanks")) {
    return "🙏"
  }
  return "👍" // Default reaction
}))

// React based on sentiment analysis
agent.use(reactWith(async (message) => {
  const sentiment = await analyzeSentiment(message.content)
  
  if (sentiment > 0.5) return "😊"
  if (sentiment < -0.5) return "😔"
  return "🤔"
}))
```

### Reaction Timing and Behavior

```typescript
// Configure reaction timing
agent.use(reactWith("👍", {
  delay: 1000, // Wait 1 second before reacting
  probability: 0.8, // Only react 80% of the time
}))

// React only to specific message types
agent.use(reactWith("🎉", {
  condition: (message) => message.content.includes("celebration")
}))
```

## Threaded Replies with `threadedReply`

The `threadedReply` behavior controls how your agent handles conversation threading.

### Basic Threading Configuration

```typescript
import { threadedReply } from "@hybrd/core/behaviors"

// Always reply in threads
agent.use(threadedReply())

// Never use threads (always top-level)
agent.use(threadedReply({ enabled: false }))
```

### Conditional Threading

```typescript
// Use threads for group conversations, top-level for DMs
agent.use(threadedReply({
  condition: (message) => message.conversation.isGroup
}))

// Use threads for long conversations
agent.use(threadedReply({
  condition: (message) => message.conversation.messageCount > 10
}))

// Use threads based on message content
agent.use(threadedReply({
  condition: (message) => {
    // Thread for technical discussions
    const technicalKeywords = ["code", "debug", "error", "implementation"]
    return technicalKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    )
  }
}))
```

### Thread Management

```typescript
// Configure thread behavior
agent.use(threadedReply({
  maxThreadDepth: 5, // Limit thread nesting
  autoCreateThread: true, // Create thread if none exists
  inheritContext: true, // Include thread context in responses
}))

// Custom thread naming
agent.use(threadedReply({
  threadName: (message) => {
    if (message.content.includes("bug")) {
      return "Bug Discussion"
    }
    if (message.content.includes("feature")) {
      return "Feature Request"
    }
    return "General Discussion"
  }
}))
```

## Creating Custom Behaviors

### Basic Custom Behavior

```typescript
import { Behavior, BehaviorContext } from "@hybrd/core/behaviors"

class CustomLoggerBehavior implements Behavior {
  async process(context: BehaviorContext) {
    console.log(`Processing message from ${context.message.sender}`)
    console.log(`Content: ${context.message.content}`)
    
    // Continue to next behavior
    return context
  }
}

agent.use(new CustomLoggerBehavior())
```

### Behavior with Configuration

```typescript
class RateLimitBehavior implements Behavior {
  private limits = new Map<string, number>()
  
  constructor(private maxMessages: number = 10, private windowMs: number = 60000) {}
  
  async process(context: BehaviorContext) {
    const senderId = context.message.sender
    const now = Date.now()
    
    // Clean old entries
    this.cleanOldEntries(now)
    
    // Check rate limit
    const count = this.limits.get(senderId) || 0
    if (count >= this.maxMessages) {
      // Block message processing
      context.shouldProcess = false
      return context
    }
    
    // Increment counter
    this.limits.set(senderId, count + 1)
    
    return context
  }
  
  private cleanOldEntries(now: number) {
    // Implementation for cleaning old rate limit entries
  }
}

agent.use(new RateLimitBehavior(5, 30000)) // 5 messages per 30 seconds
```

### Async Behavior with External APIs

```typescript
class SentimentAnalysisBehavior implements Behavior {
  async process(context: BehaviorContext) {
    const sentiment = await this.analyzeSentiment(context.message.content)
    
    // Add sentiment to context for other behaviors/AI
    context.metadata.sentiment = sentiment
    
    // React based on sentiment
    if (sentiment.score < -0.5) {
      context.reactions.push("😔")
    } else if (sentiment.score > 0.5) {
      context.reactions.push("😊")
    }
    
    return context
  }
  
  private async analyzeSentiment(text: string) {
    // Call external sentiment analysis API
    const response = await fetch("https://api.sentiment.com/analyze", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    })
    
    return response.json()
  }
}
```

## Behavior Lifecycle (Before/After/Error Hooks)

### Lifecycle Hooks

```typescript
class AdvancedBehavior implements Behavior {
  async before(context: BehaviorContext) {
    // Called before main processing
    console.log("Before processing message")
    context.startTime = Date.now()
  }
  
  async process(context: BehaviorContext) {
    // Main behavior logic
    return context
  }
  
  async after(context: BehaviorContext) {
    // Called after successful processing
    const duration = Date.now() - context.startTime
    console.log(`Processing took ${duration}ms`)
  }
  
  async onError(error: Error, context: BehaviorContext) {
    // Called when an error occurs
    console.error("Behavior error:", error)
    
    // Optionally recover or modify context
    context.shouldProcess = false
    return context
  }
}
```

### Error Handling Strategies

```typescript
class ResilientBehavior implements Behavior {
  async process(context: BehaviorContext) {
    try {
      // Risky operation
      const result = await this.riskyOperation(context.message)
      context.metadata.result = result
    } catch (error) {
      // Graceful degradation
      console.warn("Risky operation failed, using fallback")
      context.metadata.result = this.getFallbackResult()
    }
    
    return context
  }
  
  async onError(error: Error, context: BehaviorContext) {
    // Log error for monitoring
    this.logError(error, context)
    
    // Don't block other behaviors
    return context
  }
}
```

## Behavior Composition and Chaining

### Combining Multiple Behaviors

```typescript
// Create a behavior chain for customer support
const supportBehaviors = [
  filterMessages(filter => 
    filter.isText() && 
    !filter.fromSelf() && 
    (filter.isDM() || filter.hasMention(agent.address))
  ),
  new SentimentAnalysisBehavior(),
  new TicketCreationBehavior(),
  reactWith((message, context) => {
    if (context.metadata.sentiment?.score < -0.5) {
      return "🆘" // Urgent support needed
    }
    return "👍" // Acknowledged
  }),
  threadedReply({
    condition: (message) => message.conversation.isGroup
  }),
]

supportBehaviors.forEach(behavior => agent.use(behavior))
```

### Conditional Behavior Chains

```typescript
// Different behavior chains for different contexts
agent.use(async (context) => {
  if (context.message.conversation.isGroup) {
    // Group conversation behaviors
    await new ModerationBehavior().process(context)
    await new GroupAnalyticsBehavior().process(context)
  } else {
    // Direct message behaviors
    await new PersonalizationBehavior().process(context)
    await new PrivacyBehavior().process(context)
  }
  
  return context
})
```

## Advanced Behavior Patterns

### State Management in Behaviors

```typescript
class ConversationStateBehavior implements Behavior {
  private conversationStates = new Map<string, any>()
  
  async process(context: BehaviorContext) {
    const conversationId = context.message.conversation.id
    const state = this.conversationStates.get(conversationId) || {}
    
    // Update state based on message
    state.lastMessage = context.message.content
    state.messageCount = (state.messageCount || 0) + 1
    state.lastActivity = Date.now()
    
    // Add state to context
    context.conversationState = state
    
    // Save updated state
    this.conversationStates.set(conversationId, state)
    
    return context
  }
}
```

### Behavior Dependencies

```typescript
class DependentBehavior implements Behavior {
  constructor(private dependencies: string[]) {}
  
  async process(context: BehaviorContext) {
    // Check if required behaviors have run
    for (const dep of this.dependencies) {
      if (!context.metadata[dep]) {
        throw new Error(`Required behavior ${dep} has not run`)
      }
    }
    
    // Process with dependency data
    const sentimentData = context.metadata.sentiment
    const userProfile = context.metadata.userProfile
    
    // Your logic here...
    
    return context
  }
}

agent.use(new SentimentAnalysisBehavior()) // Provides 'sentiment'
agent.use(new UserProfileBehavior())       // Provides 'userProfile'
agent.use(new DependentBehavior(['sentiment', 'userProfile']))
```

## Next Steps

- Learn about [XMTP Tools](/xmtp/tools) for messaging capabilities
- Explore [Blockchain Tools](/blockchain/tools) for crypto functionality
- Check out [Tools](/tools) for creating custom agent capabilities
- See [Mini Apps](/mini-apps) for mini app integration
