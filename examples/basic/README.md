# Basic Example

This example demonstrates using Hybrid with XMTP Agent SDK filters.

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent, filter } from "hybrid"

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const agent = new Agent({
  name: "My Hybrid Agent",
  model: openrouter("x-ai/grok-4"),
  instructions: "Be helpful and conversational"
})

await agent.listen({
  port: process.env.PORT || "8454",
  filters: [
    filter.isText,
    filter.not(filter.fromSelf),
    filter.startsWith("@agent")
  ]
})
```

See XMTP Agent SDK filter docs: https://github.com/xmtp/xmtp-js/tree/main/sdks/agent-sdk#3-builtin-filters

# {{projectName}}

A Hybrid XMTP agent built with TypeScript and AI capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher (Node 22 recommended)

### Installation

```bash
# Install dependencies
pnpm install
```

### Setup

1. **Get your OpenRouter API key**
   - Visit [OpenRouter](https://openrouter.ai/keys) and create an account
   - Generate an API key
   - Add it to your `.env` file

2. **Generate XMTP keys**
   ```bash
   hybrid keys
   # or
   hybrid keys --write
   ```

3. **Update environment variables**
   Edit the `.env` file with your API key and generated keys.

### Development

```bash
# Start development server with auto-reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── agent.ts          # Main agent implementation
│   └── agent.test.ts     # Agent test entry file
├── dist/                 # Compiled JavaScript (after build)
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
└── README.md             # This file
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint and fix code
- `npm run format` - Format code
- `npm run typecheck` - Check TypeScript types

## 🤖 Agent Configuration

The agent is configured in `src/agent.ts`. You can customize:

- **AI Model**: Change the model in the `openrouter()` call
- **Instructions**: Modify the agent's system prompt
- **Message Filtering**: Adjust which messages the agent responds to
- **Port**: Change the server port in `.env`

### Example Customizations

```typescript
const agent = new Agent({
  name: "My Custom Agent",
  model: openrouter("anthropic/claude-3-haiku"), // Different model
  instructions: "You are a helpful assistant that specializes in..."
})
```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here
XMTP_WALLET_KEY=your_generated_wallet_key
XMTP_DB_ENCRYPTION_KEY=your_generated_encryption_key

# Optional
XMTP_ENV=dev
PORT=8454
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📚 Key Concepts

### Message Filtering

The agent uses a filter function to determine which messages to respond to:

```typescript
const filter = async ({ message }) => {
  // Return true to respond, false to ignore
  const content = message.content?.toString()

  // Example: Only respond to messages mentioning the bot
  return content?.toLowerCase().includes('@bot')
}
```

### Agent Instructions

The system prompt tells the AI how to behave:

```typescript
const agent = new Agent({
  instructions: "You are a helpful XMTP agent that..."
})
```

## 🔗 Useful Links

- [Hybrid Documentation](https://hybrid.dev)
- [XMTP Documentation](https://docs.xmtp.org/)
- [OpenRouter Models](https://openrouter.ai/docs#models)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
