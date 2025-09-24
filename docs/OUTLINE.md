# Hybrid Framework Documentation Outline

This outline organizes documentation by developer workflow, focusing on actionable features developers can use to build XMTP agents with the Hybrid framework.

## Getting Started
*Overview: Initial setup and creating your first agent*

- **Installation & Project Setup**
  - Installing Hybrid CLI
  - Creating new projects with `create-hybrid`
  - Available project templates (basic, with-ponder, with-foundry)
  - Environment configuration (.env setup)

- **Basic Agent Creation**
  - Agent class fundamentals
  - Simple agent configuration
  - Running your first agent

- **Introduction to XMTP**
  - What is XMTP and decentralized messaging
  - XMTP network overview (dev vs production)
  - Generating XMTP keys
  - Wallet registration with XMTP network
  - Testing with XMTP chat interfaces

## Agent Configuration
*Overview: Configuring your agent's core functionality*

- **Prompts & Instructions**
  - Setting agent personality and behavior
  - Instruction best practices
  - Context and conversation management
  - Agent runtime extensions and custom contexts

- **Models & AI Providers**
  - Default: OpenRouter AI SDK provider setup
  - Using OpenAI directly
  - Using Grok directly  
  - Using Anthropic directly
  - AI SDK providers overview and [provider list reference](https://ai-sdk.dev/providers/ai-sdk-providers)
  - Model selection and configuration

- **Behaviors**
  - How behaviors work in the agent lifecycle
  - **Message Filtering with `filterMessages`**
    - `filter.isText()` - Message is text content
    - `filter.isReply()` - Message is a reply
    - `filter.isReaction()` - Message is a reaction
    - `filter.isReaction(emoji, action?)` - Specific emoji/action reactions
    - `filter.isDM()` - Message is a direct message
    - `filter.fromSelf()` - Message is from the agent itself
    - `filter.hasMention(mention)` - Message contains a mention
    - `filter.hasContent()` - Message has content
    - `filter.isGroup()` - Message is in a group conversation
    - `filter.isGroupAdmin()` - Message sender is group admin
    - `filter.isGroupSuperAdmin()` - Message sender is group super admin
    - `filter.isRemoteAttachment()` - Message has remote attachment
    - `filter.isTextReply()` - Message is a text reply
  - **Automatic Reactions with `reactWith`**
    - Adding emoji reactions to messages
    - Reaction timing and behavior
  - **Threaded Replies with `threadedReply`**
    - Configuring threaded vs top-level responses
    - Thread management
  - **Creating Custom Behaviors**
    - Behavior lifecycle (before/after/error hooks)
    - Custom behavior implementation

## Tools
*Overview: Built-in and extensible tools for agent functionality*

- **Blockchain Tools**
  - `getBalance` - Get native token balance for any address
  - `sendTransaction` - Send native tokens to another address
  - `getTransaction` - Get transaction details by hash
  - `getBlock` - Get blockchain block information
  - `getGasPrice` - Get current gas prices
  - `estimateGas` - Estimate gas costs for transactions
  - Tool configuration and runtime context
  - Supported chains (Ethereum, Polygon, Arbitrum, Optimism, Base, Sepolia)

- **XMTP Tools**
  - `sendMessage` - Send messages to XMTP conversations
  - `sendReply` - Reply to specific messages
  - `sendReaction` - Send emoji reactions
  - `getMessage` - Retrieve message details by ID
  - Content types (text, reactions, replies, attachments)
  - Group conversation handling

- **Mini App Tools**
  - Mini app integration capabilities
  - Tool configuration for mini apps
  - Usage patterns and examples

- **Creating Custom Tools**
  - Using `createTool` for custom functionality
  - Tool schema validation with Zod
  - Tool runtime extensions
  - Combining multiple tool sets

## Blockchain
*Overview: Blockchain integration and development tools*

- **Ponder Integration**
  - Ponder plugin for blockchain event handling
  - Event indexing and forwarding to agents
  - Configuration and setup
  - Use cases and examples

- **Foundry Integration**
  - Working with Foundry for smart contract development
  - Integration patterns with Hybrid agents
  - Testing and deployment workflows

- **Multi-chain Support**
  - Chain configuration and switching
  - Transaction handling across chains
  - Gas management strategies

## CLI Commands
*Overview: Command-line tools for development workflow*

- **Key Management**
  - Generating XMTP keys (`hybrid keys`)
  - Writing keys to environment files
  - Key security best practices

- **Development Workflow**
  - Development server (`hybrid dev`)
  - Building projects (`hybrid build`)
  - Project cleanup (`hybrid clean`)
  - Framework upgrades (`hybrid upgrade`)

- **XMTP Network Operations**
  - Wallet registration (`hybrid register`)
  - Revoking installations (`hybrid revoke`)
  - Managing multiple agent instances

## Advanced Topics
*Overview: Advanced features for sophisticated agent implementations*

- **Plugin System**
  - Plugin architecture overview
  - Creating custom plugins
  - Plugin integration patterns

- **XMTP Advanced Features**
  - Message encryption and security
  - Connection management and error handling
  - Address resolution (ENS, BaseName)

- **Deployment**
  - Production environment setup
  - Hosting provider configuration
  - Environment variable management
  - Monitoring and logging

## API Reference
*Overview: Comprehensive API documentation for all framework components*

- **Core Classes**
  - Agent class methods and properties
  - Plugin and PluginRegistry APIs
  - Tool and ToolConfig interfaces

- **Behavior System**
  - BehaviorObject interface
  - BehaviorContext and lifecycle methods
  - Built-in behavior implementations

- **Tools API**
  - Blockchain tools function signatures
  - XMTP tools function signatures
  - Runtime extension interfaces

- **Type Definitions**
  - AgentConfig and runtime types
  - Message and conversation types
  - Filter and content type definitions

## Package Reference
*Overview: Individual package documentation for advanced users*

- **@hybrd/core**
  - Agent framework core functionality
  - Server and plugin system
  - Tool and behavior implementations

- **@hybrd/cli**
  - Command-line interface implementation
  - Development server and build tools
  - Key generation and XMTP operations

- **@hybrd/xmtp**
  - XMTP client management
  - Message handling and content types
  - Address resolution (ENS, BaseName)

- **@hybrd/utils**
  - Utility functions for common operations
  - Array, string, and object helpers
  - Date and UUID utilities

- **@hybrd/types**
  - TypeScript type definitions
  - Interface specifications
  - Runtime and configuration types

- **@hybrd/ponder**
  - Blockchain event handling plugin
  - Ponder integration for indexing
  - Event forwarding to agents
