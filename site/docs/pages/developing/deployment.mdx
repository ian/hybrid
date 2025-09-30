---
title: Deployment
description: Production environment setup, hosting, monitoring, and scaling strategies
---

# Deployment

Learn how to deploy Hybrid agents to production environments with proper monitoring, scaling, and maintenance strategies.

## Production Environment Setup

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production

# XMTP Configuration
XMTP_WALLET_KEY=your_production_wallet_private_key
XMTP_DB_ENCRYPTION_KEY=your_production_encryption_key
XMTP_NETWORK=production

# AI Provider Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-api-key

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://user:password@host:port

# Monitoring and Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_api_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm install -g pnpm && pnpm build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hybrid

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER hybrid

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  hybrid-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/hybrid
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hybrid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - hybrid-agent
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Hosting Provider Configuration

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "dist/index.js": {
      "maxDuration": 30
    }
  }
}
```

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod
```

### Railway Deployment

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

```bash
# Deploy to Railway
npm install -g @railway/cli
railway login
railway deploy
```

### AWS ECS Deployment

```json
// task-definition.json
{
  "family": "hybrid-agent",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "hybrid-agent",
      "image": "your-account.dkr.ecr.region.amazonaws.com/hybrid-agent:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "XMTP_WALLET_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:hybrid/wallet-key"
        },
        {
          "name": "OPENROUTER_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:hybrid/openrouter-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hybrid-agent",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hybrid-agent
  labels:
    app: hybrid-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hybrid-agent
  template:
    metadata:
      labels:
        app: hybrid-agent
    spec:
      containers:
      - name: hybrid-agent
        image: hybrid-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hybrid-secrets
              key: database-url
        - name: XMTP_WALLET_KEY
          valueFrom:
            secretKeyRef:
              name: hybrid-secrets
              key: xmtp-wallet-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: hybrid-agent-service
spec:
  selector:
    app: hybrid-agent
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
apiVersion: v1
kind: Secret
metadata:
  name: hybrid-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  xmtp-wallet-key: <base64-encoded-wallet-key>
```

## Environment Variable Management

### Secure Secret Management

```typescript
// Secret management utility
export class SecretManager {
  private secrets = new Map<string, string>()
  
  constructor(private provider: 'aws' | 'gcp' | 'azure' | 'vault') {}
  
  async loadSecrets(): Promise<void> {
    switch (this.provider) {
      case 'aws':
        await this.loadFromAWSSecretsManager()
        break
      case 'gcp':
        await this.loadFromGCPSecretManager()
        break
      case 'azure':
        await this.loadFromAzureKeyVault()
        break
      case 'vault':
        await this.loadFromHashiCorpVault()
        break
    }
  }
  
  getSecret(key: string): string {
    const secret = this.secrets.get(key)
    if (!secret) {
      throw new Error(`Secret ${key} not found`)
    }
    return secret
  }
  
  private async loadFromAWSSecretsManager(): Promise<void> {
    const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
    
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1'
    })
    
    const secretNames = [
      'hybrid/wallet-key',
      'hybrid/openrouter-key',
      'hybrid/database-url'
    ]
    
    for (const secretName of secretNames) {
      try {
        const command = new GetSecretValueCommand({ SecretId: secretName })
        const response = await client.send(command)
        
        if (response.SecretString) {
          const secretData = JSON.parse(response.SecretString)
          for (const [key, value] of Object.entries(secretData)) {
            this.secrets.set(key, value as string)
          }
        }
      } catch (error) {
        console.error(`Failed to load secret ${secretName}:`, error)
      }
    }
  }
}

// Usage in application
const secretManager = new SecretManager('aws')
await secretManager.loadSecrets()

const agent = new Agent({
  model: createOpenRouter({
    apiKey: secretManager.getSecret('OPENROUTER_API_KEY')
  })("openai/gpt-4"),
  
  xmtp: {
    walletKey: secretManager.getSecret('XMTP_WALLET_KEY'),
    encryptionKey: secretManager.getSecret('XMTP_DB_ENCRYPTION_KEY')
  }
})
```

### Environment-Specific Configuration

```typescript
// Configuration management
export class ConfigManager {
  private config: any
  
  constructor() {
    this.loadConfig()
  }
  
  private loadConfig(): void {
    const env = process.env.NODE_ENV || 'development'
    
    const baseConfig = {
      app: {
        name: 'Hybrid Agent',
        version: process.env.npm_package_version || '1.0.0',
        port: parseInt(process.env.PORT || '3000')
      },
      
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: env === 'production' ? 'json' : 'pretty'
      },
      
      xmtp: {
        network: env === 'production' ? 'production' : 'dev'
      },
      
      database: {
        url: process.env.DATABASE_URL,
        ssl: env === 'production',
        pool: {
          min: 2,
          max: 10
        }
      },
      
      redis: {
        url: process.env.REDIS_URL,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      }
    }
    
    const envConfig = this.getEnvironmentConfig(env)
    this.config = { ...baseConfig, ...envConfig }
  }
  
  private getEnvironmentConfig(env: string): any {
    switch (env) {
      case 'production':
        return {
          logging: {
            level: 'warn'
          },
          
          rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
          },
          
          security: {
            cors: {
              origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
              credentials: true
            },
            helmet: {
              contentSecurityPolicy: {
                directives: {
                  defaultSrc: ["'self'"],
                  styleSrc: ["'self'", "'unsafe-inline'"],
                  scriptSrc: ["'self'"],
                  imgSrc: ["'self'", "data:", "https:"]
                }
              }
            }
          }
        }
      
      case 'staging':
        return {
          logging: {
            level: 'debug'
          },
          
          rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
          }
        }
      
      case 'development':
      default:
        return {
          logging: {
            level: 'debug'
          },
          
          cors: {
            origin: true
          }
        }
    }
  }
  
  get(path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config)
  }
}

// Usage
const config = new ConfigManager()

const app = express()
app.use(cors(config.get('security.cors')))
app.use(helmet(config.get('security.helmet')))
```

## Monitoring and Logging

### Application Monitoring

```typescript
// Comprehensive monitoring setup
export class MonitoringService {
  private metrics: any
  private logger: any
  
  constructor() {
    this.setupMetrics()
    this.setupLogging()
    this.setupHealthChecks()
  }
  
  private setupMetrics(): void {
    const client = require('prom-client')
    
    // Create a Registry
    const register = new client.Registry()
    
    // Add default metrics
    client.collectDefaultMetrics({ register })
    
    // Custom metrics
    this.metrics = {
      messageProcessingDuration: new client.Histogram({
        name: 'hybrid_message_processing_duration_seconds',
        help: 'Duration of message processing in seconds',
        labelNames: ['agent_name', 'message_type'],
        buckets: [0.1, 0.5, 1, 2, 5, 10]
      }),
      
      messageProcessingTotal: new client.Counter({
        name: 'hybrid_messages_processed_total',
        help: 'Total number of messages processed',
        labelNames: ['agent_name', 'status']
      }),
      
      activeConnections: new client.Gauge({
        name: 'hybrid_active_connections',
        help: 'Number of active XMTP connections'
      }),
      
      toolCallsTotal: new client.Counter({
        name: 'hybrid_tool_calls_total',
        help: 'Total number of tool calls',
        labelNames: ['tool_name', 'status']
      }),
      
      aiModelLatency: new client.Histogram({
        name: 'hybrid_ai_model_latency_seconds',
        help: 'AI model response latency in seconds',
        labelNames: ['model_provider', 'model_name'],
        buckets: [0.5, 1, 2, 5, 10, 30]
      })
    }
    
    // Register metrics
    Object.values(this.metrics).forEach(metric => register.register(metric))
    
    this.metrics.register = register
  }
  
  private setupLogging(): void {
    const winston = require('winston')
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
      ),
      
      transports: [
        new winston.transports.Console(),
        
        // File transport for production
        ...(process.env.NODE_ENV === 'production' ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
          }),
          new winston.transports.File({
            filename: 'logs/combined.log'
          })
        ] : [])
      ]
    })
    
    // Add Sentry for error tracking
    if (process.env.SENTRY_DSN) {
      const Sentry = require('@sentry/node')
      
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV
      })
      
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(info => {
            if (info.level === 'error') {
              Sentry.captureException(info.error || new Error(info.message))
            }
            return `${info.timestamp} ${info.level}: ${info.message}`
          })
        )
      }))
    }
  }
  
  private setupHealthChecks(): void {
    // Health check endpoint
    const express = require('express')
    const app = express()
    
    app.get('/health', async (req, res) => {
      const health = await this.getHealthStatus()
      const status = health.status === 'healthy' ? 200 : 503
      res.status(status).json(health)
    })
    
    app.get('/metrics', (req, res) => {
      res.set('Content-Type', this.metrics.register.contentType)
      res.end(this.metrics.register.metrics())
    })
    
    const port = process.env.HEALTH_CHECK_PORT || 3001
    app.listen(port, () => {
      this.logger.info(`Health check server running on port ${port}`)
    })
  }
  
  async getHealthStatus(): Promise<any> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkXMTP(),
      this.checkAIProviders()
    ])
    
    const results = checks.map((check, index) => ({
      name: ['database', 'redis', 'xmtp', 'ai_providers'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      error: check.status === 'rejected' ? check.reason.message : undefined
    }))
    
    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy'
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    }
  }
  
  recordMessageProcessing(agentName: string, messageType: string, duration: number, success: boolean): void {
    this.metrics.messageProcessingDuration
      .labels(agentName, messageType)
      .observe(duration)
    
    this.metrics.messageProcessingTotal
      .labels(agentName, success ? 'success' : 'error')
      .inc()
  }
  
  recordToolCall(toolName: string, success: boolean): void {
    this.metrics.toolCallsTotal
      .labels(toolName, success ? 'success' : 'error')
      .inc()
  }
  
  recordAIModelLatency(provider: string, model: string, latency: number): void {
    this.metrics.aiModelLatency
      .labels(provider, model)
      .observe(latency)
  }
  
  log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta)
  }
}

// Usage in agent
const monitoring = new MonitoringService()

class MonitoredAgent extends Agent {
  async processMessage(message: Message): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      const result = await super.processMessage(message)
      
      const duration = (Date.now() - startTime) / 1000
      monitoring.recordMessageProcessing(
        this.name,
        message.type,
        duration,
        true
      )
      
      return result
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000
      monitoring.recordMessageProcessing(
        this.name,
        message.type,
        duration,
        false
      )
      
      monitoring.log('error', 'Message processing failed', {
        agentName: this.name,
        messageId: message.id,
        error: error.message
      })
      
      throw error
    }
  }
}
```

### Log Aggregation

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.8.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash

volumes:
  elasticsearch_data:
```

## Scaling and Load Balancing

### Horizontal Scaling

```typescript
// Load balancer for multiple agent instances
export class AgentLoadBalancer {
  private agents: Array<{ id: string; instance: Agent; load: number }> = []
  private roundRobinIndex = 0
  
  addAgent(agent: Agent): void {
    this.agents.push({
      id: agent.id,
      instance: agent,
      load: 0
    })
  }
  
  removeAgent(agentId: string): void {
    this.agents = this.agents.filter(a => a.id !== agentId)
  }
  
  async routeMessage(message: Message): Promise<ProcessingResult> {
    const agent = this.selectAgent(message)
    
    if (!agent) {
      throw new Error('No available agents')
    }
    
    try {
      agent.load++
      const result = await agent.instance.processMessage(message)
      return result
    } finally {
      agent.load--
    }
  }
  
  private selectAgent(message: Message): any {
    if (this.agents.length === 0) return null
    
    // Strategy: Least connections
    return this.agents.reduce((least, current) => 
      current.load < least.load ? current : least
    )
  }
  
  getStats(): any {
    return {
      totalAgents: this.agents.length,
      averageLoad: this.agents.reduce((sum, a) => sum + a.load, 0) / this.agents.length,
      agents: this.agents.map(a => ({
        id: a.id,
        load: a.load,
        status: a.instance.isRunning ? 'running' : 'stopped'
      }))
    }
  }
}

// Auto-scaling based on load
export class AutoScaler {
  private loadBalancer: AgentLoadBalancer
  private targetLoad = 0.7 // 70% target load
  private scaleUpThreshold = 0.8 // Scale up at 80%
  private scaleDownThreshold = 0.3 // Scale down at 30%
  
  constructor(loadBalancer: AgentLoadBalancer) {
    this.loadBalancer = loadBalancer
    this.startMonitoring()
  }
  
  private startMonitoring(): void {
    setInterval(() => {
      this.checkAndScale()
    }, 30000) // Check every 30 seconds
  }
  
  private async checkAndScale(): Promise<void> {
    const stats = this.loadBalancer.getStats()
    
    if (stats.averageLoad > this.scaleUpThreshold) {
      await this.scaleUp()
    } else if (stats.averageLoad < this.scaleDownThreshold && stats.totalAgents > 1) {
      await this.scaleDown()
    }
  }
  
  private async scaleUp(): Promise<void> {
    console.log('Scaling up: Creating new agent instance')
    
    const newAgent = new Agent({
      // Agent configuration
    })
    
    await newAgent.start()
    this.loadBalancer.addAgent(newAgent)
    
    console.log(`Scaled up to ${this.loadBalancer.getStats().totalAgents} agents`)
  }
  
  private async scaleDown(): Promise<void> {
    const stats = this.loadBalancer.getStats()
    const agentToRemove = stats.agents.find(a => a.load === 0)
    
    if (agentToRemove) {
      console.log(`Scaling down: Removing agent ${agentToRemove.id}`)
      
      this.loadBalancer.removeAgent(agentToRemove.id)
      
      console.log(`Scaled down to ${this.loadBalancer.getStats().totalAgents} agents`)
    }
  }
}
```

### Database Scaling

```typescript
// Database connection pooling and read replicas
export class DatabaseManager {
  private writePool: any
  private readPools: any[] = []
  private currentReadIndex = 0
  
  constructor(config: {
    writeUrl: string
    readUrls: string[]
    poolConfig: any
  }) {
    this.setupConnections(config)
  }
  
  private setupConnections(config: any): void {
    const { Pool } = require('pg')
    
    // Write connection pool
    this.writePool = new Pool({
      connectionString: config.writeUrl,
      ...config.poolConfig
    })
    
    // Read connection pools
    this.readPools = config.readUrls.map(url => 
      new Pool({
        connectionString: url,
        ...config.poolConfig
      })
    )
  }
  
  async query(sql: string, params?: any[], options: { write?: boolean } = {}): Promise<any> {
    const pool = options.write ? this.writePool : this.getReadPool()
    
    try {
      const result = await pool.query(sql, params)
      return result.rows
    } catch (error) {
      console.error('Database query failed:', error)
      throw error
    }
  }
  
  private getReadPool(): any {
    if (this.readPools.length === 0) {
      return this.writePool
    }
    
    const pool = this.readPools[this.currentReadIndex]
    this.currentReadIndex = (this.currentReadIndex + 1) % this.readPools.length
    
    return pool
  }
  
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.writePool.connect()
    
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
```

## Next Steps

- Learn about [Contributing](/developing/contributing) for contribution guidelines
- Explore [Framework Development](/developing/framework) for core development
- Check out [Plugin System](/developing/plugins) for extending functionality
- See [Advanced Development](/developing/advanced) for complex scenarios
