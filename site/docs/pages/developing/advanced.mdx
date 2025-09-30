---
title: Advanced Development
description: Complex scenarios, performance optimization, debugging, and integration testing
---

# Advanced Development

Master advanced development techniques for building sophisticated Hybrid agents and applications.

## Custom Agent Architectures

### Multi-Agent Systems

```typescript
// Orchestrate multiple specialized agents
export class AgentOrchestrator {
  private agents = new Map<string, Agent>()
  private messageRouter: MessageRouter
  private sharedContext: SharedContext
  
  constructor() {
    this.messageRouter = new MessageRouter()
    this.sharedContext = new SharedContext()
  }
  
  async addAgent(name: string, config: AgentConfig): Promise<void> {
    const agent = new Agent({
      ...config,
      orchestrator: this,
      sharedContext: this.sharedContext
    })
    
    this.agents.set(name, agent)
    await agent.start()
    
    console.log(`Agent ${name} added to orchestrator`)
  }
  
  async routeMessage(message: Message): Promise<void> {
    // Determine which agent(s) should handle the message
    const targetAgents = await this.messageRouter.route(message, this.agents)
    
    // Process message with selected agents
    const results = await Promise.all(
      targetAgents.map(agent => agent.processMessage(message))
    )
    
    // Coordinate responses if multiple agents responded
    if (results.length > 1) {
      await this.coordinateResponses(message, results)
    }
  }
  
  private async coordinateResponses(
    originalMessage: Message, 
    results: ProcessingResult[]
  ): Promise<void> {
    // Combine or select best response
    const combinedResponse = await this.combineResponses(results)
    
    // Send coordinated response
    await this.sendResponse(originalMessage.conversation.id, combinedResponse)
  }
}

// Specialized agent types
class TradingAgent extends Agent {
  constructor(config: AgentConfig) {
    super({
      ...config,
      instructions: `You are a specialized trading agent. You can:
      - Analyze market data and trends
      - Execute trades and manage positions
      - Provide trading recommendations
      - Monitor portfolio performance`,
      
      tools: [
        tradingTools(),
        marketDataTools(),
        portfolioAnalysisTools()
      ],
      
      behaviors: [
        filterMessages(filter => 
          filter.isText() && 
          this.isTradeRelated(filter.content)
        ),
        riskManagement(),
        tradingSignals()
      ]
    })
  }
  
  private isTradeRelated(content: string): boolean {
    const tradingKeywords = [
      'trade', 'buy', 'sell', 'swap', 'portfolio', 
      'price', 'market', 'analysis', 'position'
    ]
    return tradingKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }
}
```

### Agent State Management

```typescript
// Advanced state management for complex agents
export class AgentStateManager {
  private state = new Map<string, any>()
  private stateHistory: Array<{ timestamp: number; state: any }> = []
  private persistenceAdapter: PersistenceAdapter
  
  constructor(persistenceAdapter: PersistenceAdapter) {
    this.persistenceAdapter = persistenceAdapter
  }
  
  async setState(key: string, value: any): Promise<void> {
    const previousValue = this.state.get(key)
    this.state.set(key, value)
    
    // Record state change
    this.stateHistory.push({
      timestamp: Date.now(),
      state: { key, value, previousValue }
    })
    
    // Persist state
    await this.persistenceAdapter.save(key, value)
    
    // Emit state change event
    this.emit('stateChanged', { key, value, previousValue })
  }
  
  getState(key: string): any {
    return this.state.get(key)
  }
  
  async restoreState(): Promise<void> {
    const persistedState = await this.persistenceAdapter.loadAll()
    
    for (const [key, value] of Object.entries(persistedState)) {
      this.state.set(key, value)
    }
  }
  
  getStateSnapshot(): Record<string, any> {
    return Object.fromEntries(this.state)
  }
  
  async rollbackToTimestamp(timestamp: number): Promise<void> {
    const targetStateIndex = this.stateHistory.findIndex(
      entry => entry.timestamp <= timestamp
    )
    
    if (targetStateIndex === -1) {
      throw new Error('No state found for timestamp')
    }
    
    // Rebuild state up to target timestamp
    this.state.clear()
    
    for (let i = 0; i <= targetStateIndex; i++) {
      const { state } = this.stateHistory[i]
      this.state.set(state.key, state.value)
    }
    
    // Persist rolled back state
    await this.persistenceAdapter.saveAll(this.getStateSnapshot())
  }
}

// Usage in agent
class StatefulAgent extends Agent {
  private stateManager: AgentStateManager
  
  constructor(config: AgentConfig) {
    super(config)
    this.stateManager = new AgentStateManager(
      new DatabasePersistenceAdapter()
    )
  }
  
  async start(): Promise<void> {
    await this.stateManager.restoreState()
    await super.start()
  }
  
  async processMessage(message: Message): Promise<ProcessingResult> {
    // Update conversation state
    await this.stateManager.setState(
      `conversation:${message.conversation.id}:lastMessage`,
      message
    )
    
    // Update user interaction count
    const userKey = `user:${message.sender}:messageCount`
    const currentCount = this.stateManager.getState(userKey) || 0
    await this.stateManager.setState(userKey, currentCount + 1)
    
    return super.processMessage(message)
  }
}
```

## Performance Optimization Strategies

### Message Processing Optimization

```typescript
// Optimize message processing pipeline
export class OptimizedMessageProcessor {
  private processingQueue = new PriorityQueue<Message>()
  private batchProcessor: BatchProcessor
  private cache: LRUCache<string, ProcessingResult>
  
  constructor() {
    this.batchProcessor = new BatchProcessor({
      batchSize: 10,
      maxWaitTime: 1000
    })
    
    this.cache = new LRUCache({
      max: 1000,
      ttl: 300000 // 5 minutes
    })
  }
  
  async processMessage(message: Message): Promise<ProcessingResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(message)
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }
    
    // Add to priority queue
    const priority = this.calculatePriority(message)
    this.processingQueue.enqueue(message, priority)
    
    // Process in batches for efficiency
    return this.batchProcessor.process(message)
  }
  
  private generateCacheKey(message: Message): string {
    // Create cache key based on message content and context
    const contentHash = this.hashContent(message.content)
    const contextHash = this.hashContext(message.conversation)
    return `${contentHash}:${contextHash}`
  }
  
  private calculatePriority(message: Message): number {
    let priority = 0
    
    // Higher priority for direct messages
    if (!message.conversation.isGroup) priority += 10
    
    // Higher priority for urgent keywords
    const urgentKeywords = ['urgent', 'emergency', 'help', 'error']
    if (urgentKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    )) {
      priority += 20
    }
    
    // Higher priority for VIP users
    if (this.isVIPUser(message.sender)) priority += 15
    
    return priority
  }
}

// Batch processing for efficiency
class BatchProcessor {
  private batch: Message[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  
  constructor(private config: {
    batchSize: number
    maxWaitTime: number
  }) {}
  
  async process(message: Message): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      this.batch.push({
        ...message,
        resolve,
        reject
      } as any)
      
      if (this.batch.length >= this.config.batchSize) {
        this.processBatch()
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch()
        }, this.config.maxWaitTime)
      }
    })
  }
  
  private async processBatch(): Promise<void> {
    if (this.batch.length === 0) return
    
    const currentBatch = [...this.batch]
    this.batch = []
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    
    try {
      // Process all messages in parallel
      const results = await Promise.all(
        currentBatch.map(msg => this.processIndividualMessage(msg))
      )
      
      // Resolve all promises
      currentBatch.forEach((msg, index) => {
        msg.resolve(results[index])
      })
    } catch (error) {
      // Reject all promises
      currentBatch.forEach(msg => {
        msg.reject(error)
      })
    }
  }
}
```

### Memory Management

```typescript
// Memory-efficient agent implementation
export class MemoryEfficientAgent extends Agent {
  private messageBuffer: CircularBuffer<Message>
  private contextCompressor: ContextCompressor
  private memoryMonitor: MemoryMonitor
  
  constructor(config: AgentConfig) {
    super(config)
    
    this.messageBuffer = new CircularBuffer(1000) // Keep last 1000 messages
    this.contextCompressor = new ContextCompressor()
    this.memoryMonitor = new MemoryMonitor()
    
    // Set up memory monitoring
    this.memoryMonitor.on('highMemoryUsage', () => {
      this.performMemoryCleanup()
    })
  }
  
  async processMessage(message: Message): Promise<ProcessingResult> {
    // Add to circular buffer (automatically removes old messages)
    this.messageBuffer.add(message)
    
    // Compress context if needed
    const context = await this.getCompressedContext(message)
    
    // Process with compressed context
    return super.processMessage(message, context)
  }
  
  private async getCompressedContext(message: Message): Promise<any> {
    const recentMessages = this.messageBuffer.getRecent(50)
    
    // Compress context to reduce memory usage
    return this.contextCompressor.compress({
      recentMessages,
      conversation: message.conversation,
      userProfile: await this.getUserProfile(message.sender)
    })
  }
  
  private async performMemoryCleanup(): Promise<void> {
    // Clear old cache entries
    this.cache.clear()
    
    // Compress message buffer
    this.messageBuffer.compress()
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    console.log('Memory cleanup performed')
  }
}

class CircularBuffer<T> {
  private buffer: T[] = []
  private head = 0
  private size = 0
  
  constructor(private capacity: number) {}
  
  add(item: T): void {
    this.buffer[this.head] = item
    this.head = (this.head + 1) % this.capacity
    
    if (this.size < this.capacity) {
      this.size++
    }
  }
  
  getRecent(count: number): T[] {
    const result: T[] = []
    const actualCount = Math.min(count, this.size)
    
    for (let i = 0; i < actualCount; i++) {
      const index = (this.head - 1 - i + this.capacity) % this.capacity
      result.unshift(this.buffer[index])
    }
    
    return result
  }
  
  compress(): void {
    // Remove every other item to reduce memory usage
    const compressed: T[] = []
    
    for (let i = 0; i < this.size; i += 2) {
      const index = (this.head - this.size + i + this.capacity) % this.capacity
      compressed.push(this.buffer[index])
    }
    
    this.buffer = compressed
    this.size = compressed.length
    this.head = 0
  }
}
```

## Debugging and Troubleshooting

### Advanced Debugging Tools

```typescript
// Comprehensive debugging system
export class AgentDebugger {
  private logs: DebugLog[] = []
  private breakpoints = new Set<string>()
  private watchers = new Map<string, (value: any) => void>()
  
  constructor(private agent: Agent) {
    this.setupDebugHooks()
  }
  
  private setupDebugHooks(): void {
    // Hook into message processing
    const originalProcessMessage = this.agent.processMessage.bind(this.agent)
    this.agent.processMessage = async (message: Message) => {
      this.log('message-received', { message })
      
      if (this.breakpoints.has('message-processing')) {
        await this.triggerBreakpoint('message-processing', { message })
      }
      
      try {
        const result = await originalProcessMessage(message)
        this.log('message-processed', { message, result })
        return result
      } catch (error) {
        this.log('message-error', { message, error })
        throw error
      }
    }
    
    // Hook into tool calls
    this.agent.on('toolCall', (toolName, params) => {
      this.log('tool-call', { toolName, params })
      
      if (this.breakpoints.has(`tool:${toolName}`)) {
        this.triggerBreakpoint(`tool:${toolName}`, { toolName, params })
      }
    })
    
    // Hook into state changes
    this.agent.on('stateChanged', (change) => {
      this.log('state-change', change)
      
      const watcher = this.watchers.get(change.key)
      if (watcher) {
        watcher(change.value)
      }
    })
  }
  
  log(type: string, data: any): void {
    const logEntry: DebugLog = {
      timestamp: Date.now(),
      type,
      data,
      stackTrace: new Error().stack
    }
    
    this.logs.push(logEntry)
    
    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs.splice(0, this.logs.length - 10000)
    }
  }
  
  setBreakpoint(id: string): void {
    this.breakpoints.add(id)
    console.log(`Breakpoint set: ${id}`)
  }
  
  removeBreakpoint(id: string): void {
    this.breakpoints.delete(id)
    console.log(`Breakpoint removed: ${id}`)
  }
  
  watch(key: string, callback: (value: any) => void): void {
    this.watchers.set(key, callback)
    console.log(`Watcher set for: ${key}`)
  }
  
  private async triggerBreakpoint(id: string, context: any): Promise<void> {
    console.log(`🔴 Breakpoint hit: ${id}`)
    console.log('Context:', context)
    console.log('Recent logs:', this.logs.slice(-10))
    
    // In a real implementation, this would pause execution
    // and allow inspection of the agent state
    await this.waitForContinue()
  }
  
  private async waitForContinue(): Promise<void> {
    // Simplified - in practice, this would integrate with a debugger UI
    return new Promise(resolve => {
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      rl.question('Press Enter to continue...', () => {
        rl.close()
        resolve()
      })
    })
  }
  
  getLogs(filter?: {
    type?: string
    since?: number
    limit?: number
  }): DebugLog[] {
    let filteredLogs = this.logs
    
    if (filter?.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filter.type)
    }
    
    if (filter?.since) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!)
    }
    
    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(-filter.limit)
    }
    
    return filteredLogs
  }
  
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2)
    } else {
      // CSV export
      const headers = ['timestamp', 'type', 'data']
      const rows = this.logs.map(log => [
        log.timestamp,
        log.type,
        JSON.stringify(log.data)
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }
}

interface DebugLog {
  timestamp: number
  type: string
  data: any
  stackTrace?: string
}

// Usage
const agent = new Agent(config)
const debugger = new AgentDebugger(agent)

// Set breakpoints
debugger.setBreakpoint('message-processing')
debugger.setBreakpoint('tool:sendTransaction')

// Watch state changes
debugger.watch('user:balance', (balance) => {
  console.log(`User balance changed: ${balance}`)
})

// Export logs for analysis
const logs = debugger.exportLogs('json')
fs.writeFileSync('agent-debug.json', logs)
```

### Performance Profiling

```typescript
// Performance profiling for agents
export class AgentProfiler {
  private metrics = new Map<string, PerformanceMetric>()
  private activeTimers = new Map<string, number>()
  
  startTimer(name: string): void {
    this.activeTimers.set(name, performance.now())
  }
  
  endTimer(name: string): number {
    const startTime = this.activeTimers.get(name)
    if (!startTime) {
      throw new Error(`Timer ${name} not found`)
    }
    
    const duration = performance.now() - startTime
    this.activeTimers.delete(name)
    
    this.recordMetric(name, duration)
    return duration
  }
  
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        average: 0
      })
    }
    
    const metric = this.metrics.get(name)!
    metric.count++
    metric.total += value
    metric.min = Math.min(metric.min, value)
    metric.max = Math.max(metric.max, value)
    metric.average = metric.total / metric.count
  }
  
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }
  
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name)
  }
  
  reset(): void {
    this.metrics.clear()
    this.activeTimers.clear()
  }
  
  generateReport(): string {
    const metrics = this.getMetrics()
    
    let report = 'Performance Report\n'
    report += '==================\n\n'
    
    metrics.forEach(metric => {
      report += `${metric.name}:\n`
      report += `  Count: ${metric.count}\n`
      report += `  Average: ${metric.average.toFixed(2)}ms\n`
      report += `  Min: ${metric.min.toFixed(2)}ms\n`
      report += `  Max: ${metric.max.toFixed(2)}ms\n`
      report += `  Total: ${metric.total.toFixed(2)}ms\n\n`
    })
    
    return report
  }
}

interface PerformanceMetric {
  name: string
  count: number
  total: number
  min: number
  max: number
  average: number
}

// Profiling decorator
function profile(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const metricName = name || `${target.constructor.name}.${propertyKey}`
    
    descriptor.value = async function (...args: any[]) {
      const profiler = this.profiler || globalProfiler
      
      profiler.startTimer(metricName)
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        profiler.endTimer(metricName)
      }
    }
    
    return descriptor
  }
}

// Usage
class ProfiledAgent extends Agent {
  private profiler = new AgentProfiler()
  
  @profile('message-processing')
  async processMessage(message: Message): Promise<ProcessingResult> {
    return super.processMessage(message)
  }
  
  @profile('ai-generation')
  async generateResponse(context: any): Promise<string> {
    return super.generateResponse(context)
  }
  
  getPerformanceReport(): string {
    return this.profiler.generateReport()
  }
}
```

## Integration Testing Patterns

### End-to-End Testing

```typescript
// Comprehensive end-to-end testing
export class E2ETestSuite {
  private testEnvironment: TestEnvironment
  private agents: Map<string, Agent> = new Map()
  
  async setup(): Promise<void> {
    this.testEnvironment = await TestEnvironment.create({
      isolated: true,
      mockExternalServices: true
    })
  }
  
  async teardown(): Promise<void> {
    await this.testEnvironment.cleanup()
  }
  
  async testCompleteWorkflow(): Promise<void> {
    // Create test agents
    const tradingAgent = await this.createTradingAgent()
    const supportAgent = await this.createSupportAgent()
    
    // Test scenario: User asks for trading advice
    const user = this.testEnvironment.createUser()
    
    // 1. User sends message
    const message = await user.sendMessage("I want to buy some ETH")
    
    // 2. Verify routing to trading agent
    const routedAgent = await this.testEnvironment.waitForRouting(message)
    expect(routedAgent.name).toBe('trading')
    
    // 3. Verify trading agent processes message
    const response = await this.testEnvironment.waitForResponse(message.id)
    expect(response.content).toContain('ETH')
    expect(response.content).toContain('buy')
    
    // 4. Test tool execution
    const toolCalls = await this.testEnvironment.getToolCalls(message.id)
    expect(toolCalls.some(call => call.name === 'getMarketData')).toBe(true)
    
    // 5. Test follow-up interaction
    const followUp = await user.sendMessage("What's the current price?")
    const priceResponse = await this.testEnvironment.waitForResponse(followUp.id)
    expect(priceResponse.content).toMatch(/\$[\d,]+/)
  }
  
  async testErrorHandling(): Promise<void> {
    const agent = await this.createTradingAgent()
    
    // Simulate API failure
    this.testEnvironment.mockService('marketData', {
      shouldFail: true,
      error: new Error('API unavailable')
    })
    
    const user = this.testEnvironment.createUser()
    const message = await user.sendMessage("What's the ETH price?")
    
    const response = await this.testEnvironment.waitForResponse(message.id)
    
    // Verify graceful error handling
    expect(response.content).toContain('unable to fetch')
    expect(response.content).not.toContain('Error:')
  }
  
  async testMultiAgentCoordination(): Promise<void> {
    const tradingAgent = await this.createTradingAgent()
    const supportAgent = await this.createSupportAgent()
    
    const user = this.testEnvironment.createUser()
    
    // Send complex message that requires both agents
    const message = await user.sendMessage(
      "I'm having trouble with my trading bot, can you help me fix it and also check my portfolio?"
    )
    
    // Verify both agents are involved
    const responses = await this.testEnvironment.waitForMultipleResponses(message.id)
    
    expect(responses).toHaveLength(2)
    expect(responses.some(r => r.agent === 'support')).toBe(true)
    expect(responses.some(r => r.agent === 'trading')).toBe(true)
  }
  
  private async createTradingAgent(): Promise<Agent> {
    const agent = new Agent({
      name: 'trading',
      model: this.testEnvironment.getMockModel('trading'),
      instructions: 'You are a trading assistant',
      tools: [
        this.testEnvironment.getMockTool('getMarketData'),
        this.testEnvironment.getMockTool('executeTrade')
      ]
    })
    
    this.agents.set('trading', agent)
    await agent.start()
    
    return agent
  }
  
  private async createSupportAgent(): Promise<Agent> {
    const agent = new Agent({
      name: 'support',
      model: this.testEnvironment.getMockModel('support'),
      instructions: 'You are a support assistant',
      tools: [
        this.testEnvironment.getMockTool('createTicket'),
        this.testEnvironment.getMockTool('searchKnowledgeBase')
      ]
    })
    
    this.agents.set('support', agent)
    await agent.start()
    
    return agent
  }
}

// Test runner
describe('Hybrid Agent E2E Tests', () => {
  let testSuite: E2ETestSuite
  
  beforeEach(async () => {
    testSuite = new E2ETestSuite()
    await testSuite.setup()
  })
  
  afterEach(async () => {
    await testSuite.teardown()
  })
  
  it('should handle complete trading workflow', async () => {
    await testSuite.testCompleteWorkflow()
  })
  
  it('should handle errors gracefully', async () => {
    await testSuite.testErrorHandling()
  })
  
  it('should coordinate multiple agents', async () => {
    await testSuite.testMultiAgentCoordination()
  })
})
```

## Next Steps

- Learn about [Deployment](/developing/deployment) for production deployment
- Explore [Contributing](/developing/contributing) for contribution guidelines
- Check out [Framework Development](/developing/framework) for core development
- See [Plugin System](/developing/plugins) for extending functionality
