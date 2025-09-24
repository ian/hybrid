# Miniapp Example

This example demonstrates a **joint MiniKit and Hybrid project** that combines Farcaster miniapp functionality with XMTP messaging capabilities. It showcases how to integrate OnchainKit components within a miniapp while providing AI-powered assistance through a Hybrid agent.

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "hybrid"
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
  name: "Miniapp Agent",
  model: openrouter("x-ai/grok-4"),
  instructions: `You are a helpful AI agent integrated with a MiniKit miniapp. You can help users with:
- Answering questions about the miniapp and its features
- Providing guidance on using OnchainKit components
- Helping with Farcaster and XMTP interactions
- Explaining miniapp functionality and user authentication

You work alongside a MiniKit miniapp that provides onchain interactions through OnchainKit components. Focus on being helpful and informative about the miniapp experience.`,
  tools: [],
  runtime: {
    privateKey: process.env.XMTP_WALLET_KEY
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

## 🎯 Joint MiniKit & Hybrid Features

This example showcases the integration between:

### MiniKit Miniapp
- **Farcaster miniapp SDK**: Full miniapp functionality with user authentication
- **OnchainKit components**: Rich onchain interactions (Transaction, Swap, Checkout, Wallet, Identity)
- **Quick Auth**: Secure user identity verification
- **MiniKit hooks**: Context and state management for miniapp interactions

### Hybrid Agent
- **XMTP messaging**: Direct messaging capabilities through XMTP protocol
- **AI assistance**: OpenRouter-powered AI responses
- **Message filtering**: Smart filtering for relevant conversations
- **Threaded replies**: Contextual conversation handling

### Key Integration Points
- **Dual runtime**: Next.js miniapp frontend + Hybrid agent backend
- **Authentication flow**: MiniKit auth with Farcaster identity
- **User context**: Shared user data between miniapp and agent
- **OnchainKit UI**: Rich blockchain interactions in the miniapp interface

# MiniKit & Hybrid Integration

A joint project demonstrating the integration between MiniKit miniapps and Hybrid XMTP agents, showcasing how to combine Farcaster miniapp functionality with AI-powered messaging.

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

2. **Configure MiniKit**
   - The miniapp uses OnchainKit and MiniKit for onchain interactions
   - No additional API keys required for basic miniapp functionality

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
# Start both the miniapp and agent concurrently
pnpm dev

# Or run them separately:
pnpm run dev:miniapp  # Start the Next.js miniapp
pnpm run dev:hybrid   # Start the Hybrid agent

# Build for production
pnpm build

# Start production servers
pnpm start:miniapp    # Start the miniapp
pnpm start:hybrid     # Start the agent
```

## 📁 Project Structure

```
miniapp-hybrid-integration/
├── src/
│   ├── agent.ts          # Hybrid agent for XMTP messaging and AI assistance
│   └── agent.test.ts     # Agent test entry file
├── app/                  # Next.js miniapp with OnchainKit components
│   ├── api/auth/         # MiniKit authentication endpoint
│   ├── page.tsx          # Main miniapp interface
│   ├── layout.tsx        # App layout with providers
│   └── rootProvider.tsx  # Context providers for miniapp
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
├── minikit.config.ts     # MiniKit configuration
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

## 🧪 Testing Integration Features

### Quick Test

```bash
# 1. Start both miniapp and agent
npm run dev

# 2. Send messages via XMTP:
#    @agent what can this miniapp do?
#    @agent how do I use the wallet component?
#    @agent tell me about onchainkit
```

### Manual Testing

1. **Miniapp Features**:
   ```
   @agent what components are available in this miniapp?
   ```

2. **OnchainKit Help**:
   ```
   @agent how do I connect a wallet?
   ```

3. **Authentication**:
   ```
   @agent explain the user authentication flow
   ```

### Unit Tests

```bash
npm test
```

Tests verify that behaviors work correctly and the agent responds appropriately to miniapp-related queries.

## 🤖 Agent Configuration

The agent is configured in `src/agent.ts`. You can customize:

- **AI Model**: Change the model in the `openrouter()` call
- **Instructions**: Modify the agent's system prompt for miniapp assistance
- **Message Filtering**: Adjust which messages the agent responds to
- **Port**: Change the server port in `.env`

### Example Customizations

```typescript
const agent = new Agent({
  name: "Miniapp Assistant",
  model: openrouter("anthropic/claude-3-haiku"), // Different model
  instructions: "You are a miniapp specialist that helps users understand...",
  tools: [], // No tools needed for miniapp assistance
  runtime: {
    privateKey: process.env.XMTP_WALLET_KEY
  }
})
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Required for Hybrid agent
OPENROUTER_API_KEY=your_openrouter_api_key_here
XMTP_WALLET_KEY=your_generated_wallet_key
XMTP_DB_ENCRYPTION_KEY=your_generated_encryption_key

# Optional
XMTP_ENV=dev
PORT=8454
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

### MiniKit Integration

The miniapp uses MiniKit for Farcaster miniapp functionality:

```typescript
import { useMiniKit } from "@coinbase/onchainkit/minikit"

// MiniKit provides:
useMiniKit()        // Access miniapp context and user data
setFrameReady()     // Initialize the miniapp frame
Quick Auth          // User authentication flow
```

### OnchainKit Components

The miniapp includes OnchainKit components for rich blockchain interactions:

- **Transaction**: Execute onchain transactions
- **Swap**: Token swapping interface
- **Checkout**: Payment processing
- **Wallet**: Wallet connection and management
- **Identity**: User identity verification

### Hybrid Agent

The agent provides AI assistance through XMTP messaging:

```typescript
import { filterMessages, reactWith, threadedReply } from "hybrid/behaviors"

// Available behaviors:
filterMessages()    // Filter relevant messages
reactWith()         // React to messages with emojis
threadedReply()     // Maintain conversation context
```

### Agent Instructions

The system prompt tells the AI how to assist with miniapp functionality:

```typescript
const agent = new Agent({
  instructions: `You are a helpful AI agent integrated with a MiniKit miniapp. You can help users with:
- Answering questions about the miniapp and its features
- Providing guidance on using OnchainKit components
- Helping with Farcaster and XMTP interactions
- Explaining miniapp functionality and user authentication`
})
```

## 🔗 Useful Links

- [Hybrid Documentation](https://hybrid.dev)
- [XMTP Documentation](https://docs.xmtp.org/)
- [MiniKit Documentation](https://docs.farcaster.xyz/developers/miniapps)
- [OnchainKit Documentation](https://docs.base.org/onchainkit)
- [Farcaster Documentation](https://docs.farcaster.xyz/)
- [OpenRouter Models](https://openrouter.ai/docs#models)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
