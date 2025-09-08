# create-hybrid

Create a new Hybrid XMTP agent project with a single command.

## Usage

```bash
# Create a new project
npx create hybrid my-agent

# Create in current directory
npx create hybrid .

# Interactive mode (will prompt for name)
npx create hybrid
```

## What it creates

This package creates a new Hybrid XMTP agent project with:

- **TypeScript configuration** - Ready-to-use TypeScript setup
- **Agent template** - Pre-configured agent with OpenRouter integration
- **Development scripts** - Build, dev, test, and lint commands
- **Environment setup** - Template `.env` file with required variables:

```env
# OpenRouter Configuration
# Get your OpenRouter API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# XMTP Wallet and Encryption Keys
# Run 'npx hybrid keys' to generate these values
XMTP_WALLET_KEY=your_wallet_key_here
XMTP_ENCRYPTION_KEY=your_encryption_key_here

# XMTP Environment (dev, production)
XMTP_ENV=production

# Server Configuration
# PORT=8454
```
- **Testing framework** - Vitest configuration for unit tests

## Project structure

```
my-agent/
├── src/
│   ├── agent.ts          # Main agent implementation
│   └── agent.test.ts     # Example tests
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Test configuration
└── README.md           # Project documentation
```

## Next steps

After creating your project:

1. **Install dependencies**
   ```bash
   cd my-agent
   npm install
   ```

2. **Get your OpenRouter API key**
   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Create an account and generate an API key
   - Add it to your `.env` file

3. **Generate XMTP keys**
   ```bash
   npm run keys
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Requirements

- Node.js 20 or higher
- npm, yarn, or pnpm

## Related packages

- [`hybrid`](../core) - The main Hybrid framework
- [`@hybrd/cli`](../cli) - CLI tools for Hybrid development
- [`@hybrd/xmtp`](../xmtp) - XMTP client integration

## License

MIT
