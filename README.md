# Hybrid - Agent Framework for XMTP

An open-source agent framework for building conversational AI agents on XMTP. Hybrid makes it easy for developers to create intelligent agents that can understand natural language, process messages, and respond through XMTP's decentralized messaging protocol.

## 🏗️ Architecture

This project uses a monorepo structure with multiple packages and supporting directories:

```
hybrid/
├── config/           # Shared configuration files (Biome, TypeScript)
├── examples/
│   └── basic/        # Basic agent example implementation
├── packages/
│   ├── cli/          # Command-line interface for agent management
│   ├── core/         # Main agent framework library (published as "hybrid")
│   ├── utils/        # Utility functions and helpers
│   └── xmtp/         # XMTP client and messaging utilities
├── scripts/          # Build and maintenance scripts
├── templates/        # Project templates for agent creation
└── test-project/     # Test project for development
```

## 📝 Core Example

Here's a basic agent implementation using Hybrid:

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, type MessageListenerConfig, type Reaction } from "hybrid"

export const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
	name: "Basic Agent",
	model: openrouter("x-ai/grok-4"),
	instructions:
		"You are a XMTP agent that responds to messages and reactions. Try and be as conversational as possible."
})

// We don't want the agent to respond to every message, this shows how to filter for only replies.
const replyOnlyFilter: MessageListenerConfig["filter"] = async ({ message }) => {
	const isReply = message.contentType.typeId === "reply"

	if (isReply) {
		return true
	}

	return false
}

agent.listen({
	port: process.env.PORT || "8454",
	filter: replyOnlyFilter
})
```

This example shows how Hybrid handles message filtering, AI integration, and XMTP listening - all in just a few lines of code.

## 📦 Installation

Getting started with Hybrid is simple:

### 1. Install the package

```bash
pnpm install hybrid
```  

### 2. Initialize your project

```bash
npx create-hybrid my-agent
```

This creates all the necessary files and configuration for your agent.

### 3. Generate XMTP keys

```bash
npx hybrid gen:keys
```

This generates secure wallet and encryption keys for your XMTP agent.

### 4. Start developing

```bash
npx hybrid dev
```

Your agent will start listening for XMTP messages and you're ready to build!

## 🖥️ CLI Commands

The Hybrid CLI provides several commands to manage your agent development workflow:

```bash
# Initialize a new agent project
npx create-hybrid my-agent

# Generate XMTP wallet and encryption keys
npx hybrid gen:keys

# Start development server
npx hybrid dev

# Build your agent
npx hybrid build

# Register your agent with XMTP
npx hybrid register

# Revoke specific XMTP installations
npx hybrid revoke <installation-id>

# Revoke all XMTP installations
npx hybrid revoke:all

# Clean build artifacts
npx hybrid clean
```

## 🔧 Developing Locally

If you want to work with the source code or contribute to Hybrid:

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
XMTP_WALLET_KEY="0x..."  # Private key for XMTP agent
XMTP_ENCRYPTION_KEY="..."  # Database encryption key
XMTP_ENV="dev"  # dev, production
```

### 3. Start Development Server

```bash
# Start the agent
pnpm dev
```

This starts the agent and begins listening for XMTP messages on the configured port (default: 8454).

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm build                  # Build all packages
pnpm build:watch            # Build all packages in watch mode
pnpm test                   # Run tests across all packages
pnpm typecheck              # Type checking across all packages

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix               # Fix linting issues
pnpm format                 # Format code (handled by Biome)

# Maintenance
pnpm clean                  # Clean build artifacts
pnpm nuke                   # Remove all node_modules (nuclear option)
pnpm bump                   # Bump version (patch by default)
pnpm bump:patch             # Bump patch version
pnpm bump:minor             # Bump minor version
pnpm bump:major             # Bump major version

# Release
pnpm release                # Build and publish all packages
```

### Project Structure

Hybrid is designed as a framework for developers to build XMTP agents:

#### Basic Example (`examples/basic`)
- **Message Processing**: Handle incoming XMTP messages with custom filters
- **AI Integration**: Connect any AI model for natural language understanding
- **Agent Configuration**: Simple setup with instructions and behavior
- **XMTP Listening**: Built-in server to listen for messages on any port

#### Templates (`templates/`)
- **agent/**: Project template for creating new XMTP agents
  - Pre-configured TypeScript setup with Vitest
  - Example agent implementation and tests
  - Ready-to-use project structure

#### Core Packages
- **core/**: Main agent framework library (published as "hybrid")
  - Agent runtime and plugin system
  - Type-safe message handling
  - Flexible filtering and processing
  - Integration with AI providers and XMTP
- **cli/**: Command-line interface for agent management
  - Project initialization and setup
  - XMTP key generation and management
  - Development server and build tools
- **utils/**: Common utilities and helpers (@hybrd/utils)
  - Array, string, and object utilities
  - Date and UUID helpers
  - Markdown processing utilities
- **xmtp/**: XMTP client and messaging utilities (@hybrd/xmtp)
  - Client initialization and management
  - Message sending and receiving
  - Address resolution (ENS, BaseName, XMTP)
  - Content type handling and encryption

### Key Technologies

- **Core**: Node.js 22+, TypeScript, pnpm workspace
- **Build**: Turbo for monorepo orchestration and caching
- **Messaging**: XMTP Protocol for decentralized messaging
- **AI**: OpenRouter API and Vercel AI SDK for natural language processing
- **Web3**: Viem for Ethereum interactions, Coinbase AgentKit for DeFi
- **Development**: Biome for linting and formatting
- **Testing**: Vitest for fast unit and integration tests

## 🔧 Configuration

### Agent Configuration

Configure your agent behavior with simple, type-safe options:

```typescript
const agent = new Agent({
  name: "My Custom Agent",
  model: openrouter("x-ai/grok-4"), // Any AI model
  instructions: "You are a helpful XMTP agent. Be conversational and friendly."
})
```

### Message Filtering

Control which messages your agent responds to:

```typescript
const filter: MessageListenerConfig["filter"] = async ({ message }) => {
  // Custom logic for filtering messages
  // Return true to process, false to ignore
  const content = message.content?.toString()?.toLowerCase()
  return content?.includes("@myagent") || content?.includes("help")
}
```

### Environment Variables

Key environment variables for agent operation:

```env
# Required
OPENROUTER_API_KEY="your_openai_api_key"  # For AI integration
XMTP_WALLET_KEY="0x..."                        # XMTP wallet private key
XMTP_ENV="dev"                           # dev or production

# Optional
PORT="8454"                              # Port for the agent server
XMTP_ENCRYPTION_KEY="..."                     # For secure data encryption
```

## 🚀 Deployment

Deploy your Hybrid agent anywhere Node.js runs:

### Build and Deploy

1. **Build the project**:
```bash
pnpm build
```

2. **Deploy to any Node.js hosting provider**:
   - Vercel
   - Railway
   - Render
   - Heroku
   - DigitalOcean
   - AWS Lambda
   - Google Cloud Functions

### Environment Variables

Make sure these environment variables are configured in your deployment:
- `OPENROUTER_API_KEY` - Your AI API key
- `XMTP_WALLET_KEY` - XMTP wallet private key
- `XMTP_ENV` - dev or production
- `PORT` - Port for the agent server (optional)

## 🧪 Testing

### Run Tests

```bash
pnpm test
```

### Manual Testing

1. Start your agent: `pnpm dev`
2. Send XMTP messages to test your agent's responses
3. Verify your custom filters and AI integration work as expected

## 📚 API Reference

### Core Classes

- **Agent**: Main agent class for creating and configuring XMTP agents
- **MessageListenerConfig**: Configuration for message filtering and processing
- **Reaction**: Type for handling XMTP reactions

### Key Methods

- `agent.listen()`: Start listening for XMTP messages with custom filters
- `filter()`: Define which messages your agent should respond to
- `processMessage()`: Handle incoming XMTP messages
- `sendResponse()`: Send responses back to users

### Message Types

Hybrid supports all XMTP message types:
- **Text Messages**: Standard text content
- **Reactions**: 👍, ❤️, and custom reactions
- **Replies**: Threaded conversations
- **Custom Content**: Any XMTP-supported content type

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
XMTP_WALLET_KEY="0x..."  # Your XMTP wallet private key
XMTP_ENV="dev"  # dev or production
XMTP_ENCRYPTION_KEY="..."  # For secure data encryption
```

### XMTP Client Usage

The framework automatically handles XMTP client initialization:

```typescript
import { Client } from "@xmtp/node-sdk"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

// Create XMTP client with wallet
const account = privateKeyToAccount(process.env.XMTP_WALLET_KEY as `0x${string}`)
const wallet = createWalletClient({
  account,
  transport: http()
})

const xmtpClient = await Client.create(wallet, {
  env: process.env.XMTP_ENV as "dev" | "production" || "dev"
})

// Send messages to users
await xmtpClient.sendMessage(userAddress, "Hello from your agent!")

// Listen for incoming messages
for await (const message of await xmtpClient.conversations.streamAllMessages()) {
  // Process message and respond
  const response = await processUserMessage(message.content)
  await message.conversation.send(response)
}
```

### Security Best Practices

- **Never commit private keys** to version control
- **Use environment variables** for all sensitive configuration
- **Enable encryption** for production deployments
- **Regular key rotation** for enhanced security
