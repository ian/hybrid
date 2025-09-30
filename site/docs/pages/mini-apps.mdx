---
title: Mini Apps
description: Mini app integration and development with Hybrid agents
---

# Mini Apps

Learn how to integrate and develop mini apps that work seamlessly with your Hybrid agents.

## Mini App Integration

Mini apps extend your agent's capabilities by providing interactive interfaces and specialized functionality that users can access directly through messaging interfaces.

### What are Mini Apps?

Mini apps are lightweight applications that:

- **Integrate with messaging** - Accessible through XMTP conversations
- **Provide rich interfaces** - Beyond simple text interactions
- **Extend agent capabilities** - Add specialized functionality
- **Maintain context** - Share state with your agent
- **Work cross-platform** - Compatible with various XMTP clients

### Integration Architecture

```typescript
import { Agent } from "@hybrd/core"
import { miniAppTools } from "@hybrd/core/tools"

const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions...",
  tools: [
    miniAppTools({
      // Mini app configuration
      apps: [
        {
          name: "portfolio-tracker",
          url: "https://your-app.com/portfolio",
          description: "Track and analyze your crypto portfolio"
        },
        {
          name: "swap-interface", 
          url: "https://your-app.com/swap",
          description: "Swap tokens with optimal routing"
        }
      ]
    })
  ]
})
```

## Mini App Integration Capabilities

### Launching Mini Apps

```typescript
// Agent can launch mini apps in response to user requests
agent.on("message", async (message) => {
  if (message.content.includes("show portfolio")) {
    await agent.call("launchMiniApp", {
      appName: "portfolio-tracker",
      context: {
        userAddress: message.sender,
        conversation: message.conversation.id
      }
    })
  }
  
  if (message.content.includes("swap tokens")) {
    await agent.call("launchMiniApp", {
      appName: "swap-interface",
      context: {
        userAddress: message.sender,
        fromToken: "ETH",
        toToken: "USDC"
      }
    })
  }
})
```

### Context Sharing

```typescript
// Share context between agent and mini apps
class ContextManager {
  private contexts = new Map<string, any>()
  
  setContext(conversationId: string, context: any) {
    this.contexts.set(conversationId, {
      ...this.contexts.get(conversationId),
      ...context
    })
  }
  
  getContext(conversationId: string) {
    return this.contexts.get(conversationId) || {}
  }
  
  updateFromMiniApp(conversationId: string, appData: any) {
    const context = this.getContext(conversationId)
    context.miniAppData = {
      ...context.miniAppData,
      ...appData
    }
    this.setContext(conversationId, context)
  }
}

const contextManager = new ContextManager()

// Agent updates context for mini app
agent.on("beforeMiniAppLaunch", (event) => {
  contextManager.setContext(event.conversationId, {
    userPreferences: event.userPreferences,
    portfolioData: event.portfolioData,
    transactionHistory: event.transactionHistory
  })
})
```

### Mini App Communication

```typescript
// Handle communication between mini apps and agent
class MiniAppBridge {
  constructor(private agent: Agent) {
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    // Handle mini app events
    this.agent.on("miniAppEvent", async (event) => {
      switch (event.type) {
        case "transaction-completed":
          await this.handleTransactionCompleted(event)
          break
          
        case "user-action":
          await this.handleUserAction(event)
          break
          
        case "data-request":
          await this.handleDataRequest(event)
          break
      }
    })
  }
  
  private async handleTransactionCompleted(event: any) {
    const { transactionHash, amount, token } = event.data
    
    await this.agent.call("sendMessage", {
      to: event.conversationId,
      content: `✅ Transaction completed!\n\n` +
               `Amount: ${amount} ${token}\n` +
               `Hash: ${transactionHash}\n` +
               `View on Etherscan: https://etherscan.io/tx/${transactionHash}`
    })
  }
  
  private async handleUserAction(event: any) {
    // Process user actions from mini app
    const { action, parameters } = event.data
    
    switch (action) {
      case "request-analysis":
        const analysis = await this.generateAnalysis(parameters)
        await this.sendToMiniApp(event.appId, { type: "analysis", data: analysis })
        break
        
      case "save-preferences":
        await this.saveUserPreferences(event.userId, parameters)
        break
    }
  }
  
  private async handleDataRequest(event: any) {
    // Provide data to mini app
    const { dataType, parameters } = event.data
    
    let data
    switch (dataType) {
      case "portfolio":
        data = await this.getPortfolioData(parameters.address)
        break
        
      case "market-data":
        data = await this.getMarketData(parameters.tokens)
        break
        
      case "transaction-history":
        data = await this.getTransactionHistory(parameters.address)
        break
    }
    
    await this.sendToMiniApp(event.appId, { type: "data-response", data })
  }
}
```

## Tool Configuration for Mini Apps

### Basic Configuration

```typescript
// Configure mini app tools
const miniAppConfig = {
  // App registry
  apps: [
    {
      id: "portfolio-tracker",
      name: "Portfolio Tracker",
      url: "https://apps.hybrid.dev/portfolio",
      description: "Track and analyze your crypto portfolio",
      permissions: ["read-balance", "read-transactions"],
      categories: ["finance", "analytics"]
    },
    {
      id: "defi-dashboard",
      name: "DeFi Dashboard", 
      url: "https://apps.hybrid.dev/defi",
      description: "Manage your DeFi positions",
      permissions: ["read-balance", "write-transactions"],
      categories: ["defi", "management"]
    }
  ],
  
  // Security settings
  security: {
    allowedOrigins: ["https://apps.hybrid.dev"],
    requireSignature: true,
    sessionTimeout: 3600000 // 1 hour
  },
  
  // UI configuration
  ui: {
    theme: "dark",
    accentColor: "#FF5C00",
    showBranding: true
  }
}

agent.use(miniAppTools(miniAppConfig))
```

### Permission Management

```typescript
// Manage mini app permissions
class PermissionManager {
  private permissions = new Map<string, Set<string>>()
  
  grantPermission(appId: string, permission: string) {
    if (!this.permissions.has(appId)) {
      this.permissions.set(appId, new Set())
    }
    this.permissions.get(appId)!.add(permission)
  }
  
  hasPermission(appId: string, permission: string): boolean {
    return this.permissions.get(appId)?.has(permission) || false
  }
  
  revokePermission(appId: string, permission: string) {
    this.permissions.get(appId)?.delete(permission)
  }
  
  getPermissions(appId: string): string[] {
    return Array.from(this.permissions.get(appId) || [])
  }
}

// Use in mini app tools
const permissionManager = new PermissionManager()

agent.use(miniAppTools({
  permissionManager,
  onPermissionRequest: async (appId, permission, context) => {
    // Ask user for permission
    await agent.call("sendMessage", {
      to: context.conversationId,
      content: `The app "${appId}" is requesting permission to "${permission}". Do you approve? (yes/no)`
    })
    
    // Wait for user response and grant/deny accordingly
  }
}))
```

### State Management

```typescript
// Manage mini app state
class MiniAppStateManager {
  private states = new Map<string, any>()
  
  setState(appId: string, conversationId: string, state: any) {
    const key = `${appId}:${conversationId}`
    this.states.set(key, {
      ...this.states.get(key),
      ...state,
      lastUpdated: Date.now()
    })
  }
  
  getState(appId: string, conversationId: string) {
    const key = `${appId}:${conversationId}`
    return this.states.get(key) || {}
  }
  
  clearState(appId: string, conversationId: string) {
    const key = `${appId}:${conversationId}`
    this.states.delete(key)
  }
  
  // Cleanup old states
  cleanup(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours
    const now = Date.now()
    for (const [key, state] of this.states.entries()) {
      if (now - state.lastUpdated > maxAge) {
        this.states.delete(key)
      }
    }
  }
}
```

## Usage Patterns and Examples

### Portfolio Management Mini App

```typescript
// Portfolio management integration
class PortfolioMiniApp {
  constructor(private agent: Agent) {
    this.setupHandlers()
  }
  
  private setupHandlers() {
    this.agent.on("message", async (message) => {
      if (this.shouldLaunchPortfolioApp(message.content)) {
        await this.launchPortfolioApp(message)
      }
    })
  }
  
  private shouldLaunchPortfolioApp(content: string): boolean {
    const triggers = [
      "show portfolio", "portfolio analysis", "my holdings",
      "portfolio performance", "asset allocation"
    ]
    return triggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    )
  }
  
  private async launchPortfolioApp(message: any) {
    // Get user's portfolio data
    const portfolioData = await this.getPortfolioData(message.sender)
    
    // Launch mini app with context
    await this.agent.call("launchMiniApp", {
      appId: "portfolio-tracker",
      context: {
        userAddress: message.sender,
        conversationId: message.conversation.id,
        portfolioData,
        preferences: await this.getUserPreferences(message.sender)
      },
      ui: {
        title: "Your Portfolio",
        subtitle: `Total Value: $${portfolioData.totalValue.toLocaleString()}`
      }
    })
    
    // Send confirmation message
    await this.agent.call("sendMessage", {
      to: message.conversation.id,
      content: "📊 Opening your portfolio dashboard..."
    })
  }
  
  private async getPortfolioData(address: string) {
    // Fetch portfolio data from blockchain
    return {
      totalValue: 12500.50,
      holdings: [
        { symbol: "ETH", amount: 5.2, value: 8500 },
        { symbol: "USDC", amount: 2000, value: 2000 },
        { symbol: "UNI", amount: 100, value: 2000.50 }
      ],
      performance24h: 2.5,
      lastUpdated: Date.now()
    }
  }
}
```

### Trading Interface Mini App

```typescript
// Trading interface integration
class TradingMiniApp {
  constructor(private agent: Agent) {
    this.setupHandlers()
  }
  
  private setupHandlers() {
    this.agent.on("message", async (message) => {
      if (this.shouldLaunchTradingApp(message.content)) {
        await this.launchTradingApp(message)
      }
    })
    
    // Handle trading events from mini app
    this.agent.on("miniAppEvent", async (event) => {
      if (event.appId === "trading-interface") {
        await this.handleTradingEvent(event)
      }
    })
  }
  
  private shouldLaunchTradingApp(content: string): boolean {
    const triggers = [
      "swap", "trade", "buy", "sell", "exchange",
      "convert", "trading interface"
    ]
    return triggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    )
  }
  
  private async launchTradingApp(message: any) {
    // Parse trading intent from message
    const intent = await this.parseTradingIntent(message.content)
    
    await this.agent.call("launchMiniApp", {
      appId: "trading-interface",
      context: {
        userAddress: message.sender,
        conversationId: message.conversation.id,
        intent,
        availableTokens: await this.getAvailableTokens(message.sender)
      }
    })
  }
  
  private async handleTradingEvent(event: any) {
    switch (event.type) {
      case "trade-preview":
        await this.handleTradePreview(event)
        break
        
      case "trade-executed":
        await this.handleTradeExecuted(event)
        break
        
      case "trade-failed":
        await this.handleTradeFailed(event)
        break
    }
  }
  
  private async handleTradeExecuted(event: any) {
    const { fromToken, toToken, fromAmount, toAmount, txHash } = event.data
    
    await this.agent.call("sendMessage", {
      to: event.conversationId,
      content: `✅ Trade executed successfully!\n\n` +
               `Swapped: ${fromAmount} ${fromToken} → ${toAmount} ${toToken}\n` +
               `Transaction: ${txHash}\n` +
               `View on Etherscan: https://etherscan.io/tx/${txHash}`
    })
  }
}
```

### Analytics Dashboard Mini App

```typescript
// Analytics dashboard integration
class AnalyticsMiniApp {
  constructor(private agent: Agent) {
    this.setupHandlers()
  }
  
  private setupHandlers() {
    this.agent.on("message", async (message) => {
      if (this.shouldLaunchAnalytics(message.content)) {
        await this.launchAnalytics(message)
      }
    })
  }
  
  private shouldLaunchAnalytics(content: string): boolean {
    const triggers = [
      "analytics", "analysis", "insights", "performance",
      "trends", "statistics", "dashboard"
    ]
    return triggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    )
  }
  
  private async launchAnalytics(message: any) {
    // Generate analytics data
    const analyticsData = await this.generateAnalytics(message.sender)
    
    await this.agent.call("launchMiniApp", {
      appId: "analytics-dashboard",
      context: {
        userAddress: message.sender,
        conversationId: message.conversation.id,
        analyticsData,
        timeframe: "30d" // Default timeframe
      },
      ui: {
        title: "Portfolio Analytics",
        subtitle: "30-day performance overview"
      }
    })
  }
  
  private async generateAnalytics(address: string) {
    return {
      performance: {
        total: 15.5, // 15.5% gain
        period: "30d",
        benchmark: 8.2 // vs market
      },
      riskMetrics: {
        volatility: 0.25,
        sharpeRatio: 1.8,
        maxDrawdown: -12.5
      },
      allocation: [
        { category: "DeFi", percentage: 45 },
        { category: "Blue Chips", percentage: 35 },
        { category: "Stablecoins", percentage: 20 }
      ],
      insights: [
        "Your portfolio outperformed the market by 7.3%",
        "Consider rebalancing - DeFi allocation is above target",
        "Low correlation with traditional markets detected"
      ]
    }
  }
}
```

### Custom Mini App Development

```typescript
// Framework for custom mini app development
abstract class CustomMiniApp {
  protected agent: Agent
  protected appId: string
  
  constructor(agent: Agent, appId: string) {
    this.agent = agent
    this.appId = appId
    this.initialize()
  }
  
  private initialize() {
    this.agent.on("message", async (message) => {
      if (await this.shouldHandle(message)) {
        await this.handleMessage(message)
      }
    })
    
    this.agent.on("miniAppEvent", async (event) => {
      if (event.appId === this.appId) {
        await this.handleEvent(event)
      }
    })
  }
  
  // Abstract methods to implement
  abstract shouldHandle(message: any): Promise<boolean>
  abstract handleMessage(message: any): Promise<void>
  abstract handleEvent(event: any): Promise<void>
  
  // Helper methods
  protected async launchApp(context: any, ui?: any) {
    await this.agent.call("launchMiniApp", {
      appId: this.appId,
      context,
      ui
    })
  }
  
  protected async sendMessage(conversationId: string, content: string) {
    await this.agent.call("sendMessage", {
      to: conversationId,
      content
    })
  }
  
  protected async sendToApp(data: any) {
    await this.agent.call("sendToMiniApp", {
      appId: this.appId,
      data
    })
  }
}

// Example implementation
class CustomYieldFarmingApp extends CustomMiniApp {
  async shouldHandle(message: any): Promise<boolean> {
    return message.content.toLowerCase().includes("yield farming") ||
           message.content.toLowerCase().includes("liquidity mining")
  }
  
  async handleMessage(message: any): Promise<void> {
    const opportunities = await this.getYieldOpportunities()
    
    await this.launchApp({
      userAddress: message.sender,
      conversationId: message.conversation.id,
      opportunities
    }, {
      title: "Yield Farming Opportunities",
      subtitle: `${opportunities.length} opportunities found`
    })
  }
  
  async handleEvent(event: any): Promise<void> {
    switch (event.type) {
      case "stake-tokens":
        await this.handleStaking(event)
        break
        
      case "unstake-tokens":
        await this.handleUnstaking(event)
        break
    }
  }
  
  private async getYieldOpportunities() {
    // Fetch yield farming opportunities
    return [
      { protocol: "Aave", apy: 5.2, risk: "low" },
      { protocol: "Compound", apy: 4.8, risk: "low" },
      { protocol: "Uniswap V3", apy: 12.5, risk: "medium" }
    ]
  }
}
```

## Security and Best Practices

### Security Considerations

```typescript
// Implement security measures for mini apps
class SecureMiniAppManager {
  private allowedOrigins = new Set<string>()
  private sessionTokens = new Map<string, { token: string, expires: number }>()
  
  constructor(config: { allowedOrigins: string[] }) {
    config.allowedOrigins.forEach(origin => 
      this.allowedOrigins.add(origin)
    )
  }
  
  validateOrigin(origin: string): boolean {
    return this.allowedOrigins.has(origin)
  }
  
  generateSessionToken(appId: string, userId: string): string {
    const token = crypto.randomUUID()
    const expires = Date.now() + (60 * 60 * 1000) // 1 hour
    
    this.sessionTokens.set(`${appId}:${userId}`, { token, expires })
    return token
  }
  
  validateSessionToken(appId: string, userId: string, token: string): boolean {
    const session = this.sessionTokens.get(`${appId}:${userId}`)
    if (!session) return false
    
    if (Date.now() > session.expires) {
      this.sessionTokens.delete(`${appId}:${userId}`)
      return false
    }
    
    return session.token === token
  }
  
  sanitizeInput(input: any): any {
    // Implement input sanitization
    if (typeof input === 'string') {
      return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value)
      }
      return sanitized
    }
    
    return input
  }
}
```

### Best Practices

**Security Guidelines:**
- Always validate mini app origins
- Use session tokens for authentication
- Sanitize all user inputs
- Implement permission-based access control
- Regular security audits of mini app code

**Performance Guidelines:**
- Lazy load mini apps when needed
- Cache frequently used data
- Implement proper error boundaries
- Use efficient state management
- Monitor resource usage

**User Experience Guidelines:**
- Provide clear loading states
- Handle errors gracefully
- Maintain consistent UI/UX
- Support offline functionality where possible
- Ensure accessibility compliance

## Next Steps

- Learn about [Tools](/tools) for creating custom agent capabilities
- Explore [Blockchain Tools](/blockchain/tools) for crypto functionality
- Check out [Agent Configuration](/agent-configuration/behaviors) for message processing
- See [Developing](/developing/contributing) for advanced development
