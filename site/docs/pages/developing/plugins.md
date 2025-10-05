---
title: Plugin System
description: Creating and publishing plugins for the Hybrid ecosystem
---

# Plugin System

Learn how to create, develop, and publish plugins that extend the Hybrid framework ecosystem.

## Plugin Architecture Overview

The Hybrid plugin system allows developers to extend the framework with custom functionality while maintaining compatibility and ease of use.

### Plugin Types

```typescript
// Core plugin types
export type PluginType = 
  | 'behavior'      // Message processing behaviors
  | 'tool'          // Agent tools and capabilities
  | 'provider'      // AI model providers
  | 'integration'   // External service integrations
  | 'middleware'    // Request/response middleware
  | 'storage'       // Data storage backends

export interface Plugin {
  name: string
  version: string
  type: PluginType
  description: string
  author: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  
  // Plugin lifecycle hooks
  install?(agent: Agent): Promise<void>
  uninstall?(agent: Agent): Promise<void>
  configure?(config: any): Promise<void>
  
  // Plugin exports
  behaviors?: Behavior[]
  tools?: Tool[]
  providers?: Provider[]
  middleware?: Middleware[]
}
```

### Plugin Registry

```typescript
// Plugin registry for managing installed plugins
export class PluginRegistry {
  private plugins = new Map<string, Plugin>()
  private loadedPlugins = new Set<string>()
  
  async register(plugin: Plugin): Promise<void> {
    // Validate plugin
    await this.validatePlugin(plugin)
    
    // Check dependencies
    await this.checkDependencies(plugin)
    
    // Register plugin
    this.plugins.set(plugin.name, plugin)
    
    console.log(`Plugin ${plugin.name}@${plugin.version} registered`)
  }
  
  async load(pluginName: string, agent: Agent): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }
    
    if (this.loadedPlugins.has(pluginName)) {
      console.warn(`Plugin ${pluginName} already loaded`)
      return
    }
    
    // Install plugin
    if (plugin.install) {
      await plugin.install(agent)
    }
    
    // Load plugin components
    await this.loadPluginComponents(plugin, agent)
    
    this.loadedPlugins.add(pluginName)
    console.log(`Plugin ${pluginName} loaded successfully`)
  }
  
  async unload(pluginName: string, agent: Agent): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }
    
    if (!this.loadedPlugins.has(pluginName)) {
      console.warn(`Plugin ${pluginName} not loaded`)
      return
    }
    
    // Uninstall plugin
    if (plugin.uninstall) {
      await plugin.uninstall(agent)
    }
    
    // Unload plugin components
    await this.unloadPluginComponents(plugin, agent)
    
    this.loadedPlugins.delete(pluginName)
    console.log(`Plugin ${pluginName} unloaded successfully`)
  }
  
  private async validatePlugin(plugin: Plugin): Promise<void> {
    // Validate required fields
    if (!plugin.name || !plugin.version || !plugin.type) {
      throw new Error('Plugin missing required fields')
    }
    
    // Validate version format
    if (!/^\d+\.\d+\.\d+/.test(plugin.version)) {
      throw new Error('Invalid plugin version format')
    }
    
    // Validate plugin type
    const validTypes: PluginType[] = ['behavior', 'tool', 'provider', 'integration', 'middleware', 'storage']
    if (!validTypes.includes(plugin.type)) {
      throw new Error(`Invalid plugin type: ${plugin.type}`)
    }
  }
  
  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return
    
    for (const [depName, depVersion] of Object.entries(plugin.dependencies)) {
      const installedPlugin = this.plugins.get(depName)
      if (!installedPlugin) {
        throw new Error(`Missing dependency: ${depName}@${depVersion}`)
      }
      
      // Simple version check (in production, use semver)
      if (installedPlugin.version !== depVersion) {
        console.warn(`Version mismatch for ${depName}: expected ${depVersion}, got ${installedPlugin.version}`)
      }
    }
  }
  
  private async loadPluginComponents(plugin: Plugin, agent: Agent): Promise<void> {
    // Load behaviors
    if (plugin.behaviors) {
      plugin.behaviors.forEach(behavior => agent.use(behavior))
    }
    
    // Load tools
    if (plugin.tools) {
      plugin.tools.forEach(tool => agent.use(tool))
    }
    
    // Load providers
    if (plugin.providers) {
      plugin.providers.forEach(provider => agent.addProvider(provider))
    }
    
    // Load middleware
    if (plugin.middleware) {
      plugin.middleware.forEach(middleware => agent.use(middleware))
    }
  }
}
```

## Creating Custom Plugins

### Behavior Plugin Example

```typescript
// plugins/sentiment-behavior/src/index.ts
import { Plugin, Behavior, BehaviorContext } from '@hybrd/core'

export interface SentimentBehaviorConfig {
  apiKey: string
  threshold?: number
  onNegativeSentiment?: (context: BehaviorContext) => Promise<void>
}

export class SentimentBehaviorPlugin implements Plugin {
  name = 'sentiment-behavior'
  version = '1.0.0'
  type = 'behavior' as const
  description = 'Analyzes message sentiment and triggers actions'
  author = 'Your Name'
  
  private config?: SentimentBehaviorConfig
  
  async configure(config: SentimentBehaviorConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Sentiment API key is required')
    }
    
    this.config = {
      threshold: -0.5,
      ...config
    }
  }
  
  get behaviors(): Behavior[] {
    if (!this.config) {
      throw new Error('Plugin not configured')
    }
    
    return [this.createSentimentBehavior(this.config)]
  }
  
  private createSentimentBehavior(config: SentimentBehaviorConfig): Behavior {
    return {
      name: 'sentimentAnalysis',
      
      async process(context: BehaviorContext) {
        try {
          // Analyze sentiment
          const sentiment = await this.analyzeSentiment(
            context.message.content, 
            config.apiKey
          )
          
          // Add to context
          context.metadata.sentiment = sentiment
          
          // Handle negative sentiment
          if (sentiment.score < config.threshold! && config.onNegativeSentiment) {
            await config.onNegativeSentiment(context)
          }
          
          return context
        } catch (error) {
          console.error('Sentiment analysis failed:', error)
          return context
        }
      }
    }
  }
  
  private async analyzeSentiment(text: string, apiKey: string) {
    const response = await fetch('https://api.sentiment-service.com/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    
    if (!response.ok) {
      throw new Error(`Sentiment API error: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// Export plugin factory
export function createSentimentBehavior(config: SentimentBehaviorConfig) {
  const plugin = new SentimentBehaviorPlugin()
  plugin.configure(config)
  return plugin
}

// Package.json
{
  "name": "@hybrd/plugin-sentiment-behavior",
  "version": "1.0.0",
  "description": "Sentiment analysis behavior for Hybrid agents",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["hybrid", "plugin", "sentiment", "behavior"],
  "peerDependencies": {
    "@hybrd/core": "^1.0.0"
  }
}
```

### Tool Plugin Example

```typescript
// plugins/weather-tool/src/index.ts
import { Plugin, Tool, createTool } from '@hybrd/core'
import { z } from 'zod'

export interface WeatherToolConfig {
  apiKey: string
  defaultUnits?: 'celsius' | 'fahrenheit'
  cacheTimeout?: number
}

export class WeatherToolPlugin implements Plugin {
  name = 'weather-tool'
  version = '1.0.0'
  type = 'tool' as const
  description = 'Provides weather information for locations'
  author = 'Your Name'
  
  private config?: WeatherToolConfig
  private cache = new Map<string, { data: any; expires: number }>()
  
  async configure(config: WeatherToolConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Weather API key is required')
    }
    
    this.config = {
      defaultUnits: 'celsius',
      cacheTimeout: 300000, // 5 minutes
      ...config
    }
  }
  
  get tools(): Tool[] {
    if (!this.config) {
      throw new Error('Plugin not configured')
    }
    
    return [this.createWeatherTool(this.config)]
  }
  
  private createWeatherTool(config: WeatherToolConfig): Tool {
    const weatherSchema = z.object({
      location: z.string().describe('City or location to get weather for'),
      units: z.enum(['celsius', 'fahrenheit'])
        .default(config.defaultUnits!)
        .describe('Temperature units')
    })
    
    return createTool({
      name: 'getWeather',
      description: 'Get current weather information for a location',
      schema: weatherSchema,
      
      async execute({ location, units }) {
        // Check cache first
        const cacheKey = `${location}-${units}`
        const cached = this.cache.get(cacheKey)
        
        if (cached && Date.now() < cached.expires) {
          return cached.data
        }
        
        try {
          // Fetch weather data
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${config.apiKey}&units=${units === 'celsius' ? 'metric' : 'imperial'}`
          )
          
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`)
          }
          
          const data = await response.json()
          
          const result = {
            location: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            units: units === 'celsius' ? '°C' : '°F',
            timestamp: new Date().toISOString()
          }
          
          // Cache result
          this.cache.set(cacheKey, {
            data: result,
            expires: Date.now() + config.cacheTimeout!
          })
          
          return result
        } catch (error) {
          throw new Error(`Failed to get weather for ${location}: ${error.message}`)
        }
      }
    })
  }
  
  async install(): Promise<void> {
    console.log('Weather tool plugin installed')
  }
  
  async uninstall(): Promise<void> {
    this.cache.clear()
    console.log('Weather tool plugin uninstalled')
  }
}

// Export plugin factory
export function createWeatherTool(config: WeatherToolConfig) {
  const plugin = new WeatherToolPlugin()
  plugin.configure(config)
  return plugin
}
```

### Integration Plugin Example

```typescript
// plugins/discord-integration/src/index.ts
import { Plugin, Agent } from '@hybrd/core'
import { Client, GatewayIntentBits } from 'discord.js'

export interface DiscordIntegrationConfig {
  botToken: string
  guildIds?: string[]
  channelIds?: string[]
  commandPrefix?: string
}

export class DiscordIntegrationPlugin implements Plugin {
  name = 'discord-integration'
  version = '1.0.0'
  type = 'integration' as const
  description = 'Integrates Hybrid agents with Discord'
  author = 'Your Name'
  
  private config?: DiscordIntegrationConfig
  private discordClient?: Client
  private agent?: Agent
  
  async configure(config: DiscordIntegrationConfig): Promise<void> {
    if (!config.botToken) {
      throw new Error('Discord bot token is required')
    }
    
    this.config = {
      commandPrefix: '!',
      ...config
    }
  }
  
  async install(agent: Agent): Promise<void> {
    if (!this.config) {
      throw new Error('Plugin not configured')
    }
    
    this.agent = agent
    
    // Initialize Discord client
    this.discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })
    
    // Set up event handlers
    this.setupEventHandlers()
    
    // Login to Discord
    await this.discordClient.login(this.config.botToken)
    
    console.log('Discord integration installed and connected')
  }
  
  async uninstall(): Promise<void> {
    if (this.discordClient) {
      await this.discordClient.destroy()
      this.discordClient = undefined
    }
    
    this.agent = undefined
    console.log('Discord integration uninstalled')
  }
  
  private setupEventHandlers(): void {
    if (!this.discordClient || !this.agent || !this.config) return
    
    this.discordClient.on('ready', () => {
      console.log(`Discord bot logged in as ${this.discordClient!.user!.tag}`)
    })
    
    this.discordClient.on('messageCreate', async (message) => {
      // Ignore bot messages
      if (message.author.bot) return
      
      // Check if message is in allowed channels/guilds
      if (!this.isAllowedChannel(message.channelId, message.guildId)) return
      
      // Check for command prefix
      if (!message.content.startsWith(this.config!.commandPrefix!)) return
      
      // Remove prefix and process message
      const content = message.content.slice(this.config!.commandPrefix!.length).trim()
      
      try {
        // Convert Discord message to Hybrid message format
        const hybridMessage = {
          id: message.id,
          content,
          sender: message.author.id,
          timestamp: message.createdTimestamp,
          conversation: {
            id: message.channelId,
            isGroup: message.guild !== null,
            platform: 'discord'
          },
          metadata: {
            discord: {
              guildId: message.guildId,
              channelId: message.channelId,
              authorTag: message.author.tag
            }
          }
        }
        
        // Process with agent
        const result = await this.agent!.processMessage(hybridMessage)
        
        if (result.response) {
          await message.reply(result.response)
        }
      } catch (error) {
        console.error('Error processing Discord message:', error)
        await message.reply('Sorry, I encountered an error processing your message.')
      }
    })
  }
  
  private isAllowedChannel(channelId: string, guildId: string | null): boolean {
    if (!this.config) return false
    
    // Check guild allowlist
    if (this.config.guildIds && guildId) {
      if (!this.config.guildIds.includes(guildId)) return false
    }
    
    // Check channel allowlist
    if (this.config.channelIds) {
      if (!this.config.channelIds.includes(channelId)) return false
    }
    
    return true
  }
}

// Export plugin factory
export function createDiscordIntegration(config: DiscordIntegrationConfig) {
  const plugin = new DiscordIntegrationPlugin()
  plugin.configure(config)
  return plugin
}
```

## Plugin Integration Patterns

### Plugin Manager

```typescript
// Core plugin manager for agents
export class PluginManager {
  private registry = new PluginRegistry()
  private agent: Agent
  
  constructor(agent: Agent) {
    this.agent = agent
  }
  
  async install(plugin: Plugin | string, config?: any): Promise<void> {
    let pluginInstance: Plugin
    
    if (typeof plugin === 'string') {
      // Load plugin from npm package
      pluginInstance = await this.loadFromPackage(plugin)
    } else {
      pluginInstance = plugin
    }
    
    // Configure plugin if config provided
    if (config && pluginInstance.configure) {
      await pluginInstance.configure(config)
    }
    
    // Register and load plugin
    await this.registry.register(pluginInstance)
    await this.registry.load(pluginInstance.name, this.agent)
  }
  
  async uninstall(pluginName: string): Promise<void> {
    await this.registry.unload(pluginName, this.agent)
  }
  
  async loadFromPackage(packageName: string): Promise<Plugin> {
    try {
      // Dynamic import of plugin package
      const pluginModule = await import(packageName)
      
      // Look for default export or named export
      const PluginClass = pluginModule.default || pluginModule[Object.keys(pluginModule)[0]]
      
      if (typeof PluginClass === 'function') {
        return new PluginClass()
      } else if (typeof PluginClass === 'object' && PluginClass.name) {
        return PluginClass
      } else {
        throw new Error(`Invalid plugin export from ${packageName}`)
      }
    } catch (error) {
      throw new Error(`Failed to load plugin ${packageName}: ${error.message}`)
    }
  }
  
  getLoadedPlugins(): string[] {
    return Array.from(this.registry['loadedPlugins'])
  }
  
  getAvailablePlugins(): Plugin[] {
    return Array.from(this.registry['plugins'].values())
  }
}

// Usage in agent
const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions..."
})

const pluginManager = new PluginManager(agent)

// Install plugins
await pluginManager.install('@hybrd/plugin-weather-tool', {
  apiKey: process.env.WEATHER_API_KEY
})

await pluginManager.install('@hybrd/plugin-sentiment-behavior', {
  apiKey: process.env.SENTIMENT_API_KEY,
  threshold: -0.3
})

await pluginManager.install('@hybrd/plugin-discord-integration', {
  botToken: process.env.DISCORD_BOT_TOKEN,
  guildIds: ['123456789012345678']
})
```

### Plugin Configuration Management

```typescript
// Configuration management for plugins
export class PluginConfigManager {
  private configs = new Map<string, any>()
  private configFile: string
  
  constructor(configFile = 'plugins.config.json') {
    this.configFile = configFile
  }
  
  async loadConfigs(): Promise<void> {
    try {
      const configData = await readFile(this.configFile, 'utf-8')
      const configs = JSON.parse(configData)
      
      for (const [pluginName, config] of Object.entries(configs)) {
        this.configs.set(pluginName, config)
      }
    } catch (error) {
      // Config file doesn't exist or is invalid
      console.warn('No plugin config file found, using defaults')
    }
  }
  
  async saveConfigs(): Promise<void> {
    const configData = Object.fromEntries(this.configs)
    await writeFile(this.configFile, JSON.stringify(configData, null, 2))
  }
  
  setConfig(pluginName: string, config: any): void {
    this.configs.set(pluginName, config)
  }
  
  getConfig(pluginName: string): any {
    return this.configs.get(pluginName)
  }
  
  hasConfig(pluginName: string): boolean {
    return this.configs.has(pluginName)
  }
  
  removeConfig(pluginName: string): void {
    this.configs.delete(pluginName)
  }
}

// Example plugin config file
// plugins.config.json
{
  "@hybrd/plugin-weather-tool": {
    "apiKey": "${WEATHER_API_KEY}",
    "defaultUnits": "celsius",
    "cacheTimeout": 300000
  },
  "@hybrd/plugin-sentiment-behavior": {
    "apiKey": "${SENTIMENT_API_KEY}",
    "threshold": -0.3,
    "onNegativeSentiment": "escalate"
  },
  "@hybrd/plugin-discord-integration": {
    "botToken": "${DISCORD_BOT_TOKEN}",
    "guildIds": ["123456789012345678"],
    "commandPrefix": "!"
  }
}
```

### Plugin Marketplace Integration

```typescript
// Plugin marketplace for discovering and installing plugins
export class PluginMarketplace {
  private apiUrl: string
  
  constructor(apiUrl = 'https://plugins.hybrid.dev/api') {
    this.apiUrl = apiUrl
  }
  
  async search(query: string, type?: PluginType): Promise<PluginInfo[]> {
    const params = new URLSearchParams({ q: query })
    if (type) params.set('type', type)
    
    const response = await fetch(`${this.apiUrl}/search?${params}`)
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async getPlugin(name: string): Promise<PluginInfo> {
    const response = await fetch(`${this.apiUrl}/plugins/${name}`)
    if (!response.ok) {
      throw new Error(`Plugin not found: ${name}`)
    }
    
    return response.json()
  }
  
  async getPopular(limit = 10): Promise<PluginInfo[]> {
    const response = await fetch(`${this.apiUrl}/popular?limit=${limit}`)
    if (!response.ok) {
      throw new Error(`Failed to get popular plugins: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async getByCategory(category: string): Promise<PluginInfo[]> {
    const response = await fetch(`${this.apiUrl}/category/${category}`)
    if (!response.ok) {
      throw new Error(`Failed to get plugins for category: ${category}`)
    }
    
    return response.json()
  }
  
  async install(pluginName: string, version?: string): Promise<void> {
    const packageName = version ? `${pluginName}@${version}` : pluginName
    
    // Use npm/pnpm to install the plugin
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    try {
      await execAsync(`npm install ${packageName}`)
      console.log(`Plugin ${packageName} installed successfully`)
    } catch (error) {
      throw new Error(`Failed to install plugin ${packageName}: ${error.message}`)
    }
  }
}

interface PluginInfo {
  name: string
  version: string
  description: string
  author: string
  type: PluginType
  downloads: number
  rating: number
  tags: string[]
  repository: string
  homepage: string
  license: string
  createdAt: string
  updatedAt: string
}

// CLI integration
// packages/cli/src/commands/plugin.ts
export function createPluginCommand(): Command {
  const command = new Command('plugin')
    .description('Manage Hybrid plugins')
  
  command
    .command('search <query>')
    .description('Search for plugins')
    .option('-t, --type <type>', 'Filter by plugin type')
    .action(async (query, options) => {
      const marketplace = new PluginMarketplace()
      const results = await marketplace.search(query, options.type)
      
      console.log(`Found ${results.length} plugins:`)
      results.forEach(plugin => {
        console.log(`  ${plugin.name}@${plugin.version} - ${plugin.description}`)
      })
    })
  
  command
    .command('install <name>')
    .description('Install a plugin')
    .option('-v, --version <version>', 'Specific version to install')
    .action(async (name, options) => {
      const marketplace = new PluginMarketplace()
      await marketplace.install(name, options.version)
    })
  
  command
    .command('list')
    .description('List installed plugins')
    .action(async () => {
      // Implementation for listing installed plugins
    })
  
  return command
}
```

## Publishing Plugins to the Ecosystem

### Plugin Package Structure

```
my-hybrid-plugin/
├── src/
│   ├── index.ts              # Main plugin export
│   ├── plugin.ts             # Plugin implementation
│   └── types.ts              # Type definitions
├── test/
│   ├── plugin.test.ts        # Plugin tests
│   └── integration.test.ts   # Integration tests
├── docs/
│   ├── README.md             # Plugin documentation
│   └── examples/             # Usage examples
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── .npmignore               # NPM ignore file
└── LICENSE                  # License file
```

### Package.json Configuration

```json
{
  "name": "@hybrd/plugin-my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome plugin for Hybrid agents",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "hybrid",
    "plugin",
    "ai-agent",
    "chatbot",
    "automation"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-hybrid-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/my-hybrid-plugin/issues"
  },
  "homepage": "https://github.com/yourusername/my-hybrid-plugin#readme",
  "peerDependencies": {
    "@hybrd/core": "^1.0.0"
  },
  "devDependencies": {
    "@hybrd/core": "^1.0.0",
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  },
  "hybridPlugin": {
    "type": "tool",
    "category": "utility",
    "tags": ["weather", "api", "external-service"],
    "compatibility": {
      "core": "^1.0.0"
    }
  }
}
```

### Plugin Documentation Template

```markdown
# @hybrd/plugin-my-awesome-plugin

An awesome plugin for Hybrid agents that provides [functionality description].

## Installation

```bash
npm install @hybrd/plugin-my-awesome-plugin
```

## Usage

```typescript
import { Agent } from '@hybrd/core'
import { createMyAwesomePlugin } from '@hybrd/plugin-my-awesome-plugin'

const agent = new Agent({
  model: yourModel,
  instructions: "Your agent instructions..."
})

// Install the plugin
const plugin = createMyAwesomePlugin({
  apiKey: process.env.MY_API_KEY,
  // other configuration options
})

await agent.plugins.install(plugin)
```

## Configuration

| Option    | Type     | Default | Description                     |
| --------- | -------- | ------- | ------------------------------- |
| `apiKey`  | `string` | -       | API key for the service         |
| `timeout` | `number` | `5000`  | Request timeout in milliseconds |
| `retries` | `number` | `3`     | Number of retry attempts        |

## Examples

### Basic Usage

```typescript
// Example of basic plugin usage
```

### Advanced Configuration

```typescript
// Example of advanced plugin configuration
```

## API Reference

### Plugin Methods

#### `configure(config: PluginConfig)`

Configures the plugin with the provided options.

#### `install(agent: Agent)`

Installs the plugin on the specified agent.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](/developing/contributing) for details.

## License

MIT © [Your Name](https://github.com/yourusername)
```

### Publishing Workflow

```bash
# 1. Prepare for publishing
npm run build
npm test
npm run lint

# 2. Update version
npm version patch  # or minor/major

# 3. Publish to npm
npm publish

# 4. Create GitHub release
git tag v1.0.0
git push origin v1.0.0

# 5. Submit to plugin registry (if available)
curl -X POST https://plugins.hybrid.dev/api/submit \
  -H "Content-Type: application/json" \
  -d '{"package": "@hybrd/plugin-my-awesome-plugin", "version": "1.0.0"}'
```

### Plugin Testing

```typescript
// test/plugin.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Agent } from '@hybrd/core'
import { MyAwesomePlugin } from '../src/plugin'
import { TestEnvironment } from './helpers/test-environment'

describe('MyAwesomePlugin', () => {
  let plugin: MyAwesomePlugin
  let agent: Agent
  let testEnv: TestEnvironment
  
  beforeEach(async () => {
    testEnv = await TestEnvironment.create()
    agent = testEnv.createAgent()
    plugin = new MyAwesomePlugin()
    
    await plugin.configure({
      apiKey: 'test-api-key'
    })
  })
  
  afterEach(async () => {
    await testEnv.cleanup()
  })
  
  it('should install successfully', async () => {
    await plugin.install(agent)
    
    expect(agent.plugins.isLoaded(plugin.name)).toBe(true)
  })
  
  it('should provide expected tools', async () => {
    await plugin.install(agent)
    
    const tools = agent.getTools()
    expect(tools.some(tool => tool.name === 'myAwesomeTool')).toBe(true)
  })
  
  it('should handle configuration errors', async () => {
    await expect(plugin.configure({})).rejects.toThrow('API key is required')
  })
})
```

## Next Steps

- Learn about [Advanced Development](/developing/advanced) for complex scenarios
- Explore [Deployment](/developing/deployment) for production deployment
- Check out [Contributing](/developing/contributing) for contribution guidelines
- See [Framework Development](/developing/framework) for core development
