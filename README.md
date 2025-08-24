# Hybrid - Agent Framework for Commerce-Connected XMTP Agents

An open-source agent framework for building commerce-connected conversational agents on XMTP. Hybrid enables developers to create AI agents that can handle transactions, manage digital assets, and provide commerce experiences through natural messaging interfaces.

## 🏗️ Architecture

This project uses a monorepo structure with multiple applications and packages:

```
hybrid/
├── examples/
│   └── basic/        # Basic agent example implementation
└── packages/
    ├── hybrid/       # Main agent framework library
    ├── utils/        # Utility functions and helpers
    └── xmtp/         # XMTP client and messaging utilities
```

### Key Features

- **Agent Framework**: Extensible framework for building conversational agents
- **XMTP Integration**: Native support for XMTP messaging protocol
- **Commerce-Connected**: Built-in tools for blockchain transactions and asset management
- **TypeScript First**: Full TypeScript support with type-safe APIs
- **Plugin System**: Modular architecture for extending agent capabilities
- **Production Ready**: Scalable message processing for production environments

## 🤖 Agent Framework Overview

### How It Works

The Hybrid agent framework enables natural, conversation-based commerce interactions through XMTP:

1. **Message Processing**: Agents listen for and process incoming XMTP messages
2. **Tool Execution**: Built-in and custom tools handle blockchain transactions and commerce operations
3. **Context Management**: Maintain conversation context and user state across message threads
4. **Response Generation**: Generate intelligent responses based on user requests and tool results

### Example Agent Interaction

```
User: "Send 10 USDC to 0x1234...abcd"
Agent: "✅ Transaction initiated!
     📋 Amount: 10 USDC
     👤 Recipient: 0x1234...abcd
     🔗 Tx Hash: 0x5678...efgh

     Your transaction is being processed on the blockchain."

User: "What's my USDC balance?"
Agent: "💰 Your current USDC balance is 150.75"
```

### Core Capabilities

Agents can handle:
- **Token Transfers**: Send and receive ERC20 tokens
- **Balance Queries**: Check wallet balances and transaction history
- **Commerce Operations**: Handle payments, purchases, and transactions
- **Custom Tools**: Extend functionality with custom commerce logic

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 22 or higher
- **pnpm**: Package manager
- **Git**: Version control

### 1. Clone and Install

```bash
git clone <repository-url>
cd hybrid
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# AI Configuration
OPENROUTER_API_KEY="your_openai_api_key"

# XMTP Configuration
WALLET_KEY="0x..."  # Private key for XMTP agent
ENCRYPTION_KEY="..."  # Database encryption key
XMTP_ENV="dev"  # dev, production

# Coinbase AgentKit (for commerce operations)
CDP_PROJECT_ID="your_project_id"
CDP_API_KEY_ID="your_api_key_id"
CDP_API_KEY_SECRET="your_api_key_secret"
CDP_WALLET_SECRET="your_wallet_secret"
```

### 3. Generate XMTP Keys

```bash
pnpm gen:keys
```

This will generate secure wallet and encryption keys for your XMTP agent.

### 4. Start Development Server

```bash
# Start the agent
pnpm dev
```

This starts the agent at http://localhost:3001 and begins listening for XMTP messages.

## 📱 Usage

### Agent Interactions

1. **Send Messages**: Users send XMTP messages to your agent
2. **Natural Language**: Agents understand natural language commerce requests
3. **Tool Execution**: Built-in tools handle blockchain operations automatically
4. **Response Generation**: Agents provide clear, actionable responses

Example conversation:
```
User: "Send 5 USDC to vitalik.eth"
Agent: "✅ Transaction initiated!
     📋 Amount: 5 USDC
     👤 Recipient: vitalik.eth
     🔗 Tx Hash: 0x1234...abcd

     Your transaction is being processed."

User: "What's the price of ETH?"
Agent: "📈 Current ETH price: $3,245.67"
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start the agent
pnpm build                  # Build all packages
pnpm test                   # Run tests

# Code Quality
pnpm lint                   # Lint all packages
pnpm format                 # Format code
pnpm typecheck              # Type checking

# XMTP
pnpm gen:keys               # Generate XMTP keys
```

### Project Structure

#### Basic Example (`examples/basic`)
- **Message Processing**: Handle incoming XMTP messages
- **Tool System**: Execute commerce and blockchain operations
- **AI Integration**: Natural language understanding and response generation
- **Context Management**: Maintain conversation state and user context

#### Core Packages
- **hybrid/**: Main agent framework library
  - Agent runtime and plugin system
  - Tool definitions and execution
  - XMTP message handling
- **utils/**: Common utilities and helpers
  - Array, string, and object utilities
  - Storage and date helpers
  - URL and UUID utilities
- **xmtp/**: XMTP client and messaging utilities
  - Client initialization and management
  - Message sending and receiving
  - Address resolution and identity management

### Key Technologies

- **Core**: Node.js, TypeScript, pnpm workspace
- **Messaging**: XMTP Protocol for decentralized messaging
- **AI**: OpenRouter API for natural language processing
- **Commerce**: Coinbase AgentKit for blockchain operations
- **Development**: Biome for linting and formatting

## 🔧 Configuration

### Agent Configuration

Configure your agent behavior in `examples/basic/src/agent.ts`:

```typescript
// Agent configuration options
const agentConfig = {
  name: "Commerce Agent",
  description: "AI-powered commerce assistant",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000
}
```

### Environment Variables

Key environment variables for agent operation:

```env
# Required
OPENROUTER_API_KEY="your_openai_api_key"
WALLET_KEY="0x..."  # XMTP wallet private key
XMTP_ENV="dev"  # dev or production

# Optional - for Coinbase AgentKit integration
CDP_PROJECT_ID="your_project_id"
CDP_API_KEY_ID="your_api_key_id"
CDP_API_KEY_SECRET="your_api_key_secret"
```

## 🚀 Deployment

### Agent Deployment

Deploy your agent to any Node.js hosting provider:

1. **Build the project**:
```bash
pnpm build
```

2. **Deploy to your preferred provider**:
   - Heroku
   - DigitalOcean App Platform
   - Vercel
   - AWS Lambda
   - Google Cloud Functions
   - Any other Node.js hosting service

### Environment Setup

Ensure all environment variables are set in your deployment environment:
- `OPENROUTER_API_KEY`
- `WALLET_KEY`
- `XMTP_ENV`
- `ENCRYPTION_KEY`

## 🧪 Testing

### Unit Tests

```bash
pnpm test
```

### Integration Tests

```bash
# Test XMTP message processing
pnpm test:integration
```

### Manual Testing

1. Start local development environment: `pnpm dev`
2. Send XMTP messages to your agent
3. Test commerce operations (token transfers, balance checks)
4. Verify natural language understanding

## 📚 API Reference

### Agent Framework

#### Core Classes
- **HybridAgent**: Main agent class for message processing
- **Tool**: Base class for creating custom commerce tools
- **XMTPClient**: Client for XMTP message handling

#### Key Methods
- `processMessage()`: Handle incoming XMTP messages
- `executeTool()`: Execute commerce operations
- `sendResponse()`: Send responses back to users
- `getBalance()`: Check wallet balances
- `transfer()`: Execute token transfers

### Built-in Tools

The framework includes built-in tools for:
- **Token Operations**: Transfer, balance checking, approvals
- **Price Feeds**: Get current cryptocurrency prices
- **Address Resolution**: Resolve ENS names and addresses
- **Transaction Monitoring**: Track transaction status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the `/docs` directory
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

---

Built with ❤️ using modern web3 technologies and natural language processing

## 🔐 Authentication

The Hybrid framework uses XMTP for decentralized messaging:

### XMTP Setup

Configure XMTP authentication with environment variables:

**Agent Configuration:**
```env
# XMTP Configuration
WALLET_KEY="0x..."  # Your XMTP wallet private key
XMTP_ENV="dev"  # dev or production
ENCRYPTION_KEY="..."  # For secure data encryption
```

### XMTP Client Usage

The framework automatically handles XMTP client initialization:

```typescript
import { createXMTPClient } from "@hybrd/xmtp"

// Client is automatically created from environment variables
const xmtpClient = createXMTPClient()

// Send messages to users
await xmtpClient.sendMessage(userAddress, "Hello from your agent!")

// Listen for incoming messages
xmtpClient.onMessage(async (message) => {
  // Process message and respond
  const response = await processUserMessage(message.content)
  await xmtpClient.sendMessage(message.senderAddress, response)
})
```

### Security Best Practices

- **Never commit private keys** to version control
- **Use environment variables** for all sensitive configuration
- **Enable encryption** for production deployments
- **Regular key rotation** for enhanced security
