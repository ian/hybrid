# grouptoss.base.eth

A simple agent that creates group tosses based on user messages.

#

## Features

- Create group tosses with custom topics and options
- Automatically add members to the group
- Support for yes/no tosses and custom option tosses
- Specify toss amounts

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Generate XMTP keys:

```bash
pnpm gen:keys
```

This will create a `.env` file with the necessary keys.

### Running the Agent

Start the agent:

```bash
pnpm start
```

For development with auto-restart:

```bash
pnpm dev
```

## Usage

Send a message to the agent with the following format:

```
@toss [topic] for [amount]
```

Examples:

- `@toss Will it rain tomorrow for 5` - Creates a yes/no toss with 5 USDC
- `@toss Lakers vs Celtics for 10` - Creates a toss with Lakers and Celtics as
  options with 10 USDC

## Environment Variables

The following environment variables are required:

- `WALLET_KEY` - The private key of the wallet
- `ENCRYPTION_KEY` - Encryption key for the local database
- `XMTP_ENV` - XMTP environment (local, dev, production)

## License

MIT
