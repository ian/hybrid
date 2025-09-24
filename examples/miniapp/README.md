# Miniapp Example

This example demonstrates using Hybrid with **miniapp integration** for onchain interactions. It combines the power of XMTP messaging with blockchain capabilities through OnchainKit and Farcaster miniapp features.

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"
import { blockchainTools } from "hybrid/tools"

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
  name: "Miniapp Agent",
  model: openrouter("x-ai/grok-4"),
  instructions: "You are a helpful AI agent with onchain capabilities...",
  tools: [
    blockchainTools.getBalance,
    blockchainTools.getTransaction,
    blockchainTools.sendTransaction,
    blockchainTools.getBlock,
    blockchainTools.getGasPrice,
    blockchainTools.estimateGas
  ],
  runtime: {
    privateKey: process.env.XMTP_WALLET_KEY,
    defaultChain: "base"
  }
})

await agent.listen({
  port: process.env.PORT || "8454",
  behaviors: [
    filterMessages((filters) => {
      return (
        filters.isReply() ||
        filters.isDM() ||
        filters.hasMention("@agent") ||
        filters.isReaction("👍")
      )
    }),
    reactWith("👀"),
    threadedReply()
  ]
})
```

## 🎯 Miniapp Integration Features

This example includes:

### Onchain Capabilities
- **Multi-chain support**: Ethereum, Base, Polygon, Arbitrum, Optimism
- **Balance checking**: Get native token balances for any address
- **Transaction management**: Send transactions and check status
- **Gas estimation**: Get current gas prices and estimate costs
- **Block information**: Access blockchain block data

### Miniapp Components
- **OnchainKit integration**: Transaction, Swap, Checkout, Wallet, Identity components
- **Farcaster miniapp SDK**: Authentication and user verification
- **Viem**: Ethereum interactions and wallet management

### Available Blockchain Tools

#### `getBalance(address, chain)`
Get native token balance for a wallet address.

```typescript
// Agent can check balances across multiple chains
"Check my balance on Base: 0x123..."
```

#### `sendTransaction(to, amount, chain)`
Send native tokens to another address.

```typescript
// Agent can send transactions (requires private key)
"Send 0.1 ETH to 0x456... on Ethereum"
```

#### `getTransaction(hash, chain)`
Get transaction details by hash.

```typescript
// Agent can look up transaction status
"What's the status of transaction 0xabc...?"
```

#### `getGasPrice(chain)`
Get current gas prices.

```typescript
// Agent can provide gas price information
"What's the current gas price on Polygon?"
```

# {{projectName}}

A Hybrid XMTP agent with miniapp integration for onchain interactions.

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher (Node 22 recommended)

### Installation

```bash
# Install dependencies
pnpm install
```

### Setup

1. **Get your OpenRouter API key**
   - Visit [OpenRouter](https://openrouter.ai/keys) and create an account
   - Generate an API key
   - Add it to your `.env` file

2. **Get your OnchainKit API key**
   - Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/onchainkit)
   - Create an account and generate an API key
   - Add it to your `.env` file as `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

3. **Generate XMTP keys**
   ```bash
   hybrid keys
   # or
   hybrid keys --write
   ```

4. **Update environment variables**
   Edit the `.env` file with your API keys and generated keys.

### Development

```bash
# Start development server with auto-reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── agent.ts          # Main agent implementation with blockchain tools
│   └── agent.test.ts     # Agent test entry file
├── dist/                 # Compiled JavaScript (after build)
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
├── minikit.config.ts     # Miniapp configuration
└── README.md             # This file
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint and fix code
- `npm run format` - Format code
- `npm run typecheck` - Check TypeScript types

## 🧪 Testing Onchain Features

### Quick Test

```bash
# 1. Start the agent
npm run dev

# 2. Send messages via XMTP:
#    @agent check balance 0x123... on base
#    @agent what's the gas price on ethereum?
#    @agent send 0.01 ETH to 0x456... on base
```

### Manual Testing

1. **Balance Checking**:
   ```
   @agent check my balance on base
   ```

2. **Gas Price Information**:
   ```
   @agent what's the current gas price on ethereum?
   ```

3. **Transaction Status**:
   ```
   @agent check transaction 0xabc123...
   ```

### Unit Tests

```bash
npm test
```

Tests verify that behaviors work correctly and blockchain tools can be imported.

## 🤖 Agent Configuration

The agent is configured in `src/agent.ts`. You can customize:

- **AI Model**: Change the model in the `openrouter()` call
- **Instructions**: Modify the agent's system prompt for onchain interactions
- **Blockchain Tools**: Add or remove blockchain capabilities
- **Supported Chains**: Configure which networks the agent can interact with
- **Message Filtering**: Adjust which messages the agent responds to
- **Port**: Change the server port in `.env`

### Example Customizations

```typescript
const agent = new Agent({
  name: "My Onchain Agent",
  model: openrouter("anthropic/claude-3-haiku"), // Different model
  instructions: "You are a DeFi specialist that helps with...",
  tools: [
    blockchainTools.getBalance,
    blockchainTools.getGasPrice,
    // Add only the tools you need
  ],
  runtime: {
    privateKey: process.env.XMTP_WALLET_KEY,
    defaultChain: "ethereum" // Change default chain
  }
})
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here
XMTP_WALLET_KEY=your_generated_wallet_key
XMTP_DB_ENCRYPTION_KEY=your_generated_encryption_key

# Optional
XMTP_ENV=dev
PORT=8454

# Miniapp specific
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📚 Key Concepts

### Blockchain Integration

The agent uses blockchain tools to interact with multiple EVM chains:

```typescript
import { blockchainTools } from "hybrid/tools"

// Available tools:
blockchainTools.getBalance     // Check wallet balances
blockchainTools.sendTransaction // Send native tokens
blockchainTools.getTransaction // Get transaction details
blockchainTools.getBlock       // Get block information
blockchainTools.getGasPrice    // Get current gas prices
blockchainTools.estimateGas    // Estimate transaction costs
```

### Miniapp Features

The miniapp includes OnchainKit components for rich onchain interactions:

- **Transaction**: Execute onchain transactions
- **Swap**: Token swapping interface
- **Checkout**: Payment processing
- **Wallet**: Wallet connection and management
- **Identity**: User identity verification

### Message Filtering

The agent uses a filter function to determine which messages to respond to:

```typescript
filterMessages((filters) => {
  return (
    filters.isReply() ||
    filters.isDM() ||
    filters.hasMention("@agent") ||
    filters.isReaction("👍")
  )
})
```

### Agent Instructions

The system prompt tells the AI how to behave with onchain capabilities:

```typescript
const agent = new Agent({
  instructions: `You are a helpful AI agent with onchain capabilities. You can help users with:
- Checking wallet balances across multiple chains
- Sending transactions and checking transaction status
- Getting current gas prices and estimating transaction costs
- Providing information about blockchain blocks and network status`
})
```

## 🔗 Useful Links

- [Hybrid Documentation](https://hybrid.dev)
- [XMTP Documentation](https://docs.xmtp.org/)
- [OnchainKit Documentation](https://docs.base.org/onchainkit)
- [Farcaster Miniapp SDK](https://docs.farcaster.xyz/developers/miniapps)
- [OpenRouter Models](https://openrouter.ai/docs#models)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
