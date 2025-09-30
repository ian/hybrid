---
title: Quickstart
description: Speed run through setup, configuration, and deployment of Hybrid agents
---

# Quickstart

Get up and running with Hybrid agents in minutes. This guide will take you through setup, configuration, and deployment in a streamlined workflow.

## Setup & Installation

### Install Hybrid CLI

```bash
npm install -g @hybrd/cli
```

### Create New Project

```bash
npx create-hybrid my-agent
cd my-agent
```

### Generate Keys

```bash
hybrid keys
```

### Environment Setup

Configure your `.env` file with the generated keys:

```bash
# XMTP Configuration
XMTP_WALLET_KEY=your_wallet_private_key
XMTP_DB_ENCRYPTION_KEY=your_encryption_key

# AI Provider Configuration (OpenRouter recommended)
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Configure Your Agent

### Basic Agent Configuration

Set up your agent with model and basic configuration:

```typescript
import { Agent } from "@hybrd/core"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

const agent = new Agent({
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })("openai/gpt-4"),
  instructions: "You are a helpful AI agent that can interact with users through XMTP messaging.",
})
```

### Add Behaviors and Tools

```typescript
import { filterMessages, reactWith, threadedReply } from "@hybrd/core/behaviors"
import { blockchainTools, xmtpTools } from "@hybrd/core/tools"

agent.use(filterMessages(filter => filter.isText() && !filter.fromSelf()))
agent.use(reactWith("👍"))
agent.use(threadedReply())

agent.use(blockchainTools())
agent.use(xmtpTools())
```

### Test Locally

```bash
hybrid dev
```

## Deploy Your Agent

### Build for Production

```bash
hybrid build
```

### Deploy to Hosting Platform

Deploy to your preferred hosting platform (Vercel, Railway, etc.):

```bash
# Example for Vercel
npm install -g vercel
vercel deploy
```

### Monitor and Manage

- Check agent logs for message processing
- Monitor wallet balance and transactions
- Update agent configuration as needed
- Scale based on message volume

## Next Steps

- Learn about [Core Concepts](/core-concepts) to understand how Hybrid agents work
- Explore [Agent Configuration](/agent-configuration/prompts) for advanced setup
- Check out [XMTP](/xmtp/introduction) for messaging capabilities
- Add [Blockchain Tools](/blockchain/tools) for crypto functionality

## Quick Reference

| Command | Description |
|---------|-------------|
| `hybrid keys` | Generate XMTP keys |
| `hybrid dev` | Start development server |
| `hybrid build` | Build for production |
| `hybrid register` | Register wallet with XMTP |
| `hybrid revoke` | Revoke XMTP installations |
