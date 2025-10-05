---
title: Tools
description: Creating custom tools and extending agent functionality
---

# Tools

Learn how to create custom tools that extend your agent's capabilities beyond the built-in functionality.

## Creating Custom Tools

Custom tools allow your agents to perform specialized tasks and integrate with external services.

### Basic Tool Creation

```typescript
import { createTool } from "@hybrd/core/tools"
import { z } from "zod"

// Define tool schema
const weatherToolSchema = z.object({
  location: z.string().describe("The city or location to get weather for"),
  units: z.enum(["celsius", "fahrenheit"]).optional().default("celsius")
})

// Create the tool
const weatherTool = createTool({
  name: "getWeather",
  description: "Get current weather information for a location",
  schema: weatherToolSchema,
  
  async execute({ location, units }) {
    // Implement weather API call
    const response = await fetch(
      `https://api.weather.com/v1/current?location=${location}&units=${units}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`
        }
      }
    )
    
    const data = await response.json()
    
    return {
      location: data.location,
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity,
      windSpeed: data.windSpeed
    }
  }
})

// Add to agent
agent.use(weatherTool)
```

### Tool with Complex Parameters

```typescript
// Advanced tool with nested parameters
const portfolioAnalysisSchema = z.object({
  address: z.string().describe("Ethereum address to analyze"),
  timeframe: z.enum(["24h", "7d", "30d", "1y"]).default("30d"),
  includeNFTs: z.boolean().default(false),
  metrics: z.array(z.enum([
    "performance", "risk", "diversification", "yield"
  ])).default(["performance", "risk"])
})

const portfolioAnalysisTool = createTool({
  name: "analyzePortfolio",
  description: "Perform comprehensive portfolio analysis",
  schema: portfolioAnalysisSchema,
  
  async execute({ address, timeframe, includeNFTs, metrics }) {
    const analysis: any = {}
    
    // Get portfolio data
    const portfolio = await getPortfolioData(address, timeframe)
    
    // Calculate requested metrics
    if (metrics.includes("performance")) {
      analysis.performance = await calculatePerformance(portfolio, timeframe)
    }
    
    if (metrics.includes("risk")) {
      analysis.risk = await calculateRiskMetrics(portfolio)
    }
    
    if (metrics.includes("diversification")) {
      analysis.diversification = await analyzeDiversification(portfolio)
    }
    
    if (metrics.includes("yield")) {
      analysis.yield = await calculateYieldMetrics(portfolio)
    }
    
    // Include NFTs if requested
    if (includeNFTs) {
      analysis.nfts = await getNFTAnalysis(address)
    }
    
    return {
      address,
      timeframe,
      analysis,
      generatedAt: new Date().toISOString()
    }
  }
})
```

### Tool with External API Integration

```typescript
// Tool that integrates with external DeFi protocols
const defiYieldSchema = z.object({
  protocol: z.enum(["aave", "compound", "uniswap", "curve"]),
  token: z.string().describe("Token symbol (e.g., USDC, ETH)"),
  amount: z.number().positive().describe("Amount to calculate yield for")
})

const defiYieldTool = createTool({
  name: "calculateDeFiYield",
  description: "Calculate potential yield from DeFi protocols",
  schema: defiYieldSchema,
  
  async execute({ protocol, token, amount }) {
    switch (protocol) {
      case "aave":
        return await calculateAaveYield(token, amount)
      case "compound":
        return await calculateCompoundYield(token, amount)
      case "uniswap":
        return await calculateUniswapYield(token, amount)
      case "curve":
        return await calculateCurveYield(token, amount)
      default:
        throw new Error(`Unsupported protocol: ${protocol}`)
    }
  }
})

async function calculateAaveYield(token: string, amount: number) {
  // Get current Aave rates
  const response = await fetch(`https://api.aave.com/v2/rates/${token}`)
  const rates = await response.json()
  
  const dailyRate = rates.liquidityRate / 365
  const yearlyYield = amount * rates.liquidityRate
  const monthlyYield = yearlyYield / 12
  
  return {
    protocol: "Aave",
    token,
    amount,
    apy: rates.liquidityRate * 100,
    estimatedYield: {
      daily: amount * dailyRate,
      monthly: monthlyYield,
      yearly: yearlyYield
    },
    risks: ["smart contract risk", "liquidation risk"],
    lastUpdated: new Date().toISOString()
  }
}
```

## Tool Schema Validation with Zod

Zod provides powerful schema validation for tool parameters.

### Basic Schema Types

```typescript
import { z } from "zod"

// String validation
const stringSchema = z.string()
  .min(1, "Cannot be empty")
  .max(100, "Too long")
  .regex(/^[a-zA-Z0-9]+$/, "Alphanumeric only")

// Number validation
const numberSchema = z.number()
  .positive("Must be positive")
  .max(1000000, "Amount too large")
  .multipleOf(0.01, "Max 2 decimal places")

// Enum validation
const chainSchema = z.enum(["ethereum", "polygon", "arbitrum", "optimism"])

// Array validation
const tokensSchema = z.array(z.string()).min(1).max(10)

// Object validation
const transactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  amount: z.number().positive(),
  token: z.string().optional().default("ETH"),
  gasLimit: z.number().optional()
})
```

### Advanced Schema Patterns

```typescript
// Conditional validation
const swapSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  amount: z.number().positive(),
  slippage: z.number().min(0.1).max(50).default(1),
  deadline: z.number().optional()
}).refine(data => data.fromToken !== data.toToken, {
  message: "Cannot swap token to itself",
  path: ["toToken"]
})

// Union types
const paymentSchema = z.union([
  z.object({
    type: z.literal("crypto"),
    token: z.string(),
    amount: z.number(),
    recipient: z.string()
  }),
  z.object({
    type: z.literal("fiat"),
    currency: z.string(),
    amount: z.number(),
    paymentMethod: z.enum(["card", "bank", "paypal"])
  })
])

// Transform and preprocess
const addressSchema = z.string()
  .transform(addr => addr.toLowerCase())
  .refine(addr => /^0x[a-f0-9]{40}$/.test(addr), "Invalid address")
```

### Schema Documentation

```typescript
// Well-documented schema for better AI understanding
const tradingToolSchema = z.object({
  action: z.enum(["buy", "sell"]).describe(
    "Whether to buy or sell the token"
  ),
  
  token: z.string().describe(
    "Token symbol (e.g., ETH, USDC, UNI). Must be a valid ERC-20 token."
  ),
  
  amount: z.number().positive().describe(
    "Amount of tokens to trade. For sell orders, this is the amount of tokens to sell. For buy orders, this is the amount of base currency to spend."
  ),
  
  priceLimit: z.number().positive().optional().describe(
    "Maximum price per token for buy orders, minimum price for sell orders. If not specified, will use market price."
  ),
  
  slippage: z.number().min(0.1).max(50).default(1).describe(
    "Maximum acceptable slippage percentage (0.1-50). Default is 1%."
  )
})
```

## Tool Runtime Extensions

Extend tool functionality with runtime context and middleware.

### Tool Middleware

```typescript
// Middleware for tool execution
class ToolMiddleware {
  async beforeExecution(toolName: string, params: any, context: any) {
    // Log tool usage
    console.log(`Executing tool: ${toolName}`, params)
    
    // Rate limiting
    await this.checkRateLimit(toolName, context.userId)
    
    // Permission checking
    await this.checkPermissions(toolName, context.userId)
    
    // Parameter validation
    return this.validateParameters(toolName, params)
  }
  
  async afterExecution(toolName: string, result: any, context: any) {
    // Log results
    console.log(`Tool ${toolName} completed`, { success: true })
    
    // Update usage statistics
    await this.updateUsageStats(toolName, context.userId)
    
    // Cache results if appropriate
    if (this.shouldCache(toolName)) {
      await this.cacheResult(toolName, result, context)
    }
    
    return result
  }
  
  async onError(toolName: string, error: Error, context: any) {
    // Log errors
    console.error(`Tool ${toolName} failed:`, error)
    
    // Update error statistics
    await this.updateErrorStats(toolName, error, context.userId)
    
    // Attempt recovery
    if (this.canRecover(toolName, error)) {
      return await this.attemptRecovery(toolName, error, context)
    }
    
    throw error
  }
}
```

### Context-Aware Tools

```typescript
// Tools that use runtime context
const contextAwareToolSchema = z.object({
  query: z.string().describe("The user's query or request")
})

const contextAwareTool = createTool({
  name: "smartAssistant",
  description: "Provide contextual assistance based on conversation history",
  schema: contextAwareToolSchema,
  
  async execute({ query }, context) {
    // Access conversation context
    const conversationHistory = context.conversation?.history || []
    const userProfile = context.user?.profile || {}
    const currentPortfolio = context.user?.portfolio || {}
    
    // Analyze context to provide better responses
    const analysis = await analyzeContext({
      query,
      conversationHistory,
      userProfile,
      currentPortfolio
    })
    
    // Generate contextual response
    return await generateContextualResponse(analysis)
  }
})

async function analyzeContext(data: any) {
  const { query, conversationHistory, userProfile, currentPortfolio } = data
  
  // Analyze conversation patterns
  const topics = extractTopics(conversationHistory)
  const sentiment = analyzeSentiment(conversationHistory)
  
  // Analyze user behavior
  const riskTolerance = userProfile.riskTolerance || "moderate"
  const experienceLevel = userProfile.experienceLevel || "beginner"
  
  // Analyze portfolio context
  const portfolioValue = currentPortfolio.totalValue || 0
  const topHoldings = currentPortfolio.holdings?.slice(0, 3) || []
  
  return {
    query,
    context: {
      topics,
      sentiment,
      riskTolerance,
      experienceLevel,
      portfolioValue,
      topHoldings
    }
  }
}
```

### Tool Composition

```typescript
// Combine multiple tools for complex operations
class CompositeToolBuilder {
  private tools: Array<any> = []
  
  addTool(tool: any) {
    this.tools.push(tool)
    return this
  }
  
  build(name: string, description: string) {
    return createTool({
      name,
      description,
      schema: z.object({
        operation: z.string().describe("The operation to perform")
      }),
      
      async execute({ operation }, context) {
        const results: any = {}
        
        for (const tool of this.tools) {
          if (await this.shouldExecuteTool(tool, operation, context)) {
            try {
              const result = await tool.execute(
                this.getToolParams(tool, operation, context),
                context
              )
              results[tool.name] = result
            } catch (error) {
              results[tool.name] = { error: error.message }
            }
          }
        }
        
        return this.combineResults(results, operation)
      }
    })
  }
  
  private async shouldExecuteTool(tool: any, operation: string, context: any) {
    // Logic to determine if tool should be executed
    return true
  }
  
  private getToolParams(tool: any, operation: string, context: any) {
    // Extract appropriate parameters for each tool
    return {}
  }
  
  private combineResults(results: any, operation: string) {
    // Combine results from multiple tools
    return {
      operation,
      results,
      summary: this.generateSummary(results)
    }
  }
}

// Usage
const portfolioAnalysisComposite = new CompositeToolBuilder()
  .addTool(balanceCheckTool)
  .addTool(performanceAnalysisTool)
  .addTool(riskAssessmentTool)
  .addTool(recommendationTool)
  .build("comprehensivePortfolioAnalysis", "Complete portfolio analysis")
```

## Combining Multiple Tool Sets

Organize and manage multiple tools efficiently.

### Tool Categories

```typescript
// Organize tools by category
class ToolRegistry {
  private categories = new Map<string, Array<any>>()
  
  addCategory(name: string, tools: Array<any>) {
    this.categories.set(name, tools)
  }
  
  getCategory(name: string) {
    return this.categories.get(name) || []
  }
  
  getAllTools() {
    const allTools: Array<any> = []
    for (const tools of this.categories.values()) {
      allTools.push(...tools)
    }
    return allTools
  }
  
  getToolsByCapability(capability: string) {
    return this.getAllTools().filter(tool => 
      tool.capabilities?.includes(capability)
    )
  }
}

// Create tool categories
const toolRegistry = new ToolRegistry()

toolRegistry.addCategory("blockchain", [
  balanceCheckTool,
  transactionTool,
  gasEstimationTool
])

toolRegistry.addCategory("defi", [
  swapTool,
  yieldFarmingTool,
  liquidityTool
])

toolRegistry.addCategory("analytics", [
  portfolioAnalysisTool,
  marketAnalysisTool,
  riskAssessmentTool
])

toolRegistry.addCategory("communication", [
  emailTool,
  notificationTool,
  reportGenerationTool
])
```

### Dynamic Tool Loading

```typescript
// Load tools dynamically based on context
class DynamicToolLoader {
  private availableTools = new Map<string, any>()
  private loadedTools = new Set<string>()
  
  registerTool(name: string, tool: any) {
    this.availableTools.set(name, tool)
  }
  
  async loadToolsForContext(context: any) {
    const requiredTools = this.determineRequiredTools(context)
    
    for (const toolName of requiredTools) {
      if (!this.loadedTools.has(toolName)) {
        await this.loadTool(toolName)
      }
    }
    
    return Array.from(this.loadedTools).map(name => 
      this.availableTools.get(name)
    )
  }
  
  private determineRequiredTools(context: any): string[] {
    const tools: string[] = []
    
    // Always load basic tools
    tools.push("balanceCheck", "sendMessage")
    
    // Load based on user type
    if (context.user?.type === "trader") {
      tools.push("swap", "marketAnalysis", "technicalAnalysis")
    }
    
    if (context.user?.type === "defi-user") {
      tools.push("yieldFarming", "liquidityProvision", "governance")
    }
    
    // Load based on conversation context
    if (context.conversation?.topics?.includes("nft")) {
      tools.push("nftAnalysis", "nftMarketplace")
    }
    
    return tools
  }
  
  private async loadTool(toolName: string) {
    const tool = this.availableTools.get(toolName)
    if (tool) {
      // Perform any initialization
      if (tool.initialize) {
        await tool.initialize()
      }
      
      this.loadedTools.add(toolName)
      console.log(`Loaded tool: ${toolName}`)
    }
  }
}
```

### Tool Performance Monitoring

```typescript
// Monitor tool performance and usage
class ToolMonitor {
  private metrics = new Map<string, any>()
  
  recordExecution(toolName: string, duration: number, success: boolean) {
    if (!this.metrics.has(toolName)) {
      this.metrics.set(toolName, {
        executions: 0,
        totalDuration: 0,
        successes: 0,
        failures: 0,
        averageDuration: 0
      })
    }
    
    const metric = this.metrics.get(toolName)
    metric.executions++
    metric.totalDuration += duration
    
    if (success) {
      metric.successes++
    } else {
      metric.failures++
    }
    
    metric.averageDuration = metric.totalDuration / metric.executions
    metric.successRate = metric.successes / metric.executions
  }
  
  getMetrics(toolName?: string) {
    if (toolName) {
      return this.metrics.get(toolName)
    }
    return Object.fromEntries(this.metrics)
  }
  
  getTopPerformingTools(limit = 5) {
    return Array.from(this.metrics.entries())
      .sort(([,a], [,b]) => b.successRate - a.successRate)
      .slice(0, limit)
      .map(([name, metrics]) => ({ name, ...metrics }))
  }
  
  getSlowestTools(limit = 5) {
    return Array.from(this.metrics.entries())
      .sort(([,a], [,b]) => b.averageDuration - a.averageDuration)
      .slice(0, limit)
      .map(([name, metrics]) => ({ name, ...metrics }))
  }
}

// Integrate monitoring with tool execution
const monitor = new ToolMonitor()

const monitoredTool = createTool({
  name: "monitoredExample",
  description: "Example tool with monitoring",
  schema: z.object({ input: z.string() }),
  
  async execute({ input }) {
    const startTime = Date.now()
    let success = false
    
    try {
      const result = await performOperation(input)
      success = true
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = Date.now() - startTime
      monitor.recordExecution("monitoredExample", duration, success)
    }
  }
})
```

## Error Handling and Validation

Implement robust error handling for reliable tool execution.

### Tool Error Handling

```typescript
// Comprehensive error handling for tools
class ToolErrorHandler {
  static createResilientTool(config: any) {
    return createTool({
      ...config,
      
      async execute(params, context) {
        const maxRetries = config.maxRetries || 3
        const retryDelay = config.retryDelay || 1000
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await config.execute(params, context)
          } catch (error) {
            console.warn(`Tool ${config.name} attempt ${attempt} failed:`, error)
            
            if (attempt === maxRetries) {
              throw new ToolExecutionError(
                `Tool ${config.name} failed after ${maxRetries} attempts`,
                error
              )
            }
            
            // Exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
          }
        }
      }
    })
  }
}

class ToolExecutionError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message)
    this.name = "ToolExecutionError"
  }
}

// Usage
const resilientWeatherTool = ToolErrorHandler.createResilientTool({
  name: "resilientWeather",
  description: "Weather tool with retry logic",
  schema: weatherToolSchema,
  maxRetries: 3,
  retryDelay: 1000,
  
  async execute({ location, units }) {
    // This will be wrapped with retry logic
    return await fetchWeatherData(location, units)
  }
})
```

### Input Validation and Sanitization

```typescript
// Advanced input validation
class InputValidator {
  static createValidatedTool(config: any) {
    return createTool({
      ...config,
      
      async execute(params, context) {
        // Pre-execution validation
        const validatedParams = await this.validateAndSanitize(
          params, 
          config.schema,
          config.customValidators
        )
        
        // Execute with validated parameters
        return await config.execute(validatedParams, context)
      }
    })
  }
  
  static async validateAndSanitize(params: any, schema: any, customValidators?: any) {
    // Schema validation
    const validated = schema.parse(params)
    
    // Custom validation
    if (customValidators) {
      for (const validator of customValidators) {
        await validator(validated)
      }
    }
    
    // Sanitization
    return this.sanitizeParams(validated)
  }
  
  static sanitizeParams(params: any): any {
    if (typeof params === 'string') {
      // Remove potentially dangerous characters
      return params.replace(/[<>\"']/g, '')
    }
    
    if (Array.isArray(params)) {
      return params.map(item => this.sanitizeParams(item))
    }
    
    if (typeof params === 'object' && params !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(params)) {
        sanitized[key] = this.sanitizeParams(value)
      }
      return sanitized
    }
    
    return params
  }
}
```

## Next Steps

- Learn about [Blockchain Tools](/blockchain/tools) for crypto functionality
- Explore [XMTP Tools](/xmtp/tools) for messaging capabilities
- Check out [Mini Apps](/mini-apps) for mini app integration
- See [Developing](/developing/contributing) for advanced development
