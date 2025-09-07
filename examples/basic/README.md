# Basic Agent Example

A simple XMTP agent that responds to messages and reactions using the Hybrid framework.

## Features

- Responds to @bot mentions in messages
- Reacts to 👍 emojis 
- Basic conversational AI using OpenRouter/Grok
- Message filtering for targeted responses

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   ```env
   # Required
   OPENROUTER_API_KEY=your_openrouter_api_key
   XMTP_HOST=https://your-xmtp-service.com
   XMTP_API_KEY=your_xmtp_api_key
   
   # Optional
   PORT=8454
   ```

3. Run the agent:
   ```bash
   pnpm dev        # Development mode with hot reload
   pnpm start      # Production mode
   ```

## Usage

The agent will respond to:
- Messages containing "@bot"
- Reply messages (all replies are processed)
- 👍 emoji reactions

## Example Interactions

```
User: "@bot hello there!"
Agent: "Hello! I'm a XMTP agent that responds to messages and reactions. How can I help you?"

User: [Reacts with 👍 to a message]
Agent: [Responds to the reaction]
```

## Architecture

- **Agent**: Uses OpenRouter's Grok-4 model
- **Filtering**: Smart message filtering to avoid spam
- **XMTP Integration**: Built-in XMTP messaging support
- **Hot Reload**: Development mode with automatic restarts

## Files

- `src/agent.ts` - Main agent implementation
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `biome.jsonc` - Code formatting and linting rules

## Related Examples

- **Crypto Agent** (`../crypto-agent/`): Comprehensive crypto-enabled agent with blockchain integration examples