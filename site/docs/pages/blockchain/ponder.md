---
title: Ponder Integration
description: Blockchain event indexing and forwarding to agents with Ponder
---

# Ponder Integration

Learn how to use Ponder for blockchain event indexing and forwarding events to your Hybrid agents for real-time blockchain monitoring.

## Installing and Importing

### Installation

Install the Ponder integration package:

```bash
npm install @hybrd/ponder
```

### Importing Ponder Tools

```typescript
// Import Ponder integration
import { ponderPlugin } from "@hybrd/ponder"
import { Agent } from "@hybrd/core"

// Add to agent
const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions...",
  plugins: [
    ponderPlugin({
      // Ponder configuration
    })
  ]
})
```

## Ponder Plugin for Blockchain Event Handling

Ponder is a blockchain indexing framework that allows you to efficiently index and query blockchain events.

### Basic Ponder Setup

```typescript
// ponder.config.ts
import { createConfig } from "@ponder/core"
import { http } from "viem"

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
    polygon: {
      chainId: 137,
      transport: http(process.env.PONDER_RPC_URL_137),
    },
  },
  contracts: {
    // ERC-20 Transfer events
    ERC20: {
      network: "mainnet",
      address: "0xA0b86a33E6441e6e80A7181a02d6b8c4c7e3c0d1", // USDC
      abi: [
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" }
          ],
          name: "Transfer",
          type: "event"
        }
      ],
      startBlock: 18000000,
    },
    
    // Uniswap V3 Swap events
    UniswapV3Pool: {
      network: "mainnet",
      address: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8", // USDC/ETH pool
      abi: [
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: "sender", type: "address" },
            { indexed: true, name: "recipient", type: "address" },
            { indexed: false, name: "amount0", type: "int256" },
            { indexed: false, name: "amount1", type: "int256" },
            { indexed: false, name: "sqrtPriceX96", type: "uint160" },
            { indexed: false, name: "liquidity", type: "uint128" },
            { indexed: false, name: "tick", type: "int24" }
          ],
          name: "Swap",
          type: "event"
        }
      ],
      startBlock: 18000000,
    }
  },
})
```

### Event Indexing and Processing

```typescript
// src/index.ts - Ponder event handlers
import { ponder } from "@/generated"

// Handle ERC-20 Transfer events
ponder.on("ERC20:Transfer", async ({ event, context }) => {
  const { Transfer } = context.db
  
  // Index the transfer
  await Transfer.create({
    id: event.log.id,
    data: {
      from: event.args.from,
      to: event.args.to,
      value: event.args.value,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
    },
  })
  
  // Forward to Hybrid agent if significant transfer
  if (event.args.value > 1000000n) { // > $1000 USDC
    await forwardToAgent("large-transfer", {
      type: "ERC20_TRANSFER",
      from: event.args.from,
      to: event.args.to,
      value: event.args.value.toString(),
      token: "USDC",
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    })
  }
})

// Handle Uniswap V3 Swap events
ponder.on("UniswapV3Pool:Swap", async ({ event, context }) => {
  const { Swap } = context.db
  
  // Calculate swap details
  const amount0 = event.args.amount0
  const amount1 = event.args.amount1
  const isETHtoUSDC = amount0 < 0n
  
  // Index the swap
  await Swap.create({
    id: event.log.id,
    data: {
      sender: event.args.sender,
      recipient: event.args.recipient,
      amount0: amount0,
      amount1: amount1,
      sqrtPriceX96: event.args.sqrtPriceX96,
      liquidity: event.args.liquidity,
      tick: event.args.tick,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
      isETHtoUSDC,
    },
  })
  
  // Forward significant swaps to agent
  const swapValueUSD = calculateSwapValue(amount0, amount1)
  if (swapValueUSD > 10000) { // > $10k swap
    await forwardToAgent("large-swap", {
      type: "UNISWAP_SWAP",
      sender: event.args.sender,
      recipient: event.args.recipient,
      swapDirection: isETHtoUSDC ? "ETH->USDC" : "USDC->ETH",
      valueUSD: swapValueUSD,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    })
  }
})

// Forward events to Hybrid agent
async function forwardToAgent(eventType: string, eventData: any) {
  try {
    // Send to agent via webhook or message queue
    await fetch("http://localhost:3000/webhook/blockchain-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        eventData,
        timestamp: Date.now(),
      }),
    })
  } catch (error) {
    console.error("Failed to forward event to agent:", error)
  }
}
```

## Event Indexing and Forwarding to Agents

### Agent Event Handler

```typescript
// Agent webhook handler for Ponder events
import { Agent } from "@hybrd/core"
import express from "express"

const app = express()
app.use(express.json())

const agent = new Agent({
  model: yourModel,
  instructions: `You are a DeFi monitoring agent. You receive real-time blockchain events and provide insights and alerts.`,
})

// Handle blockchain events from Ponder
app.post("/webhook/blockchain-event", async (req, res) => {
  const { eventType, eventData } = req.body
  
  try {
    await handleBlockchainEvent(eventType, eventData)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error handling blockchain event:", error)
    res.status(500).json({ error: error.message })
  }
})

async function handleBlockchainEvent(eventType: string, eventData: any) {
  switch (eventType) {
    case "large-transfer":
      await handleLargeTransfer(eventData)
      break
      
    case "large-swap":
      await handleLargeSwap(eventData)
      break
      
    case "liquidation":
      await handleLiquidation(eventData)
      break
      
    default:
      console.log(`Unknown event type: ${eventType}`)
  }
}

async function handleLargeTransfer(eventData: any) {
  const { from, to, value, token, transactionHash } = eventData
  
  // Format the transfer amount
  const amount = formatTokenAmount(value, token)
  
  // Create alert message
  const message = `🚨 Large Transfer Alert!\n\n` +
    `💰 Amount: ${amount} ${token}\n` +
    `📤 From: ${from}\n` +
    `📥 To: ${to}\n` +
    `🔗 Tx: ${transactionHash}\n\n` +
    `This transfer is above the $1,000 threshold.`
  
  // Send to monitoring channel
  await agent.call("sendMessage", {
    to: process.env.MONITORING_CHANNEL,
    content: message
  })
  
  // Check if addresses are known entities
  const fromEntity = await identifyEntity(from)
  const toEntity = await identifyEntity(to)
  
  if (fromEntity || toEntity) {
    const entityMessage = `📊 Entity Analysis:\n` +
      `From: ${fromEntity || "Unknown"}\n` +
      `To: ${toEntity || "Unknown"}`
    
    await agent.call("sendMessage", {
      to: process.env.MONITORING_CHANNEL,
      content: entityMessage
    })
  }
}

async function handleLargeSwap(eventData: any) {
  const { sender, swapDirection, valueUSD, transactionHash } = eventData
  
  const message = `💱 Large Swap Alert!\n\n` +
    `💰 Value: $${valueUSD.toLocaleString()}\n` +
    `🔄 Direction: ${swapDirection}\n` +
    `👤 Trader: ${sender}\n` +
    `🔗 Tx: ${transactionHash}\n\n` +
    `This swap is above the $10,000 threshold.`
  
  await agent.call("sendMessage", {
    to: process.env.MONITORING_CHANNEL,
    content: message
  })
  
  // Analyze for potential market impact
  const marketImpact = await analyzeMarketImpact(eventData)
  if (marketImpact.significant) {
    await agent.call("sendMessage", {
      to: process.env.MONITORING_CHANNEL,
      content: `📈 Market Impact Analysis: ${marketImpact.description}`
    })
  }
}
```

### Real-time Event Streaming

```typescript
// Real-time event streaming to agents
class PonderEventStreamer {
  private agent: Agent
  private eventQueue: Array<any> = []
  private processing = false
  
  constructor(agent: Agent) {
    this.agent = agent
    this.startProcessing()
  }
  
  async addEvent(eventType: string, eventData: any) {
    this.eventQueue.push({ eventType, eventData, timestamp: Date.now() })
    
    if (!this.processing) {
      this.processQueue()
    }
  }
  
  private async processQueue() {
    this.processing = true
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      
      try {
        await this.processEvent(event)
      } catch (error) {
        console.error("Error processing event:", error)
      }
      
      // Small delay to prevent overwhelming the agent
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.processing = false
  }
  
  private async processEvent(event: any) {
    const { eventType, eventData } = event
    
    // Filter events based on agent's interests
    if (await this.shouldProcessEvent(eventType, eventData)) {
      await this.agent.processBlockchainEvent(eventType, eventData)
    }
  }
  
  private async shouldProcessEvent(eventType: string, eventData: any): Promise<boolean> {
    // Implement filtering logic
    switch (eventType) {
      case "large-transfer":
        return parseFloat(eventData.valueUSD) > 1000
      case "large-swap":
        return parseFloat(eventData.valueUSD) > 10000
      case "liquidation":
        return true // Always process liquidations
      default:
        return false
    }
  }
}
```

## Configuration and Setup

### Environment Configuration

```bash
# .env file for Ponder integration
PONDER_RPC_URL_1=https://eth-mainnet.g.alchemy.com/v2/your-api-key
PONDER_RPC_URL_137=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
PONDER_DATABASE_URL=postgresql://user:password@localhost:5432/ponder

# Agent configuration
MONITORING_CHANNEL=0x1234567890abcdef1234567890abcdef12345678
WEBHOOK_SECRET=your-webhook-secret
```

### Database Schema

```sql
-- Ponder automatically generates these tables based on your event handlers

-- Transfers table
CREATE TABLE "Transfer" (
  "id" TEXT PRIMARY KEY,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  "value" NUMERIC NOT NULL,
  "blockNumber" INTEGER NOT NULL,
  "timestamp" INTEGER NOT NULL,
  "transactionHash" TEXT NOT NULL
);

-- Swaps table  
CREATE TABLE "Swap" (
  "id" TEXT PRIMARY KEY,
  "sender" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "amount0" NUMERIC NOT NULL,
  "amount1" NUMERIC NOT NULL,
  "sqrtPriceX96" NUMERIC NOT NULL,
  "liquidity" NUMERIC NOT NULL,
  "tick" INTEGER NOT NULL,
  "blockNumber" INTEGER NOT NULL,
  "timestamp" INTEGER NOT NULL,
  "transactionHash" TEXT NOT NULL,
  "isETHtoUSDC" BOOLEAN NOT NULL
);
```

### Advanced Event Filtering

```typescript
// Advanced event filtering and aggregation
ponder.on("ERC20:Transfer", async ({ event, context }) => {
  const { Transfer, DailyVolume } = context.db
  
  // Index individual transfer
  await Transfer.create({
    id: event.log.id,
    data: {
      from: event.args.from,
      to: event.args.to,
      value: event.args.value,
      blockNumber: event.block.number,
      timestamp: event.block.timestamp,
      transactionHash: event.transaction.hash,
    },
  })
  
  // Aggregate daily volume
  const dayStart = Math.floor(event.block.timestamp / 86400) * 86400
  const dayId = `${dayStart}`
  
  await DailyVolume.upsert({
    id: dayId,
    create: {
      date: dayStart,
      volume: event.args.value,
      transferCount: 1,
    },
    update: ({ current }) => ({
      volume: current.volume + event.args.value,
      transferCount: current.transferCount + 1,
    }),
  })
  
  // Check for unusual activity patterns
  const recentVolume = await context.db.DailyVolume.findMany({
    where: {
      date: { gte: dayStart - (7 * 86400) } // Last 7 days
    }
  })
  
  const avgVolume = recentVolume.reduce((sum, day) => sum + day.volume, 0n) / BigInt(recentVolume.length)
  const currentDayVolume = await context.db.DailyVolume.findUnique({ id: dayId })
  
  if (currentDayVolume && currentDayVolume.volume > avgVolume * 2n) {
    await forwardToAgent("unusual-volume", {
      type: "UNUSUAL_VOLUME",
      date: dayStart,
      volume: currentDayVolume.volume.toString(),
      averageVolume: avgVolume.toString(),
      multiplier: Number(currentDayVolume.volume / avgVolume),
    })
  }
})
```

## Use Cases and Examples

### DeFi Protocol Monitoring

```typescript
// Monitor specific DeFi protocols
const defiMonitoringConfig = {
  contracts: {
    // Aave lending pool
    AaveLendingPool: {
      network: "mainnet",
      address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
      abi: aaveLendingPoolABI,
      startBlock: 18000000,
    },
    
    // Compound cToken
    CompoundCUSDC: {
      network: "mainnet", 
      address: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
      abi: compoundCTokenABI,
      startBlock: 18000000,
    },
    
    // Uniswap V3 Factory
    UniswapV3Factory: {
      network: "mainnet",
      address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      abi: uniswapV3FactoryABI,
      startBlock: 18000000,
    }
  }
}

// Handle Aave deposits
ponder.on("AaveLendingPool:Deposit", async ({ event, context }) => {
  const { reserve, user, amount } = event.args
  
  if (amount > parseUnits("100000", 6)) { // > $100k deposit
    await forwardToAgent("large-aave-deposit", {
      type: "AAVE_DEPOSIT",
      user,
      reserve,
      amount: amount.toString(),
      valueUSD: await calculateUSDValue(reserve, amount),
      transactionHash: event.transaction.hash,
    })
  }
})

// Handle Compound liquidations
ponder.on("CompoundCUSDC:LiquidateBorrow", async ({ event, context }) => {
  await forwardToAgent("compound-liquidation", {
    type: "COMPOUND_LIQUIDATION",
    borrower: event.args.borrower,
    liquidator: event.args.liquidator,
    repayAmount: event.args.repayAmount.toString(),
    cTokenCollateral: event.args.cTokenCollateral,
    seizeTokens: event.args.seizeTokens.toString(),
    transactionHash: event.transaction.hash,
  })
})
```

### MEV Detection

```typescript
// Detect MEV (Maximal Extractable Value) activities
ponder.on("UniswapV3Pool:Swap", async ({ event, context }) => {
  const { MEVActivity } = context.db
  
  // Check for sandwich attacks
  const blockSwaps = await context.db.Swap.findMany({
    where: {
      blockNumber: event.block.number,
    },
    orderBy: { logIndex: "asc" }
  })
  
  // Detect sandwich pattern: swap -> victim swap -> swap
  if (blockSwaps.length >= 3) {
    const potentialSandwich = detectSandwichPattern(blockSwaps)
    
    if (potentialSandwich) {
      await MEVActivity.create({
        id: `${event.block.number}-sandwich`,
        data: {
          type: "SANDWICH_ATTACK",
          blockNumber: event.block.number,
          frontrunTx: potentialSandwich.frontrun.transactionHash,
          victimTx: potentialSandwich.victim.transactionHash,
          backrunTx: potentialSandwich.backrun.transactionHash,
          extractedValue: potentialSandwich.extractedValue,
        }
      })
      
      await forwardToAgent("mev-detected", {
        type: "MEV_SANDWICH",
        blockNumber: event.block.number,
        extractedValue: potentialSandwich.extractedValue,
        victimLoss: potentialSandwich.victimLoss,
      })
    }
  }
})

function detectSandwichPattern(swaps: any[]) {
  // Implement sandwich detection logic
  // Look for pattern where same address swaps before and after victim
  for (let i = 0; i < swaps.length - 2; i++) {
    const frontrun = swaps[i]
    const victim = swaps[i + 1]
    const backrun = swaps[i + 2]
    
    if (frontrun.sender === backrun.sender && 
        frontrun.sender !== victim.sender) {
      // Calculate extracted value
      const extractedValue = calculateSandwichProfit(frontrun, victim, backrun)
      
      if (extractedValue > 0) {
        return {
          frontrun,
          victim,
          backrun,
          extractedValue,
          victimLoss: calculateVictimLoss(victim, frontrun, backrun)
        }
      }
    }
  }
  
  return null
}
```

### Whale Tracking

```typescript
// Track whale activities across multiple protocols
const whaleAddresses = [
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", // Binance
  "0x8EB8a3b98659Cce290402893d0123abb75E3ab28", // Avalanche Bridge
  "0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489", // Jump Trading
]

ponder.on("ERC20:Transfer", async ({ event, context }) => {
  const { from, to, value } = event.args
  
  // Check if whale is involved
  const isWhaleFrom = whaleAddresses.includes(from.toLowerCase())
  const isWhaleTo = whaleAddresses.includes(to.toLowerCase())
  
  if ((isWhaleFrom || isWhaleTo) && value > parseUnits("1000000", 6)) { // > $1M
    await forwardToAgent("whale-movement", {
      type: "WHALE_TRANSFER",
      whale: isWhaleFrom ? from : to,
      direction: isWhaleFrom ? "OUT" : "IN",
      counterparty: isWhaleFrom ? to : from,
      amount: value.toString(),
      token: "USDC",
      transactionHash: event.transaction.hash,
    })
  }
})

// Track whale DEX activities
ponder.on("UniswapV3Pool:Swap", async ({ event, context }) => {
  const { sender, recipient } = event.args
  
  const isWhaleSender = whaleAddresses.includes(sender.toLowerCase())
  const isWhaleRecipient = whaleAddresses.includes(recipient.toLowerCase())
  
  if (isWhaleSender || isWhaleRecipient) {
    const swapValue = calculateSwapValue(event.args.amount0, event.args.amount1)
    
    if (swapValue > 1000000) { // > $1M swap
      await forwardToAgent("whale-swap", {
        type: "WHALE_SWAP",
        whale: isWhaleSender ? sender : recipient,
        swapValue,
        pool: event.log.address,
        transactionHash: event.transaction.hash,
      })
    }
  }
})
```

## Performance Optimization

### Efficient Event Processing

```typescript
// Batch event processing for better performance
class BatchEventProcessor {
  private eventBatch: Array<any> = []
  private batchSize = 100
  private batchTimeout = 5000 // 5 seconds
  private timeoutId: NodeJS.Timeout | null = null
  
  addEvent(event: any) {
    this.eventBatch.push(event)
    
    if (this.eventBatch.length >= this.batchSize) {
      this.processBatch()
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.processBatch(), this.batchTimeout)
    }
  }
  
  private async processBatch() {
    if (this.eventBatch.length === 0) return
    
    const batch = [...this.eventBatch]
    this.eventBatch = []
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    
    try {
      await this.processEventBatch(batch)
    } catch (error) {
      console.error("Error processing event batch:", error)
    }
  }
  
  private async processEventBatch(events: any[]) {
    // Group events by type for efficient processing
    const eventsByType = events.reduce((groups, event) => {
      const type = event.eventType
      if (!groups[type]) groups[type] = []
      groups[type].push(event)
      return groups
    }, {})
    
    // Process each type in parallel
    await Promise.all(
      Object.entries(eventsByType).map(([type, typeEvents]) =>
        this.processEventType(type, typeEvents as any[])
      )
    )
  }
  
  private async processEventType(type: string, events: any[]) {
    switch (type) {
      case "large-transfer":
        await this.processTransferBatch(events)
        break
      case "large-swap":
        await this.processSwapBatch(events)
        break
      default:
        // Process individually for unknown types
        for (const event of events) {
          await this.processIndividualEvent(event)
        }
    }
  }
}
```

## Next Steps

- Learn about [Foundry Integration](/blockchain/foundry) for smart contract development
- Explore [Multi-chain Support](/blockchain/multi-chain) for cross-chain operations
- Check out [XMTP Tools](/tools/xmtp) for messaging capabilities
- See [Tools](/tools) for creating custom agent capabilities
