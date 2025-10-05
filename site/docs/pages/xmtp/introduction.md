---
title: Introduction to XMTP
description: Understanding XMTP and decentralized messaging for Hybrid agents
---

# Introduction to XMTP

Learn about XMTP (Extensible Message Transport Protocol) and how it enables decentralized messaging for Hybrid agents.

## What is XMTP and Decentralized Messaging

XMTP is a decentralized messaging protocol that enables secure, wallet-to-wallet communication. Unlike traditional messaging platforms, XMTP:

- **Decentralized** - No single point of control or failure
- **Wallet-based identity** - Users identified by Ethereum addresses
- **End-to-end encrypted** - Messages encrypted between participants
- **Cross-platform** - Works with any XMTP-compatible client
- **Permissionless** - Anyone can build on the protocol

### Key Benefits for AI Agents

XMTP provides unique advantages for AI agents:

- **Financial identity** - Agents can receive payments and tips
- **Persistent identity** - Reputation builds over time with wallet address
- **Interoperability** - Works with existing crypto wallets and dApps
- **Censorship resistance** - No central authority can block agents
- **Programmable money** - Agents can handle payments automatically

## XMTP Network Overview

### Development vs Production Networks

XMTP operates on two main networks:

#### Development Network
- **Purpose** - Testing and development
- **Endpoint** - `https://dev.xmtp.org`
- **Features** - Faster message delivery, reset-friendly
- **Use case** - Building and testing agents

#### Production Network
- **Purpose** - Live applications and real users
- **Endpoint** - `https://production.xmtp.org`
- **Features** - Stable, persistent message history
- **Use case** - Deployed agents serving real users

### Network Configuration

```typescript
import { Agent } from "@hybrd/core"

// Development network (default)
const devAgent = new Agent({
  xmtp: {
    network: "dev",
    env: "development"
  }
})

// Production network
const prodAgent = new Agent({
  xmtp: {
    network: "production", 
    env: "production"
  }
})
```

## Generating XMTP Keys

### Automatic Key Generation

Hybrid automatically generates XMTP keys when you run:

```bash
hybrid keys
```

This creates:
- **Wallet private key** - For signing transactions and messages
- **XMTP encryption key** - For message encryption/decryption
- **Environment configuration** - Automatically written to `.env`

### Manual Key Generation

```typescript
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { generateEncryptionKey } from "@hybrd/xmtp"

// Generate wallet key
const walletKey = generatePrivateKey()
const account = privateKeyToAccount(walletKey)

// Generate XMTP encryption key
const encryptionKey = generateEncryptionKey()

console.log("Wallet Address:", account.address)
console.log("Wallet Key:", walletKey)
console.log("Encryption Key:", encryptionKey)
```

### Key Security Best Practices

**Environment Variables**
```bash
# .env file
XMTP_WALLET_KEY=0x1234567890abcdef...
XMTP_DB_ENCRYPTION_KEY=abcdef1234567890...
```

**Security Guidelines**
- Never commit keys to version control
- Use different keys for development and production
- Store production keys in secure environment variable services
- Regularly rotate keys for high-value agents
- Use hardware security modules (HSMs) for critical applications

## Wallet Registration with XMTP Network

### Registration Process

Before your agent can send/receive messages, register with XMTP:

```bash
hybrid register
```

This process:
1. **Validates wallet** - Ensures private key is valid
2. **Creates XMTP identity** - Generates cryptographic identity
3. **Registers on network** - Adds wallet to XMTP directory
4. **Enables messaging** - Agent can now send/receive messages

### Registration Options

```bash
# Register on specific network
hybrid register --network production

# Force re-registration
hybrid register --force

# Register with custom identity
hybrid register --identity "My Trading Bot"
```

### Programmatic Registration

```typescript
import { Client } from "@xmtp/xmtp-js"
import { privateKeyToAccount } from "viem/accounts"

async function registerAgent() {
  const account = privateKeyToAccount(process.env.XMTP_WALLET_KEY)
  
  const client = await Client.create(account, {
    env: "production", // or "dev"
  })
  
  console.log("Agent registered:", client.address)
  return client
}
```

### Verification

Verify registration status:

```bash
# Check registration status
hybrid status

# Test connectivity
hybrid ping

# View agent information
hybrid info
```

## Testing with XMTP Chat Interfaces

### Available XMTP Clients

Test your agent with existing XMTP clients:

#### Web Clients
- **XMTP Inbox** - https://xmtp.chat
- **Coinbase Wallet** - Built-in XMTP support
- **Lens Protocol** - Social messaging with XMTP

#### Mobile Apps
- **Coinbase Wallet** - iOS/Android with XMTP
- **Converse** - Dedicated XMTP messaging app
- **Lens** - Social app with XMTP messaging

#### Developer Tools
- **XMTP CLI** - Command-line testing tool
- **React SDK** - Build custom interfaces
- **React Native SDK** - Mobile app integration

### Testing Workflow

1. **Deploy your agent** to development network
2. **Register agent wallet** with XMTP
3. **Open XMTP client** (e.g., https://xmtp.chat)
4. **Connect your wallet** to the client
5. **Start conversation** with agent's address
6. **Test agent responses** and behaviors

### Example Test Conversation

```
You: Hello agent!
Agent: 👋 Hello! I'm a Hybrid agent. I can help you with:
       • Checking wallet balances
       • DeFi protocol interactions  
       • Market analysis and insights
       • Transaction assistance
       
       What would you like to do?

You: Check my ETH balance
Agent: 🔍 Checking your ETH balance...
       
       Address: 0x1234...5678
       ETH Balance: 2.45 ETH ($4,234.56)
       
       Would you like me to check other tokens or help with anything else?
```

### Testing Different Message Types

#### Text Messages
```typescript
// Agent handles regular text
"What's my portfolio worth?"
"Help me swap tokens"
"Explain yield farming"
```

#### Reactions
```typescript
// Test reaction handling
// Send 👍 reaction to agent message
// Agent might respond or acknowledge
```

#### Group Conversations
```typescript
// Add agent to group chat
// Test group-specific behaviors
// Verify agent responds to mentions
```

### Debugging Message Flow

Enable debug logging to see message processing:

```typescript
const agent = new Agent({
  debug: true,
  xmtp: {
    logLevel: "debug"
  }
})

// Logs will show:
// - Incoming messages
// - Filter processing
// - Behavior execution
// - AI model calls
// - Outgoing responses
```

### Common Testing Scenarios

#### Basic Functionality
- Agent responds to simple greetings
- Handles unknown commands gracefully
- Provides help information

#### Blockchain Integration
- Checks wallet balances correctly
- Executes transactions with approval
- Handles transaction failures

#### Conversation Management
- Maintains context across messages
- Handles multiple simultaneous conversations
- Manages conversation state properly

#### Error Handling
- Graceful handling of invalid requests
- Clear error messages for users
- Recovery from temporary failures

## Network Considerations

### Message Delivery

XMTP provides:
- **Eventual consistency** - Messages delivered reliably
- **Ordering guarantees** - Messages arrive in order
- **Retry logic** - Automatic retry on failures
- **Offline support** - Messages queued when offline

### Rate Limits

Be aware of network limits:
- **Message frequency** - Avoid spam-like behavior
- **Message size** - Keep messages reasonably sized
- **Connection limits** - Don't create excessive connections

### Performance Optimization

```typescript
// Optimize for performance
const agent = new Agent({
  xmtp: {
    // Batch message processing
    batchSize: 10,
    
    // Connection pooling
    maxConnections: 5,
    
    // Message caching
    cacheMessages: true,
    
    // Compression
    enableCompression: true,
  }
})
```

## Next Steps

- Learn about [XMTP Tools](/tools/xmtp) for sending messages and reactions
- Explore [Advanced XMTP Features](/xmtp/advanced) for encryption and security
- Check out [Agent Configuration](/agent-configuration/behaviors) for message processing
- See [Blockchain Tools](/tools/blockchain) for crypto functionality
