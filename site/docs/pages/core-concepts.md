---
title: Core Concepts
description: Fundamental concepts that make Hybrid agents unique
---

# Core Concepts

Understanding the fundamental concepts behind Hybrid agents and how they differ from traditional AI applications.

## What is Hybrid and Why?

### Hybrid as a Framework

Hybrid is a framework for building autonomous agents that combine AI capabilities with blockchain functionality. Unlike traditional chatbots, Hybrid agents:

- Have their own wallet addresses and can spend money
- Communicate through decentralized messaging protocols
- Can interact with DeFi protocols and smart contracts
- Operate autonomously with financial capabilities

### Decentralized Messaging Meets AI

Traditional AI agents are limited to centralized platforms. Hybrid agents use XMTP (Extensible Message Transport Protocol) for:

- **Decentralized communication** - No single point of failure
- **Wallet-based identity** - Agents are identified by their Ethereum addresses
- **End-to-end encryption** - Secure message transmission
- **Cross-platform compatibility** - Works with any XMTP-compatible client

### Why Agents Need Wallets

Financial autonomy enables agents to:

- Pay for their own API calls and infrastructure
- Participate in DeFi protocols
- Execute transactions on behalf of users
- Earn revenue through services
- Manage their own operational costs

### The Vision of Financially Autonomous AI

Hybrid enables a future where AI agents can:

- Operate independently without human financial oversight
- Earn money through providing services
- Invest and manage their own portfolios
- Pay for resources and scale automatically
- Create new economic models for AI services

## Crypto and Wallet Fundamentals

### Automatic Wallet Creation

Every Hybrid agent automatically receives:

- **Ethereum wallet address** - Unique identity on the blockchain
- **Private key management** - Securely stored and managed
- **Multi-chain support** - Works across Ethereum, Polygon, Base, etc.
- **Gas management** - Automatic gas estimation and payment

### Agent Financial Capabilities

Agents can interact with DeFi through:

```typescript
import { blockchainTools } from "@hybrd/core/tools"

agent.use(blockchainTools({
  chains: ["ethereum", "polygon", "base"],
  maxGasPrice: "50000000000", // 50 gwei
}))
```

### ECDSA Key Generation and Security

- **Secure key generation** using cryptographically secure random number generation
- **Key derivation** following BIP-44 standards
- **Environment-based storage** with encryption
- **Key rotation** capabilities for enhanced security

### Understanding Gas Fees and Transaction Costs

Agents automatically handle:

- **Gas estimation** for optimal transaction costs
- **Dynamic fee adjustment** based on network conditions
- **Transaction retry logic** for failed transactions
- **Cost optimization** across multiple chains

### Agent Financial Autonomy

Configure spending controls:

```typescript
const agent = new Agent({
  wallet: {
    maxDailySpend: "0.1", // 0.1 ETH per day
    allowedContracts: ["0x..."], // Whitelist contracts
    requireConfirmation: true, // Require user confirmation for large transactions
  }
})
```

## Agent Class Fundamentals

### Basic Agent Structure

```typescript
import { Agent } from "@hybrd/core"

const agent = new Agent({
  model: yourAIModel,
  instructions: "Your agent's personality and behavior",
  behaviors: [/* message processing behaviors */],
  tools: [/* available tools and capabilities */],
})
```

### Quintessential Agent Example

```typescript
import { Agent } from "@hybrd/core"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { filterMessages, reactWith } from "@hybrd/core/behaviors"
import { blockchainTools, xmtpTools } from "@hybrd/core/tools"

const agent = new Agent({
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4"),
  
  instructions: `You are a helpful crypto AI agent. You can:
  - Check wallet balances and transaction history
  - Send transactions and interact with DeFi
  - Provide market insights and analysis
  - Help users navigate the crypto ecosystem`,
  
  behaviors: [
    filterMessages(filter => filter.isText() && !filter.fromSelf()),
    reactWith("🤖"),
  ],
  
  tools: [
    blockchainTools(),
    xmtpTools(),
  ],
})
```

### Message Processing Lifecycle

1. **Message Reception** - Agent receives message through XMTP
2. **Behavior Filtering** - Behaviors determine if message should be processed
3. **AI Processing** - Message is sent to AI model with context
4. **Tool Execution** - Agent can call tools based on AI response
5. **Response Generation** - Agent sends response back through XMTP

### Agent Runtime Behavior

Agents operate in a continuous loop:

```typescript
// Simplified agent lifecycle
while (agent.isRunning) {
  const messages = await agent.checkForNewMessages()
  
  for (const message of messages) {
    if (await agent.shouldProcess(message)) {
      const response = await agent.processMessage(message)
      await agent.sendResponse(response)
    }
  }
  
  await agent.sleep(1000) // Check every second
}
```

### Connecting AI Models to Blockchain

Agents bridge AI and blockchain through:

- **Tool integration** - AI can call blockchain functions
- **Context awareness** - AI understands wallet state and transaction history
- **Smart contract interaction** - AI can read and write to contracts
- **DeFi integration** - AI can participate in lending, trading, etc.

## Messaging Networks and Channels

### XMTP as Primary Network

XMTP provides:

- **Decentralized messaging** - No central authority
- **Wallet-based identity** - Messages tied to Ethereum addresses
- **End-to-end encryption** - Secure communication
- **Cross-client compatibility** - Works with any XMTP client

### Understanding Messaging Protocols

Key concepts:

- **Conversations** - 1:1 or group message threads
- **Content types** - Text, reactions, replies, attachments
- **Message encryption** - Automatic encryption/decryption
- **Message persistence** - Messages stored on XMTP network

### Future Channel Support

Planned integrations:

#### Discord Integration Patterns
- Bot-based messaging through Discord API
- Slash command integration
- Server-specific agent deployment
- Role-based permissions and access

#### Telegram Bot Capabilities
- Telegram Bot API integration
- Group chat participation
- Inline query responses
- Custom keyboard interactions

#### Twitter/X Messaging Features
- Direct message automation
- Tweet monitoring and responses
- Mention-based interactions
- Thread participation

### Cross-Platform Messaging Strategies

Design patterns for multi-platform agents:

```typescript
const agent = new Agent({
  channels: {
    xmtp: { primary: true },
    discord: { guildIds: ["123..."] },
    telegram: { botToken: process.env.TELEGRAM_TOKEN },
  }
})
```

### Channel-Specific Behavior Customization

```typescript
agent.use(filterMessages(filter => {
  if (filter.channel === "discord") {
    return filter.hasPrefix("!")
  }
  if (filter.channel === "telegram") {
    return filter.isCommand()
  }
  return filter.isText()
}))
```

## Agent Identity and Authentication

### Wallet-Based Identity

Agents are identified by:

- **Ethereum address** - Unique identifier across all platforms
- **ENS name** - Human-readable names (e.g., `myagent.eth`)
- **XMTP identity** - Cryptographic identity for messaging
- **Reputation score** - Built over time through interactions

### XMTP Network Registration

```bash
# Register agent wallet with XMTP network
hybrid register

# Verify registration
hybrid status
```

### Managing Multiple Agent Identities

```typescript
const agentManager = new AgentManager({
  agents: [
    { name: "trading-bot", wallet: "0x123..." },
    { name: "support-agent", wallet: "0x456..." },
    { name: "defi-advisor", wallet: "0x789..." },
  ]
})
```

### Identity Persistence Across Sessions

- **Key storage** in encrypted environment variables
- **Session management** with automatic reconnection
- **State persistence** across restarts
- **Identity verification** on startup

## Next Steps

Now that you understand the core concepts, explore:

- [Using Hybrid](/using-hybrid) - CLI commands and development workflow
- [Agent Configuration](/agent-configuration/prompts) - Detailed agent setup
- [XMTP](/xmtp/introduction) - Deep dive into messaging capabilities
- [Blockchain](/blockchain/tools) - Blockchain integration and tools
