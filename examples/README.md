# Hybrid Examples

This directory contains comprehensive examples demonstrating how to use the Hybrid framework and its Tools standard library. Each example is a standalone, runnable project.

## 📁 Available Examples

### 🤖 [Basic Agent](./basic/)
**A simple XMTP agent for getting started**

- Responds to @bot mentions and reactions
- Basic conversational AI using OpenRouter/Grok
- Perfect starting point for XMTP agents

```bash
cd basic
pnpm install && pnpm dev
```

### 🔗 [Crypto Agent](./crypto-agent/)
**Reference implementation for crypto-enabled agents**

- Shows how to structure agents with blockchain and XMTP tools
- Demonstrates the available tools and configuration patterns
- Serves as a template for crypto agent development
- Comprehensive README with usage examples and patterns

```bash
cd crypto-agent
pnpm install && pnpm dev
```

## 🚀 Quick Start

1. **Choose an example** based on your needs:
   - New to Hybrid? → Start with `basic/`
   - Want crypto features? → Check `crypto-agent/`

2. **Install and run:**
   ```bash
   cd [example-name]
   pnpm install
   pnpm dev
   ```

3. **Configure environment variables** (see each example's README)

## 🛠️ Tools Standard Library

The Hybrid Tools standard library provides ready-to-use tools for crypto agents:

### Blockchain Tools
- **getBalance**: Native token balance checking
- **sendTransaction**: Send native tokens  
- **getTransaction**: Transaction details lookup
- **getBlock**: Blockchain block information
- **getGasPrice**: Current gas prices
- **estimateGas**: Gas cost estimation

### XMTP Tools
- **sendMessage**: Send messages to conversations
- **sendReply**: Reply to specific messages
- **sendReaction**: Send emoji reactions
- **getMessage**: Message retrieval by ID

### Supported Chains
- Ethereum Mainnet & Sepolia
- Polygon, Arbitrum, Optimism, Base

### Usage Patterns

**Individual Tools:**
```typescript
import { getBalanceTool, sendMessageTool } from "hybrid/tools"
```

**Tool Collections:**
```typescript
import { blockchainTools, xmtpTools } from "hybrid/tools"
```

**All Tools:**
```typescript
import { allTools } from "hybrid/tools"
const tools = await allTools()
```

## 📖 Learning Path

### 1. Start with Basic Agent
- Learn core Hybrid concepts
- Understand XMTP integration
- Set up your development environment

### 2. Explore Crypto Agent
- See how to structure crypto-enabled agents
- Understand runtime configuration and tool usage
- Learn best practices from comprehensive documentation
- Explore real-world scenarios and patterns

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- OpenRouter API key
- XMTP service access

### Environment Variables
```env
# Required for all examples
OPENROUTER_API_KEY=your_openrouter_key
XMTP_HOST=https://your-xmtp-service.com
XMTP_API_KEY=your_xmtp_key

# Optional for blockchain features
RPC_URL=https://your-rpc-provider.com
PRIVATE_KEY=0x... # Only for sending transactions
```

### Common Commands
```bash
# Install dependencies
pnpm install

# Development mode (hot reload)
pnpm dev

# Production mode
pnpm start

# Build TypeScript
pnpm build

# Type checking
pnpm typecheck
```

## 🎯 Use Cases

### Portfolio Tracker
Combine `getBalance` across multiple chains with `sendMessage` for alerts.

### Transaction Bot
Use `sendTransaction` with `getGasPrice` for smart transaction execution.

### DeFi Assistant
Integrate balance checking, gas estimation, and messaging for DeFi guidance.

### Cross-Chain Helper
Use multi-chain balance checking with messaging for bridge assistance.

## 🔒 Security Notes

- **Never commit private keys** to version control
- **Use environment variables** for sensitive data
- **Test on testnets first** (Sepolia) before mainnet
- **Private keys are optional** - only needed for sending transactions
- **Use reliable RPC providers** for production

## 📚 Additional Resources

- **Main README**: `../README.md` - Framework overview
- **Core Package**: `../packages/core/` - Framework source
- **Tools Source**: `../packages/core/src/tools/` - Tools implementation

## 🤝 Contributing

Found an issue or want to add an example?

1. Check existing examples for patterns
2. Create a new directory under `examples/`
3. Follow the established structure (package.json, README.md, src/)
4. Add comprehensive documentation
5. Test thoroughly before submitting

## 📄 License

MIT - See the main project LICENSE file.
