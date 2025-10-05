---
title: Advanced XMTP Features
description: Message encryption, security, connection management, and address resolution
---

# Advanced XMTP Features

Explore advanced XMTP capabilities including message encryption, security, connection management, and address resolution for production Hybrid agents.

## Message Encryption and Security

XMTP provides end-to-end encryption by default, but understanding the security model helps you build more secure agents.

### Encryption Overview

XMTP uses a multi-layered encryption approach:

- **Transport Layer** - TLS encryption for network communication
- **Message Layer** - End-to-end encryption between participants
- **Key Management** - Automatic key exchange and rotation
- **Forward Secrecy** - Past messages remain secure even if keys are compromised

### Key Management

```typescript
import { Client } from "@xmtp/xmtp-js"
import { privateKeyToAccount } from "viem/accounts"

// Initialize client with encryption
const account = privateKeyToAccount(process.env.XMTP_WALLET_KEY)
const client = await Client.create(account, {
  env: "production",
  
  // Encryption options
  encryption: {
    // Use hardware security module if available
    useHSM: process.env.NODE_ENV === "production",
    
    // Key derivation options
    keyDerivation: {
      iterations: 100000,
      algorithm: "PBKDF2"
    }
  }
})
```

### Message Encryption Configuration

```typescript
// Configure encryption for sensitive agents
const agent = new Agent({
  xmtp: {
    encryption: {
      // Require encryption for all messages
      requireEncryption: true,
      
      // Use stronger encryption for sensitive data
      algorithm: "AES-256-GCM",
      
      // Automatic key rotation
      keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      
      // Verify message integrity
      verifyIntegrity: true
    }
  }
})
```

### Secure Message Handling

```typescript
// Handle sensitive information securely
class SecureMessageHandler {
  async processMessage(message: any) {
    // Verify message authenticity
    if (!await this.verifyMessageSignature(message)) {
      throw new Error("Message signature verification failed")
    }
    
    // Check for sensitive content
    if (this.containsSensitiveData(message.content)) {
      // Use secure processing
      return await this.processSecurely(message)
    }
    
    return await this.processNormally(message)
  }
  
  private async verifyMessageSignature(message: any): Promise<boolean> {
    // Implement signature verification
    return true // Simplified
  }
  
  private containsSensitiveData(content: string): boolean {
    const sensitivePatterns = [
      /private.?key/i,
      /seed.?phrase/i,
      /password/i,
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card pattern
    ]
    
    return sensitivePatterns.some(pattern => pattern.test(content))
  }
  
  private async processSecurely(message: any) {
    // Enhanced security for sensitive messages
    console.log("Processing sensitive message with enhanced security")
    
    // Don't log sensitive content
    // Use secure memory handling
    // Implement additional verification
    
    return "I've received your sensitive information and processed it securely."
  }
}
```

### Privacy Protection

```typescript
// Implement privacy protection measures
class PrivacyProtectedAgent extends Agent {
  async processMessage(message: any) {
    // Anonymize logs
    const anonymizedMessage = this.anonymizeForLogging(message)
    console.log("Processing message:", anonymizedMessage)
    
    // Process with privacy protection
    const response = await super.processMessage(message)
    
    // Ensure response doesn't leak private info
    return this.sanitizeResponse(response)
  }
  
  private anonymizeForLogging(message: any) {
    return {
      id: message.id,
      sender: message.sender.slice(0, 6) + "...", // Truncate address
      contentLength: message.content.length,
      timestamp: message.timestamp
    }
  }
  
  private sanitizeResponse(response: string): string {
    // Remove potential private information from responses
    return response
      .replace(/0x[a-fA-F0-9]{40}/g, "0x...") // Hide full addresses
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, "****") // Hide card numbers
  }
}
```

## Connection Management and Error Handling

Robust connection management ensures your agent stays online and handles network issues gracefully.

### Connection Configuration

```typescript
// Configure robust connection handling
const agent = new Agent({
  xmtp: {
    connection: {
      // Connection timeout
      timeout: 30000, // 30 seconds
      
      // Retry configuration
      retry: {
        maxAttempts: 5,
        backoffMultiplier: 2,
        initialDelay: 1000
      },
      
      // Keep-alive settings
      keepAlive: {
        enabled: true,
        interval: 30000, // 30 seconds
        timeout: 10000   // 10 seconds
      },
      
      // Connection pooling
      pool: {
        maxConnections: 10,
        idleTimeout: 300000 // 5 minutes
      }
    }
  }
})
```

### Automatic Reconnection

```typescript
class ResilientXMTPClient {
  private client: any
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  
  async connect() {
    try {
      this.client = await Client.create(this.account, {
        env: "production"
      })
      
      this.setupEventHandlers()
      this.reconnectAttempts = 0
      
      console.log("XMTP client connected successfully")
    } catch (error) {
      console.error("Failed to connect to XMTP:", error)
      await this.handleConnectionFailure()
    }
  }
  
  private setupEventHandlers() {
    this.client.on("disconnect", () => {
      console.warn("XMTP client disconnected")
      this.handleReconnection()
    })
    
    this.client.on("error", (error: Error) => {
      console.error("XMTP client error:", error)
      this.handleReconnection()
    })
  }
  
  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }
  
  private async handleConnectionFailure() {
    // Implement fallback strategies
    await this.notifyAdministrators("XMTP connection failed")
    await this.enableOfflineMode()
  }
}
```

### Error Recovery Strategies

```typescript
// Implement comprehensive error handling
class ErrorResilientAgent extends Agent {
  async sendMessage(to: string, content: string) {
    const maxRetries = 3
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.attemptSendMessage(to, content)
      } catch (error) {
        lastError = error as Error
        console.warn(`Send attempt ${attempt} failed:`, error.message)
        
        // Handle specific error types
        if (error.message.includes("rate limit")) {
          await this.handleRateLimit(attempt)
        } else if (error.message.includes("network")) {
          await this.handleNetworkError(attempt)
        } else if (error.message.includes("encryption")) {
          await this.handleEncryptionError(attempt)
        }
        
        // Exponential backoff
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }
    
    // All retries failed
    await this.handlePermanentFailure(to, content, lastError)
    throw lastError
  }
  
  private async handleRateLimit(attempt: number) {
    // Implement rate limit handling
    const backoffTime = Math.pow(2, attempt) * 5000 // Longer backoff for rate limits
    console.log(`Rate limited, backing off for ${backoffTime}ms`)
    await this.delay(backoffTime)
  }
  
  private async handleNetworkError(attempt: number) {
    // Check network connectivity
    const isOnline = await this.checkNetworkConnectivity()
    if (!isOnline) {
      console.log("Network appears to be offline, waiting...")
      await this.waitForNetworkRecovery()
    }
  }
  
  private async handleEncryptionError(attempt: number) {
    // Refresh encryption keys
    console.log("Encryption error, refreshing keys...")
    await this.refreshEncryptionKeys()
  }
  
  private async handlePermanentFailure(to: string, content: string, error: Error) {
    // Store message for later retry
    await this.storeFailedMessage(to, content, error)
    
    // Notify administrators
    await this.notifyAdministrators(`Permanent message failure: ${error.message}`)
  }
}
```

### Health Monitoring

```typescript
// Monitor agent health and connectivity
class HealthMonitor {
  private agent: Agent
  private healthChecks = new Map<string, boolean>()
  
  constructor(agent: Agent) {
    this.agent = agent
    this.startHealthChecks()
  }
  
  private startHealthChecks() {
    // Check XMTP connectivity
    setInterval(async () => {
      try {
        await this.checkXMTPConnectivity()
        this.healthChecks.set("xmtp", true)
      } catch (error) {
        this.healthChecks.set("xmtp", false)
        console.error("XMTP health check failed:", error)
      }
    }, 60000) // Every minute
    
    // Check message processing
    setInterval(async () => {
      try {
        await this.checkMessageProcessing()
        this.healthChecks.set("processing", true)
      } catch (error) {
        this.healthChecks.set("processing", false)
        console.error("Message processing health check failed:", error)
      }
    }, 300000) // Every 5 minutes
  }
  
  private async checkXMTPConnectivity() {
    // Send a test message to self
    await this.agent.call("sendMessage", {
      to: this.agent.address,
      content: "Health check ping"
    })
  }
  
  private async checkMessageProcessing() {
    // Verify message processing pipeline
    const testMessage = {
      id: "health-check",
      content: "test",
      sender: this.agent.address
    }
    
    await this.agent.processMessage(testMessage)
  }
  
  getHealthStatus() {
    const allHealthy = Array.from(this.healthChecks.values()).every(Boolean)
    return {
      healthy: allHealthy,
      checks: Object.fromEntries(this.healthChecks),
      timestamp: new Date().toISOString()
    }
  }
}
```

## Address Resolution (ENS, BaseName)

Resolve human-readable names to Ethereum addresses for better user experience.

### ENS (Ethereum Name Service) Resolution

```typescript
import { createPublicClient, http } from "viem"
import { mainnet } from "viem/chains"

class ENSResolver {
  private client: any
  
  constructor() {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http()
    })
  }
  
  async resolveENS(ensName: string): Promise<string | null> {
    try {
      const address = await this.client.getEnsAddress({
        name: ensName
      })
      return address
    } catch (error) {
      console.warn(`Failed to resolve ENS name ${ensName}:`, error)
      return null
    }
  }
  
  async reverseResolveENS(address: string): Promise<string | null> {
    try {
      const ensName = await this.client.getEnsName({
        address: address as `0x${string}`
      })
      return ensName
    } catch (error) {
      console.warn(`Failed to reverse resolve address ${address}:`, error)
      return null
    }
  }
  
  async getENSAvatar(ensName: string): Promise<string | null> {
    try {
      const avatar = await this.client.getEnsAvatar({
        name: ensName
      })
      return avatar
    } catch (error) {
      console.warn(`Failed to get ENS avatar for ${ensName}:`, error)
      return null
    }
  }
}
```

### BaseName Resolution

```typescript
import { base } from "viem/chains"

class BaseNameResolver {
  private client: any
  
  constructor() {
    this.client = createPublicClient({
      chain: base,
      transport: http()
    })
  }
  
  async resolveBaseName(baseName: string): Promise<string | null> {
    try {
      // BaseName resolution (similar to ENS but on Base chain)
      const address = await this.client.getEnsAddress({
        name: baseName
      })
      return address
    } catch (error) {
      console.warn(`Failed to resolve BaseName ${baseName}:`, error)
      return null
    }
  }
}
```

### Universal Address Resolution

```typescript
// Universal resolver that handles multiple naming services
class UniversalAddressResolver {
  private ensResolver = new ENSResolver()
  private baseNameResolver = new BaseNameResolver()
  
  async resolveAddress(identifier: string): Promise<string | null> {
    // If it's already an address, return it
    if (this.isValidAddress(identifier)) {
      return identifier
    }
    
    // Try ENS first
    if (identifier.endsWith(".eth")) {
      return await this.ensResolver.resolveENS(identifier)
    }
    
    // Try BaseName
    if (identifier.endsWith(".base.eth")) {
      return await this.baseNameResolver.resolveBaseName(identifier)
    }
    
    // Try both if no clear indicator
    const ensResult = await this.ensResolver.resolveENS(identifier + ".eth")
    if (ensResult) return ensResult
    
    const baseResult = await this.baseNameResolver.resolveBaseName(identifier + ".base.eth")
    if (baseResult) return baseResult
    
    return null
  }
  
  async getDisplayName(address: string): Promise<string> {
    // Try to get a human-readable name for an address
    const ensName = await this.ensResolver.reverseResolveENS(address)
    if (ensName) return ensName
    
    // Fallback to shortened address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  private isValidAddress(str: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(str)
  }
}
```

### Integration with Agent

```typescript
// Integrate address resolution into agent
class AddressAwareAgent extends Agent {
  private resolver = new UniversalAddressResolver()
  
  async processMessage(message: any) {
    // Resolve any names mentioned in the message
    const resolvedMessage = await this.resolveNamesInMessage(message)
    
    return super.processMessage(resolvedMessage)
  }
  
  private async resolveNamesInMessage(message: any) {
    let content = message.content
    
    // Find potential ENS names
    const ensPattern = /\b\w+\.eth\b/g
    const ensMatches = content.match(ensPattern) || []
    
    for (const ensName of ensMatches) {
      const address = await this.resolver.resolveAddress(ensName)
      if (address) {
        content = content.replace(ensName, `${ensName} (${address})`)
      }
    }
    
    return {
      ...message,
      content,
      resolvedAddresses: ensMatches
    }
  }
  
  async sendMessageToName(name: string, content: string) {
    const address = await this.resolver.resolveAddress(name)
    if (!address) {
      throw new Error(`Could not resolve address for ${name}`)
    }
    
    return this.call("sendMessage", {
      to: address,
      content
    })
  }
}

// Usage
const agent = new AddressAwareAgent({...})

// Send message using ENS name
await agent.sendMessageToName("vitalik.eth", "Hello Vitalik!")

// Send message using BaseName
await agent.sendMessageToName("alice.base.eth", "Hello Alice!")
```

### Caching and Performance

```typescript
// Cache resolved addresses for performance
class CachedAddressResolver extends UniversalAddressResolver {
  private cache = new Map<string, { address: string | null, timestamp: number }>()
  private cacheTimeout = 24 * 60 * 60 * 1000 // 24 hours
  
  async resolveAddress(identifier: string): Promise<string | null> {
    // Check cache first
    const cached = this.cache.get(identifier)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.address
    }
    
    // Resolve and cache
    const address = await super.resolveAddress(identifier)
    this.cache.set(identifier, {
      address,
      timestamp: Date.now()
    })
    
    return address
  }
  
  clearCache() {
    this.cache.clear()
  }
  
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}
```

## Performance Optimization

### Message Batching

```typescript
// Batch messages for better performance
class MessageBatcher {
  private batch: Array<{to: string, content: string}> = []
  private batchTimeout: NodeJS.Timeout | null = null
  private maxBatchSize = 10
  private maxBatchDelay = 5000 // 5 seconds
  
  add(to: string, content: string) {
    this.batch.push({ to, content })
    
    if (this.batch.length >= this.maxBatchSize) {
      this.flush()
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flush(), this.maxBatchDelay)
    }
  }
  
  private async flush() {
    if (this.batch.length === 0) return
    
    const messages = [...this.batch]
    this.batch = []
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    
    // Send all messages in parallel
    await Promise.all(
      messages.map(msg => 
        agent.call("sendMessage", msg)
      )
    )
  }
}
```

### Connection Pooling

```typescript
// Pool XMTP connections for better resource usage
class XMTPConnectionPool {
  private connections: Array<any> = []
  private maxConnections = 5
  private currentIndex = 0
  
  async getConnection() {
    if (this.connections.length < this.maxConnections) {
      const connection = await this.createConnection()
      this.connections.push(connection)
      return connection
    }
    
    // Round-robin selection
    const connection = this.connections[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.connections.length
    return connection
  }
  
  private async createConnection() {
    return await Client.create(this.account, {
      env: "production"
    })
  }
  
  async closeAll() {
    await Promise.all(
      this.connections.map(conn => conn.close())
    )
    this.connections = []
  }
}
```

## Next Steps

- Learn about [Mini Apps](/mini-apps) for mini app integration
- Explore [Blockchain Tools](/tools/blockchain) for crypto functionality
- Check out [Tools](/tools) for creating custom agent capabilities
- See [Developing](/developing/contributing) for advanced development
