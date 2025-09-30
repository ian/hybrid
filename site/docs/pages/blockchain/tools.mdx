---
title: Blockchain Tools
description: Built-in blockchain tools for crypto operations and DeFi interactions
---

# Blockchain Tools

Learn how to use Hybrid's built-in blockchain tools for crypto operations, DeFi interactions, and multi-chain support.

## Installing and Importing

### Installation

Blockchain tools are included with the core Hybrid framework:

```bash
npm install @hybrd/core
```

### Importing Blockchain Tools

```typescript
// Import from core (recommended)
import { blockchainTools } from "@hybrd/core/tools"

// Import specific tools
import { 
  getBalance, 
  sendTransaction, 
  getTransaction,
  getBlock,
  getGasPrice,
  estimateGas 
} from "@hybrd/core/tools"

// Add to agent
import { Agent } from "@hybrd/core"

const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions...",
  tools: [
    blockchainTools(), // Adds all blockchain tools
  ]
})
```

## Core Blockchain Tools

### `getBalance` - Get Native Token Balance

Check native token balances for any address across supported chains.

#### Basic Usage

```typescript
// Agent can use this tool automatically
const balance = await agent.call("getBalance", {
  address: "0x1234567890abcdef1234567890abcdef12345678"
})

console.log(`ETH Balance: ${balance.formatted} ETH`)
```

#### Multi-Chain Balance Checking

```typescript
// Check balance on specific chain
const polygonBalance = await agent.call("getBalance", {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  chain: "polygon"
})

// Check balances across multiple chains
const chains = ["ethereum", "polygon", "arbitrum", "optimism", "base"]
const balances = await Promise.all(
  chains.map(chain => 
    agent.call("getBalance", { address: userAddress, chain })
  )
)

const totalValue = balances.reduce((sum, balance) => 
  sum + (balance.usdValue || 0), 0
)
```

#### Balance Monitoring

```typescript
// Monitor balance changes
class BalanceMonitor {
  private lastBalances = new Map<string, number>()
  
  async checkBalanceChanges(address: string) {
    const currentBalance = await agent.call("getBalance", { address })
    const lastBalance = this.lastBalances.get(address) || 0
    
    if (currentBalance.value !== lastBalance) {
      const change = currentBalance.value - lastBalance
      const changeFormatted = change > 0 ? `+${change}` : `${change}`
      
      await agent.call("sendMessage", {
        to: address,
        content: `💰 Balance Update: ${changeFormatted} ETH\nNew Balance: ${currentBalance.formatted} ETH`
      })
      
      this.lastBalances.set(address, currentBalance.value)
    }
  }
}
```

### `sendTransaction` - Send Native Tokens

Send native tokens (ETH, MATIC, etc.) to other addresses.

#### Basic Transaction

```typescript
// Send ETH to another address
const txResult = await agent.call("sendTransaction", {
  to: "0x1234567890abcdef1234567890abcdef12345678",
  amount: "0.1", // 0.1 ETH
  chain: "ethereum"
})

console.log(`Transaction sent: ${txResult.hash}`)
```

#### Transaction with Gas Configuration

```typescript
// Send with custom gas settings
const txResult = await agent.call("sendTransaction", {
  to: recipientAddress,
  amount: "0.05",
  chain: "ethereum",
  gasLimit: 21000,
  gasPrice: "20000000000", // 20 gwei
  priority: "fast" // or "standard", "slow"
})
```

#### Batch Transactions

```typescript
// Send to multiple recipients
const recipients = [
  { address: "0x1111...", amount: "0.1" },
  { address: "0x2222...", amount: "0.2" },
  { address: "0x3333...", amount: "0.15" }
]

const transactions = await Promise.all(
  recipients.map(({ address, amount }) =>
    agent.call("sendTransaction", {
      to: address,
      amount,
      chain: "ethereum"
    })
  )
)

console.log(`Sent ${transactions.length} transactions`)
```

### `getTransaction` - Get Transaction Details

Retrieve detailed information about transactions by hash.

#### Basic Transaction Lookup

```typescript
// Get transaction details
const txDetails = await agent.call("getTransaction", {
  hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  chain: "ethereum"
})

console.log(`Status: ${txDetails.status}`)
console.log(`Gas Used: ${txDetails.gasUsed}`)
console.log(`Block: ${txDetails.blockNumber}`)
```

#### Transaction Analysis

```typescript
// Analyze transaction for insights
async function analyzeTransaction(txHash: string) {
  const tx = await agent.call("getTransaction", { hash: txHash })
  
  const analysis = {
    efficiency: calculateGasEfficiency(tx),
    timing: analyzeTransactionTiming(tx),
    cost: calculateTransactionCost(tx),
    success: tx.status === "success"
  }
  
  return {
    transaction: tx,
    analysis,
    recommendations: generateRecommendations(analysis)
  }
}

function calculateGasEfficiency(tx: any) {
  const efficiency = tx.gasUsed / tx.gasLimit
  return {
    ratio: efficiency,
    rating: efficiency < 0.7 ? "efficient" : efficiency < 0.9 ? "moderate" : "inefficient"
  }
}
```

### `getBlock` - Get Blockchain Block Information

Retrieve information about specific blocks.

#### Block Information

```typescript
// Get latest block
const latestBlock = await agent.call("getBlock", {
  blockNumber: "latest",
  chain: "ethereum"
})

// Get specific block
const block = await agent.call("getBlock", {
  blockNumber: 18500000,
  chain: "ethereum"
})

console.log(`Block ${block.number} has ${block.transactions.length} transactions`)
```

#### Block Analysis

```typescript
// Analyze block for network insights
async function analyzeNetworkActivity() {
  const latestBlock = await agent.call("getBlock", { 
    blockNumber: "latest",
    chain: "ethereum" 
  })
  
  const previousBlock = await agent.call("getBlock", { 
    blockNumber: latestBlock.number - 1,
    chain: "ethereum" 
  })
  
  const blockTime = latestBlock.timestamp - previousBlock.timestamp
  const gasUtilization = latestBlock.gasUsed / latestBlock.gasLimit
  
  return {
    blockTime,
    gasUtilization,
    transactionCount: latestBlock.transactions.length,
    networkCongestion: gasUtilization > 0.9 ? "high" : gasUtilization > 0.7 ? "medium" : "low"
  }
}
```

### `getGasPrice` - Get Current Gas Prices

Get current gas prices for optimal transaction timing.

#### Current Gas Prices

```typescript
// Get current gas prices
const gasPrices = await agent.call("getGasPrice", {
  chain: "ethereum"
})

console.log(`Standard: ${gasPrices.standard} gwei`)
console.log(`Fast: ${gasPrices.fast} gwei`)
console.log(`Instant: ${gasPrices.instant} gwei`)
```

#### Gas Price Recommendations

```typescript
// Get gas recommendations based on urgency
async function getGasRecommendation(urgency: "low" | "medium" | "high") {
  const gasPrices = await agent.call("getGasPrice", { chain: "ethereum" })
  
  switch (urgency) {
    case "low":
      return {
        gasPrice: gasPrices.slow,
        estimatedTime: "10-30 minutes",
        cost: "lowest"
      }
    case "medium":
      return {
        gasPrice: gasPrices.standard,
        estimatedTime: "3-5 minutes",
        cost: "moderate"
      }
    case "high":
      return {
        gasPrice: gasPrices.fast,
        estimatedTime: "< 2 minutes",
        cost: "higher"
      }
  }
}
```

### `estimateGas` - Estimate Gas Costs

Estimate gas costs for transactions before execution.

#### Basic Gas Estimation

```typescript
// Estimate gas for a transaction
const gasEstimate = await agent.call("estimateGas", {
  to: "0x1234567890abcdef1234567890abcdef12345678",
  amount: "0.1",
  chain: "ethereum"
})

console.log(`Estimated gas: ${gasEstimate.gasLimit}`)
console.log(`Estimated cost: ${gasEstimate.estimatedCost} ETH`)
```

#### Smart Contract Interaction Estimation

```typescript
// Estimate gas for smart contract calls
const contractEstimate = await agent.call("estimateGas", {
  to: "0xA0b86a33E6441e6e80A7181a02d6b8c4c7e3c0d1", // Contract address
  data: "0xa9059cbb000000000000000000000000...", // Encoded function call
  chain: "ethereum"
})
```

## Tool Configuration and Runtime Context

### Basic Configuration

```typescript
// Configure blockchain tools
const agent = new Agent({
  tools: [
    blockchainTools({
      // Default chain
      defaultChain: "ethereum",
      
      // Supported chains
      chains: ["ethereum", "polygon", "arbitrum", "optimism", "base"],
      
      // Gas settings
      gas: {
        maxGasPrice: "50000000000", // 50 gwei max
        gasMultiplier: 1.1, // 10% buffer
        priorityFee: "2000000000" // 2 gwei priority fee
      },
      
      // RPC endpoints (optional - uses defaults)
      rpcUrls: {
        ethereum: process.env.ETHEREUM_RPC_URL,
        polygon: process.env.POLYGON_RPC_URL
      }
    })
  ]
})
```

### Advanced Configuration

```typescript
// Advanced blockchain tool configuration
const blockchainConfig = {
  // Network settings
  networks: {
    ethereum: {
      chainId: 1,
      rpcUrl: process.env.ETHEREUM_RPC_URL,
      gasSettings: {
        maxGasPrice: "100000000000", // 100 gwei
        priorityFee: "2000000000" // 2 gwei
      }
    },
    polygon: {
      chainId: 137,
      rpcUrl: process.env.POLYGON_RPC_URL,
      gasSettings: {
        maxGasPrice: "500000000000", // 500 gwei (MATIC)
        priorityFee: "30000000000" // 30 gwei
      }
    }
  },
  
  // Security settings
  security: {
    maxTransactionValue: "10", // 10 ETH max per transaction
    requireConfirmation: true,
    allowedContracts: [
      "0xA0b86a33E6441e6e80A7181a02d6b8c4c7e3c0d1" // Uniswap V3
    ]
  },
  
  // Monitoring
  monitoring: {
    trackTransactions: true,
    alertOnFailure: true,
    logGasUsage: true
  }
}

const agent = new Agent({
  tools: [blockchainTools(blockchainConfig)]
})
```

### Runtime Context Integration

```typescript
// Use runtime context for dynamic configuration
class ContextAwareBlockchainTools {
  static create(baseConfig: any) {
    return blockchainTools({
      ...baseConfig,
      
      // Dynamic gas pricing based on context
      getGasSettings: (context: any) => {
        const urgency = context.urgency || "medium"
        const userTier = context.user?.tier || "standard"
        
        const gasMultipliers = {
          low: 1.0,
          medium: 1.1,
          high: 1.3,
          urgent: 1.5
        }
        
        const maxGasPrices = {
          standard: "50000000000", // 50 gwei
          premium: "100000000000", // 100 gwei
          enterprise: "200000000000" // 200 gwei
        }
        
        return {
          gasMultiplier: gasMultipliers[urgency],
          maxGasPrice: maxGasPrices[userTier]
        }
      },
      
      // Dynamic chain selection
      selectChain: (context: any) => {
        const preferredChain = context.user?.preferredChain
        const transactionSize = context.transaction?.value || 0
        
        // Use L2 for small transactions
        if (transactionSize < 0.01) {
          return preferredChain || "polygon"
        }
        
        // Use mainnet for large transactions
        return "ethereum"
      }
    })
  }
}
```

## Supported Chains

Hybrid supports multiple blockchain networks for maximum flexibility.

### Ethereum Mainnet

```typescript
// Ethereum configuration
const ethereumConfig = {
  chain: "ethereum",
  chainId: 1,
  nativeCurrency: "ETH",
  blockExplorer: "https://etherscan.io",
  features: [
    "full-defi-ecosystem",
    "highest-liquidity",
    "most-secure",
    "highest-gas-costs"
  ]
}

// Ethereum-specific operations
const ethBalance = await agent.call("getBalance", {
  address: userAddress,
  chain: "ethereum"
})
```

### Polygon

```typescript
// Polygon configuration
const polygonConfig = {
  chain: "polygon",
  chainId: 137,
  nativeCurrency: "MATIC",
  blockExplorer: "https://polygonscan.com",
  features: [
    "low-gas-costs",
    "fast-transactions",
    "ethereum-compatible",
    "growing-ecosystem"
  ]
}

// Polygon operations
const maticBalance = await agent.call("getBalance", {
  address: userAddress,
  chain: "polygon"
})
```

### Arbitrum

```typescript
// Arbitrum configuration
const arbitrumConfig = {
  chain: "arbitrum",
  chainId: 42161,
  nativeCurrency: "ETH",
  blockExplorer: "https://arbiscan.io",
  features: [
    "ethereum-l2",
    "low-gas-costs",
    "fast-finality",
    "optimistic-rollup"
  ]
}
```

### Optimism

```typescript
// Optimism configuration
const optimismConfig = {
  chain: "optimism",
  chainId: 10,
  nativeCurrency: "ETH",
  blockExplorer: "https://optimistic.etherscan.io",
  features: [
    "ethereum-l2",
    "low-gas-costs",
    "fast-transactions",
    "optimistic-rollup"
  ]
}
```

### Base

```typescript
// Base configuration
const baseConfig = {
  chain: "base",
  chainId: 8453,
  nativeCurrency: "ETH",
  blockExplorer: "https://basescan.org",
  features: [
    "coinbase-l2",
    "low-gas-costs",
    "fast-transactions",
    "growing-ecosystem"
  ]
}
```

### Sepolia Testnet

```typescript
// Sepolia testnet for development
const sepoliaConfig = {
  chain: "sepolia",
  chainId: 11155111,
  nativeCurrency: "ETH",
  blockExplorer: "https://sepolia.etherscan.io",
  features: [
    "ethereum-testnet",
    "free-test-eth",
    "development-friendly",
    "latest-ethereum-features"
  ]
}

// Use for testing
const testBalance = await agent.call("getBalance", {
  address: testAddress,
  chain: "sepolia"
})
```

### Multi-Chain Operations

```typescript
// Cross-chain balance aggregation
async function getMultiChainBalance(address: string) {
  const chains = ["ethereum", "polygon", "arbitrum", "optimism", "base"]
  
  const balances = await Promise.all(
    chains.map(async (chain) => {
      try {
        const balance = await agent.call("getBalance", { address, chain })
        return { chain, ...balance }
      } catch (error) {
        console.warn(`Failed to get balance on ${chain}:`, error)
        return { chain, value: 0, formatted: "0", error: error.message }
      }
    })
  )
  
  const totalValue = balances
    .filter(b => !b.error)
    .reduce((sum, balance) => sum + (balance.usdValue || 0), 0)
  
  return {
    balances,
    totalValue,
    summary: `Total portfolio value: $${totalValue.toLocaleString()}`
  }
}

// Cross-chain transaction routing
async function findOptimalChain(operation: string, amount: number) {
  const gasPrices = await Promise.all([
    agent.call("getGasPrice", { chain: "ethereum" }),
    agent.call("getGasPrice", { chain: "polygon" }),
    agent.call("getGasPrice", { chain: "arbitrum" })
  ])
  
  // Calculate costs for each chain
  const costs = gasPrices.map((gas, index) => {
    const chains = ["ethereum", "polygon", "arbitrum"]
    const gasLimit = operation === "transfer" ? 21000 : 100000
    
    return {
      chain: chains[index],
      gasCost: gas.standard * gasLimit,
      totalCost: (gas.standard * gasLimit) + amount
    }
  })
  
  // Return cheapest option
  return costs.reduce((min, current) => 
    current.totalCost < min.totalCost ? current : min
  )
}
```

## Error Handling and Best Practices

### Transaction Error Handling

```typescript
// Robust transaction handling
async function sendTransactionSafely(params: any) {
  try {
    // Pre-flight checks
    await validateTransaction(params)
    
    // Estimate gas first
    const gasEstimate = await agent.call("estimateGas", params)
    
    // Check if user has sufficient balance
    const balance = await agent.call("getBalance", {
      address: params.from,
      chain: params.chain
    })
    
    const totalCost = parseFloat(params.amount) + gasEstimate.estimatedCost
    if (balance.value < totalCost) {
      throw new Error(`Insufficient balance. Need ${totalCost}, have ${balance.value}`)
    }
    
    // Send transaction
    const result = await agent.call("sendTransaction", {
      ...params,
      gasLimit: gasEstimate.gasLimit,
      gasPrice: gasEstimate.gasPrice
    })
    
    // Monitor transaction
    await monitorTransaction(result.hash, params.chain)
    
    return result
  } catch (error) {
    console.error("Transaction failed:", error)
    await handleTransactionError(error, params)
    throw error
  }
}

async function validateTransaction(params: any) {
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(params.to)) {
    throw new Error("Invalid recipient address")
  }
  
  // Validate amount
  if (parseFloat(params.amount) <= 0) {
    throw new Error("Amount must be positive")
  }
  
  // Check for common mistakes
  if (params.to.toLowerCase() === params.from?.toLowerCase()) {
    throw new Error("Cannot send to same address")
  }
}

async function monitorTransaction(hash: string, chain: string) {
  const maxWaitTime = 300000 // 5 minutes
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const tx = await agent.call("getTransaction", { hash, chain })
      
      if (tx.status === "success") {
        console.log(`Transaction ${hash} confirmed`)
        return tx
      } else if (tx.status === "failed") {
        throw new Error(`Transaction ${hash} failed`)
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds
    } catch (error) {
      // Transaction might not be mined yet
      await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds
    }
  }
  
  throw new Error(`Transaction ${hash} not confirmed within timeout`)
}
```

### Gas Optimization

```typescript
// Gas optimization strategies
class GasOptimizer {
  static async optimizeTransaction(params: any) {
    // Get current gas prices
    const gasPrices = await agent.call("getGasPrice", { chain: params.chain })
    
    // Estimate gas for transaction
    const gasEstimate = await agent.call("estimateGas", params)
    
    // Choose optimal gas price based on urgency
    const urgency = params.urgency || "medium"
    const gasPrice = this.selectGasPrice(gasPrices, urgency)
    
    // Add buffer to gas limit
    const gasLimit = Math.ceil(gasEstimate.gasLimit * 1.1)
    
    return {
      ...params,
      gasPrice,
      gasLimit,
      estimatedCost: (gasPrice * gasLimit) / 1e18 // Convert to ETH
    }
  }
  
  static selectGasPrice(gasPrices: any, urgency: string) {
    switch (urgency) {
      case "low":
        return gasPrices.slow || gasPrices.standard
      case "medium":
        return gasPrices.standard
      case "high":
        return gasPrices.fast
      case "urgent":
        return gasPrices.instant || gasPrices.fast
      default:
        return gasPrices.standard
    }
  }
  
  static async batchOptimize(transactions: any[]) {
    // Optimize multiple transactions together
    const optimized = await Promise.all(
      transactions.map(tx => this.optimizeTransaction(tx))
    )
    
    // Calculate total cost
    const totalCost = optimized.reduce(
      (sum, tx) => sum + tx.estimatedCost, 0
    )
    
    return {
      transactions: optimized,
      totalCost,
      savings: this.calculateSavings(transactions, optimized)
    }
  }
}
```

## Next Steps

- Learn about [Ponder Integration](/blockchain/ponder) for blockchain event handling
- Explore [Foundry Integration](/blockchain/foundry) for smart contract development
- Check out [Multi-chain Support](/blockchain/multi-chain) for advanced cross-chain operations
- See [XMTP Tools](/xmtp/tools) for messaging capabilities
