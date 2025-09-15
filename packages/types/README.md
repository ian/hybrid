# @hybrd/types

Centralized type definitions for the Hybrid agent framework. This package provides TypeScript interfaces and types for agents, tools, plugins, and XMTP integration.

## Overview

This package contains all the shared type definitions used across the Hybrid monorepo, including:

- **Agent types**: Configuration, options, and runtime interfaces
- **Tool types**: Tool definitions and configurations  
- **Plugin types**: Plugin interfaces and registry types
- **XMTP types**: XMTP client, message, and conversation types
- **Runtime types**: Base runtime and agent runtime interfaces

## Usage

```typescript
import type {
  Agent,
  AgentConfig,
  Tool,
  ToolConfig,
  Plugin,
  XmtpClient,
  AgentRuntime
} from '@hybrd/types'
```

## Type Categories

### Agent Types
- `AgentConfig<T>` - Configuration interface for creating agents
- `DefaultRuntimeExtension` - Default empty runtime extension type
- `GenerateOptions<T>` - Options for text generation
- `StreamOptions<T>` - Options for text streaming
- `ToolGenerator<T>` - Function type for dynamic tool generation

### Tool Types
- `Tool<TInput, TOutput, TRuntime>` - Internal tool interface
- `ToolConfig<TInput, TOutput, TRuntime>` - Configuration for creating tools
- `AnyTool<TRuntime>` - Generic tool type

### Plugin Types
- `Plugin<TContext>` - Plugin interface for extending agents
- `PluginRegistry<TContext>` - Plugin registry interface
- `PluginContext` - Base plugin context type

### XMTP Types
- `XmtpClient` - XMTP client type with codecs
- `XmtpConversation` - XMTP conversation type
- `XmtpMessage` - XMTP message type
- `XmtpSender` - Message sender information
- `XmtpSubjects` - Subject mapping type
- `HonoVariables` - Hono context variables for XMTP

### Runtime Types
- `BaseRuntime` - Base runtime with XMTP context
- `AgentRuntime` - Extended runtime with chat context

## Backward Compatibility

All packages continue to re-export their types for backward compatibility. Existing imports will continue to work:

```typescript
// These still work
import type { AgentConfig } from 'hybrid'
import type { XmtpClient } from '@hybrd/xmtp'
import type { Plugin } from '@hybrd/ponder'
```

## Dependencies

This package has minimal dependencies and only includes peer dependencies for external types:
- `ai` - For AI SDK types
- `zod` - For schema validation types
- `@xmtp/*` - For XMTP SDK types
- `hono` - For Hono framework types

## Development

```bash
# Build the package
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```
