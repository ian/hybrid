# {{projectName}}

A comprehensive crypto-enabled agent that demonstrates the full power of the Hybrid Tools standard library. This agent can interact with blockchains and manage XMTP conversations.

## Features

### 🔗 Blockchain Capabilities
- **Balance Checking**: Get native token balances across multiple chains
- **Transaction Management**: Send transactions and get transaction details  
- **Gas Estimation**: Estimate gas costs and get current gas prices
- **Block Information**: Retrieve blockchain block data
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, Sepolia

### 💬 XMTP Messaging
- **Message Sending**: Send messages to XMTP conversations
- **Reply Functionality**: Reply to specific messages
- **Reactions**: Send emoji reactions to messages
- **Message Retrieval**: Get message details by ID

### 🤖 Smart Filtering
- Responds to crypto-related keywords and mentions
- Processes all reply messages
- Reacts to 👍 emojis for transaction confirmations

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```env
   # Required
   OPENROUTER_API_KEY=your_openrouter_api_key
   XMTP_HOST=https://your-xmtp-service.com
   XMTP_API_KEY=your_xmtp_api_key

   # Optional Blockchain Configuration
   RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your_key
   PRIVATE_KEY=0x... # Only needed for sending transactions
   DEFAULT_CHAIN=mainnet

   # Server
   PORT=8455
   ```

3. **Run the agent:**
   ```bash
   pnpm dev        # Development mode with hot reload
   pnpm start      # Production mode
   ```

## Usage Examples

### Blockchain Operations

**Balance Checking:**
```
User: "What's the ETH balance for 0x123...?"
Agent: "🔍 Checking ETH balance on mainnet...
        ✅ Balance: 2.5 ETH (2,500,000,000,000,000,000 wei)"
```

**Transaction Sending:**
```
User: "Send 0.1 ETH to 0x456... on mainnet"
Agent: "💸 Sending 0.1 ETH to 0x456... on mainnet
        ✅ Transaction sent successfully!
        Hash: 0xabc..."
```

**Gas Information:**
```
User: "What are gas prices on Ethereum?"
Agent: "⛽ Current gas price for mainnet:
        ✅ Gas price: 25.5 gwei"
```

### XMTP Messaging

**Message Sending:**
```
User: "Send a message saying 'Transaction confirmed!'"
Agent: "💬 Message sent successfully!"
```

**Reactions:**
```
User: "React with 👍 to that message"
Agent: "✅ Successfully sent 👍 reaction"
```

## Architecture

### Tools Used
- **getBalance**: Native token balance checking
- **sendTransaction**: Send native tokens (requires private key)
- **getTransaction**: Transaction details lookup
- **getGasPrice**: Current gas price information
- **estimateGas**: Gas cost estimation
- **getBlock**: Blockchain block information
- **sendMessage**: XMTP message sending
- **sendReply**: Reply to specific messages
- **sendReaction**: Send emoji reactions
- **getMessage**: Message retrieval by ID

### Runtime Configuration
The agent configures blockchain access through runtime extensions:
```typescript
createRuntime: (runtime) => ({
  rpcUrl: process.env.RPC_URL,        // Custom RPC endpoint
  privateKey: process.env.PRIVATE_KEY, // For transactions
  defaultChain: "mainnet"              // Default blockchain
})
```

### Message Filtering
Smart filtering responds to:
- Crypto keywords: balance, send, transaction, gas, eth, etc.
- Chain names: ethereum, polygon, arbitrum, optimism, base
- XMTP keywords: message, reply, react
- Direct mentions: @crypto, @bot
- All reply messages
- 👍 emoji reactions

## Supported Chains

| Chain            | ID         | Native Token | RPC Default |
| ---------------- | ---------- | ------------ | ----------- |
| Ethereum Mainnet | `mainnet`  | ETH          | Public RPC  |
| Ethereum Sepolia | `sepolia`  | ETH          | Public RPC  |
| Polygon          | `polygon`  | MATIC        | Public RPC  |
| Arbitrum         | `arbitrum` | ETH          | Public RPC  |
| Optimism         | `optimism` | ETH          | Public RPC  |
| Base             | `base`     | ETH          | Public RPC  |

## Security Notes

- **Private Key**: Only required for sending transactions
- **RPC URLs**: Uses public RPCs by default, configure custom for better reliability
- **Environment Variables**: Never commit sensitive data to version control
- **Testing**: Use Sepolia testnet for development and testing

## Troubleshooting

### Common Issues

**"XMTP service not available"**
- Verify XMTP_HOST and XMTP_API_KEY are set correctly
- Ensure XMTP service is running and accessible

**"Private key not configured"**
- Normal for read-only operations (balance checking, etc.)
- Required only for sending transactions
- Set PRIVATE_KEY environment variable if needed

**RPC connection errors**
- Check RPC_URL is valid and accessible
- Consider using Alchemy, Infura, or other reliable RPC providers
- Default public RPCs may have rate limits

**Gas estimation failures**
- Ensure sufficient balance for transactions
- Verify recipient address is valid
- Check network congestion

## Development

### Project Structure
```
crypto-agent/
├── src/
│   └── agent.ts          # Main agent implementation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── biome.jsonc           # Code formatting rules
└── README.md            # This file
```

### Extending the Agent
You can easily add more tools or modify the behavior:

```typescript
// Add more blockchain tools
import { getBlockTool, estimateGasTool } from "hybrid"

// Add to tools object
tools: {
  // ... existing tools
  getBlock: getBlockTool,
  estimateGas: estimateGasTool
}
```

### Custom Chains
To add support for custom chains, extend the runtime configuration:

```typescript
createRuntime: (runtime) => ({
  rpcUrl: "https://your-custom-rpc.com",
  defaultChain: "mainnet" // Use closest supported chain
})
```

## Related Examples

- **Basic Agent** (`../basic/`): Simple XMTP agent without crypto features
