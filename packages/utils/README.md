# utils

This package is part of the Hybrid monorepo.

Hybrid makes it easy for developers to create intelligent agents that can understand natural language, process messages, and respond through XMTP's decentralized messaging protocol.

See [hybrid.dev](https://hybrid.dev) for more information.

## 📦 Quickstart

Getting started with Hybrid is simple:

### 1. Initialize your project

```bash
npm create hybrid my-agent
cd my-agent
```

This creates all the necessary files and configuration for your agent.

### 2. Get your OpenRouter API key
   
Visit [OpenRouter](https://openrouter.ai/keys), create an account and generate an API key

Add it to your `.env` file:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Generate XMTP keys

```bash
hybrid keys
```

or automatically add it to your `.env` file:  

```bash
hybrid keys --write
```

### 4. Register your wallet with XMTP

```bash
hybrid register
```

This generates secure wallet and encryption keys for your XMTP agent.

  ### 5. Start developing

```bash
hybrid dev
```

Your agent will start listening for XMTP messages and you're ready to build!