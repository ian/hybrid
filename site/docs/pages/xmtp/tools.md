---
title: XMTP Tools
description: Tools for sending messages, replies, and reactions through XMTP
---

# XMTP Tools

Learn how to use XMTP tools to send messages, replies, reactions, and handle conversations in your Hybrid agents.

## Installing and Importing

### Installation

XMTP tools are included with the core Hybrid framework:

```bash
npm install @hybrd/core
```

For standalone XMTP functionality:

```bash
npm install @hybrd/xmtp
```

### Importing XMTP Tools

```typescript
// Import from core (recommended)
import { xmtpTools } from "@hybrd/core/tools"

// Import specific tools
import { sendMessage, sendReply, sendReaction } from "@hybrd/core/tools"

// Import from XMTP package directly
import { sendMessage, sendReply, sendReaction, getMessage } from "@hybrd/xmtp"
```

### Adding to Agent

```typescript
import { Agent } from "@hybrd/core"
import { xmtpTools } from "@hybrd/core/tools"

const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions...",
  tools: [
    xmtpTools(), // Adds all XMTP tools
  ]
})
```

## Core XMTP Tools

### `sendMessage` - Send Messages to XMTP Conversations

Send messages to existing conversations or start new ones.

#### Basic Usage

```typescript
// Agent can use this tool automatically
const response = await agent.call("sendMessage", {
  to: "0x1234567890abcdef1234567890abcdef12345678",
  content: "Hello! How can I help you today?"
})
```

#### Advanced Message Sending

```typescript
// Send with additional options
await agent.call("sendMessage", {
  to: "0x1234567890abcdef1234567890abcdef12345678",
  content: "Here's your portfolio analysis...",
  metadata: {
    type: "portfolio-report",
    timestamp: Date.now(),
    urgent: false
  }
})

// Send to multiple recipients
const recipients = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222"
]

for (const recipient of recipients) {
  await agent.call("sendMessage", {
    to: recipient,
    content: "Market update: ETH is up 5% today!"
  })
}
```

#### Message Templates

```typescript
// Create reusable message templates
const templates = {
  welcome: (name: string) => `Welcome ${name}! I'm your crypto assistant.`,
  balance: (token: string, amount: string) => `Your ${token} balance: ${amount}`,
  error: (error: string) => `Sorry, I encountered an error: ${error}`
}

// Use in agent
await agent.call("sendMessage", {
  to: userAddress,
  content: templates.welcome("Alice")
})
```

### `sendReply` - Reply to Specific Messages

Reply to specific messages in a conversation thread.

#### Basic Reply

```typescript
// Reply to a specific message
await agent.call("sendReply", {
  originalMessageId: "message-123",
  content: "Thanks for your question! Here's the answer..."
})
```

#### Contextual Replies

```typescript
// Agent automatically handles replies in conversation context
// When processing a message, agent can reply directly
agent.on("message", async (message) => {
  if (message.content.includes("help")) {
    await agent.call("sendReply", {
      originalMessageId: message.id,
      content: `I can help you with:
      • Checking balances
      • Swapping tokens  
      • DeFi strategies
      • Market analysis
      
      What would you like to do?`
    })
  }
})
```

#### Thread Management

```typescript
// Reply with thread context
await agent.call("sendReply", {
  originalMessageId: message.id,
  content: "Continuing our discussion about yield farming...",
  threadContext: {
    topic: "yield-farming",
    previousMessages: 3,
    participants: ["0x1111...", "0x2222..."]
  }
})
```

### `sendReaction` - Send Emoji Reactions

Add emoji reactions to messages for quick acknowledgment.

#### Basic Reactions

```typescript
// React with emoji
await agent.call("sendReaction", {
  messageId: "message-123",
  emoji: "👍"
})

// React with multiple emojis
const reactions = ["👍", "🤖", "✅"]
for (const emoji of reactions) {
  await agent.call("sendReaction", {
    messageId: message.id,
    emoji: emoji
  })
}
```

#### Conditional Reactions

```typescript
// React based on message content
agent.on("message", async (message) => {
  if (message.content.includes("thanks")) {
    await agent.call("sendReaction", {
      messageId: message.id,
      emoji: "🙏"
    })
  } else if (message.content.includes("help")) {
    await agent.call("sendReaction", {
      messageId: message.id,
      emoji: "🆘"
    })
  } else {
    await agent.call("sendReaction", {
      messageId: message.id,
      emoji: "👍"
    })
  }
})
```

#### Sentiment-Based Reactions

```typescript
// React based on sentiment analysis
import { analyzeSentiment } from "./sentiment"

agent.on("message", async (message) => {
  const sentiment = await analyzeSentiment(message.content)
  
  let emoji = "🤔" // Default
  
  if (sentiment.score > 0.7) emoji = "😊"
  else if (sentiment.score > 0.3) emoji = "🙂"
  else if (sentiment.score < -0.7) emoji = "😔"
  else if (sentiment.score < -0.3) emoji = "😐"
  
  await agent.call("sendReaction", {
    messageId: message.id,
    emoji: emoji
  })
})
```

### `getMessage` - Retrieve Message Details

Get detailed information about specific messages.

#### Basic Message Retrieval

```typescript
// Get message details
const messageDetails = await agent.call("getMessage", {
  messageId: "message-123"
})

console.log("Message:", messageDetails.content)
console.log("Sender:", messageDetails.sender)
console.log("Timestamp:", messageDetails.timestamp)
```

#### Message Analysis

```typescript
// Analyze message for context
const message = await agent.call("getMessage", {
  messageId: messageId
})

// Check if message needs urgent response
const isUrgent = message.content.toLowerCase().includes("urgent") ||
                message.content.includes("emergency") ||
                message.metadata?.priority === "high"

if (isUrgent) {
  await agent.call("sendReaction", {
    messageId: messageId,
    emoji: "🚨"
  })
  
  await agent.call("sendReply", {
    originalMessageId: messageId,
    content: "I see this is urgent. Let me help you right away!"
  })
}
```

## Content Types

XMTP supports various content types for rich messaging experiences.

### Text Content

```typescript
// Simple text message
await agent.call("sendMessage", {
  to: userAddress,
  content: "Hello! How can I help you?"
})

// Formatted text with markdown
await agent.call("sendMessage", {
  to: userAddress,
  content: `
**Portfolio Summary**

• ETH: 2.5 ETH ($4,250)
• USDC: 1,000 USDC
• Total: $5,250

*Last updated: ${new Date().toLocaleString()}*
  `
})
```

### Reactions

```typescript
// Standard emoji reactions
const commonReactions = {
  acknowledge: "👍",
  celebrate: "🎉", 
  thinking: "🤔",
  warning: "⚠️",
  error: "❌",
  success: "✅",
  robot: "🤖"
}

await agent.call("sendReaction", {
  messageId: messageId,
  emoji: commonReactions.acknowledge
})
```

### Replies

```typescript
// Thread replies maintain conversation context
await agent.call("sendReply", {
  originalMessageId: originalMessage.id,
  content: "Following up on your question about DeFi yields...",
  reference: {
    type: "follow-up",
    topic: "defi-yields",
    context: "previous-discussion"
  }
})
```

### Attachments (Future)

```typescript
// Future support for attachments
await agent.call("sendMessage", {
  to: userAddress,
  content: "Here's your portfolio report",
  attachments: [
    {
      type: "application/pdf",
      url: "https://reports.example.com/portfolio-123.pdf",
      name: "Portfolio Report.pdf"
    }
  ]
})
```

## Group Conversation Handling

### Group Message Processing

```typescript
// Handle group conversations differently
agent.on("message", async (message) => {
  if (message.conversation.isGroup) {
    // Only respond when mentioned
    if (message.content.includes(agent.address) || 
        message.content.includes("@agent")) {
      
      await agent.call("sendMessage", {
        to: message.conversation.id,
        content: "Hello everyone! How can I help the group?"
      })
    }
  } else {
    // Always respond in DMs
    await agent.processDirectMessage(message)
  }
})
```

### Group Administration

```typescript
// Handle group admin functions
agent.on("message", async (message) => {
  if (message.conversation.isGroup && message.sender.isAdmin) {
    if (message.content.startsWith("/admin")) {
      const command = message.content.split(" ")[1]
      
      switch (command) {
        case "stats":
          await agent.call("sendMessage", {
            to: message.conversation.id,
            content: await getGroupStats(message.conversation.id)
          })
          break
          
        case "summary":
          await agent.call("sendMessage", {
            to: message.conversation.id,
            content: await generateGroupSummary(message.conversation.id)
          })
          break
      }
    }
  }
})
```

### Group Notifications

```typescript
// Send notifications to group members
async function notifyGroup(groupId: string, notification: string) {
  await agent.call("sendMessage", {
    to: groupId,
    content: `📢 **Group Notification**\n\n${notification}`,
    metadata: {
      type: "notification",
      priority: "normal",
      timestamp: Date.now()
    }
  })
}

// Usage
await notifyGroup("group-123", "Market alert: ETH has reached $3,000!")
```

## Advanced XMTP Tool Usage

### Message Queuing

```typescript
// Queue messages for batch sending
class MessageQueue {
  private queue: Array<{to: string, content: string}> = []
  
  add(to: string, content: string) {
    this.queue.push({ to, content })
  }
  
  async flush() {
    const promises = this.queue.map(msg => 
      agent.call("sendMessage", msg)
    )
    
    await Promise.all(promises)
    this.queue = []
  }
}

const messageQueue = new MessageQueue()

// Add messages to queue
messageQueue.add("0x1111...", "Market update 1")
messageQueue.add("0x2222...", "Market update 2")

// Send all at once
await messageQueue.flush()
```

### Message Scheduling

```typescript
// Schedule messages for later delivery
class MessageScheduler {
  private scheduled = new Map<string, NodeJS.Timeout>()
  
  schedule(to: string, content: string, delayMs: number) {
    const timeoutId = setTimeout(async () => {
      await agent.call("sendMessage", { to, content })
      this.scheduled.delete(to)
    }, delayMs)
    
    this.scheduled.set(to, timeoutId)
  }
  
  cancel(to: string) {
    const timeoutId = this.scheduled.get(to)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduled.delete(to)
    }
  }
}

const scheduler = new MessageScheduler()

// Schedule reminder for 1 hour
scheduler.schedule(
  userAddress,
  "Reminder: Your DeFi position expires in 1 hour!",
  60 * 60 * 1000 // 1 hour
)
```

### Message Templates with Variables

```typescript
// Dynamic message templates
class MessageTemplates {
  static portfolio(data: any) {
    return `
🏦 **Portfolio Summary**

💰 Total Value: $${data.totalValue.toLocaleString()}
📈 24h Change: ${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%

**Top Holdings:**
${data.holdings.map((h: any) => 
  `• ${h.symbol}: ${h.amount} (${h.percentage}%)`
).join('\n')}

*Last updated: ${new Date().toLocaleString()}*
    `
  }
  
  static transaction(tx: any) {
    return `
✅ **Transaction Confirmed**

🔗 Hash: ${tx.hash}
💸 Amount: ${tx.amount} ${tx.token}
⛽ Gas Used: ${tx.gasUsed}
🕐 Time: ${new Date(tx.timestamp).toLocaleString()}

View on Etherscan: https://etherscan.io/tx/${tx.hash}
    `
  }
}

// Usage
await agent.call("sendMessage", {
  to: userAddress,
  content: MessageTemplates.portfolio(portfolioData)
})
```

## Error Handling and Reliability

### Retry Logic

```typescript
// Implement retry logic for failed messages
async function sendMessageWithRetry(
  to: string, 
  content: string, 
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await agent.call("sendMessage", { to, content })
      return // Success
    } catch (error) {
      console.warn(`Message send attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to send message after ${maxRetries} attempts`)
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      )
    }
  }
}
```

### Message Validation

```typescript
// Validate messages before sending
function validateMessage(to: string, content: string) {
  if (!to || !to.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error("Invalid recipient address")
  }
  
  if (!content || content.trim().length === 0) {
    throw new Error("Message content cannot be empty")
  }
  
  if (content.length > 10000) {
    throw new Error("Message too long (max 10,000 characters)")
  }
}

// Use validation
try {
  validateMessage(userAddress, messageContent)
  await agent.call("sendMessage", { to: userAddress, content: messageContent })
} catch (error) {
  console.error("Message validation failed:", error.message)
}
```

## Next Steps

- Learn about [Advanced XMTP Features](/xmtp/advanced) for encryption and security
- Explore [Agent Configuration](/agent-configuration/behaviors) for message processing
- Check out [Blockchain Tools](/blockchain/tools) for crypto functionality
- See [Tools](/tools) for creating custom agent capabilities
