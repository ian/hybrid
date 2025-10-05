---
title: Contributing to Hybrid
description: Guidelines for contributing to the Hybrid framework
---

# Contributing to Hybrid

Learn how to contribute to the Hybrid framework, from setting up your development environment to submitting pull requests.

## Setting up Development Environment

### Prerequisites

Before contributing to Hybrid, ensure you have the following installed:

```bash
# Node.js (v18 or higher)
node --version

# pnpm (package manager)
npm install -g pnpm

# Git
git --version
```

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/ian/hybrid.git
cd hybrid

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### Development Scripts

```bash
# Available scripts
pnpm build          # Build all packages
pnpm dev            # Start development mode
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Run linting
pnpm lint:fix       # Fix linting issues
pnpm typecheck      # Run TypeScript type checking
pnpm clean          # Clean build artifacts
```

### Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Configure required environment variables
OPENROUTER_API_KEY=your_openrouter_api_key
XMTP_WALLET_KEY=your_wallet_private_key
XMTP_DB_ENCRYPTION_KEY=your_encryption_key
ETHEREUM_RPC_URL=your_ethereum_rpc_url
```

## Code Contribution Guidelines

### Code Style and Standards

Hybrid follows strict code quality standards to maintain consistency across the codebase.

#### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and return values
function processMessage(message: XMTPMessage): Promise<ProcessedMessage> {
  // Implementation
}

// Use interfaces for object shapes
interface AgentConfig {
  model: AIModel
  instructions: string
  behaviors?: Behavior[]
  tools?: Tool[]
}

// Use enums for constants
enum MessageType {
  TEXT = "text",
  REACTION = "reaction",
  REPLY = "reply"
}

// Use generics for reusable types
interface Repository<T> {
  find(id: string): Promise<T | null>
  save(entity: T): Promise<T>
  delete(id: string): Promise<void>
}
```

#### Naming Conventions

```typescript
// Use PascalCase for classes and interfaces
class MessageProcessor implements IMessageProcessor {
  // Use camelCase for methods and variables
  private messageQueue: Message[] = []
  
  async processMessage(message: Message): Promise<void> {
    // Implementation
  }
}

// Use SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_TIMEOUT_MS = 5000

// Use kebab-case for file names
// message-processor.ts
// xmtp-client.ts
// blockchain-tools.ts
```

#### Error Handling

```typescript
// Create custom error classes
class AgentConfigurationError extends Error {
  constructor(message: string, public readonly config: unknown) {
    super(message)
    this.name = "AgentConfigurationError"
  }
}

// Use proper error handling patterns
async function initializeAgent(config: AgentConfig): Promise<Agent> {
  try {
    validateConfig(config)
    return new Agent(config)
  } catch (error) {
    if (error instanceof AgentConfigurationError) {
      console.error("Configuration error:", error.message)
      throw error
    }
    
    // Re-throw unexpected errors
    throw new Error(`Failed to initialize agent: ${error.message}`)
  }
}

// Use Result pattern for operations that can fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

async function sendMessage(message: string): Promise<Result<string>> {
  try {
    const result = await xmtpClient.send(message)
    return { success: true, data: result.hash }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### Testing Guidelines

#### Unit Tests

```typescript
// test/message-processor.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageProcessor } from '../src/message-processor'
import { MockXMTPClient } from './mocks/xmtp-client'

describe('MessageProcessor', () => {
  let processor: MessageProcessor
  let mockClient: MockXMTPClient
  
  beforeEach(() => {
    mockClient = new MockXMTPClient()
    processor = new MessageProcessor(mockClient)
  })
  
  it('should process text messages correctly', async () => {
    // Arrange
    const message = {
      id: 'test-id',
      content: 'Hello, agent!',
      sender: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: Date.now()
    }
    
    // Act
    const result = await processor.process(message)
    
    // Assert
    expect(result.processed).toBe(true)
    expect(result.response).toContain('Hello')
  })
  
  it('should handle processing errors gracefully', async () => {
    // Arrange
    const invalidMessage = { id: 'invalid' }
    
    // Act & Assert
    await expect(processor.process(invalidMessage as any))
      .rejects.toThrow('Invalid message format')
  })
  
  it('should call XMTP client with correct parameters', async () => {
    // Arrange
    const message = createTestMessage()
    const sendSpy = vi.spyOn(mockClient, 'send')
    
    // Act
    await processor.process(message)
    
    // Assert
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: message.sender,
        content: expect.any(String)
      })
    )
  })
})
```

#### Integration Tests

```typescript
// test/integration/agent-workflow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Agent } from '../src/agent'
import { TestEnvironment } from './helpers/test-environment'

describe('Agent Workflow Integration', () => {
  let testEnv: TestEnvironment
  let agent: Agent
  
  beforeAll(async () => {
    testEnv = await TestEnvironment.setup()
    agent = testEnv.createAgent({
      model: testEnv.mockModel,
      instructions: "You are a test agent"
    })
  })
  
  afterAll(async () => {
    await testEnv.cleanup()
  })
  
  it('should handle complete message workflow', async () => {
    // Send message to agent
    const message = await testEnv.sendMessage(agent, "Hello, agent!")
    
    // Verify agent processes and responds
    const response = await testEnv.waitForResponse(message.id)
    expect(response).toBeDefined()
    expect(response.content).toContain("Hello")
    
    // Verify message is stored
    const storedMessage = await testEnv.getStoredMessage(message.id)
    expect(storedMessage.processed).toBe(true)
  })
})
```

#### Test Utilities

```typescript
// test/helpers/test-environment.ts
export class TestEnvironment {
  private mockXMTPClient: MockXMTPClient
  private mockAIModel: MockAIModel
  
  static async setup(): Promise<TestEnvironment> {
    const env = new TestEnvironment()
    await env.initialize()
    return env
  }
  
  private async initialize() {
    this.mockXMTPClient = new MockXMTPClient()
    this.mockAIModel = new MockAIModel()
  }
  
  createAgent(config: Partial<AgentConfig>): Agent {
    return new Agent({
      model: this.mockAIModel,
      xmtpClient: this.mockXMTPClient,
      ...config
    })
  }
  
  async sendMessage(agent: Agent, content: string): Promise<Message> {
    return this.mockXMTPClient.simulateIncomingMessage({
      content,
      sender: '0x1234567890abcdef1234567890abcdef12345678'
    })
  }
  
  async cleanup() {
    await this.mockXMTPClient.disconnect()
  }
}
```

## Pull Request Process

### Branch Naming

Use descriptive branch names that follow this pattern:

```bash
# Feature branches
feature/add-new-behavior
feature/improve-gas-estimation
feature/xmtp-group-support

# Bug fix branches
fix/message-processing-error
fix/memory-leak-in-agent
fix/incorrect-gas-calculation

# Documentation branches
docs/update-api-reference
docs/add-tutorial-examples
docs/improve-getting-started

# Refactoring branches
refactor/simplify-tool-interface
refactor/extract-common-utilities
refactor/improve-error-handling
```

### Commit Message Format

Follow the conventional commit format:

```bash
# Format: type(scope): description

# Examples
feat(core): add support for custom behaviors
fix(xmtp): resolve connection timeout issues
docs(readme): update installation instructions
test(agent): add integration tests for message processing
refactor(tools): simplify blockchain tool interface
perf(core): optimize message processing pipeline
chore(deps): update dependencies to latest versions
```

### Pull Request Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code is properly documented
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or that the feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.
```

### Code Review Guidelines

#### For Contributors

```typescript
// Before submitting PR:

// 1. Ensure code is properly formatted
pnpm lint:fix

// 2. Run all tests
pnpm test

// 3. Check TypeScript types
pnpm typecheck

// 4. Build successfully
pnpm build

// 5. Test manually if applicable
pnpm dev
```

#### For Reviewers

Focus on these areas during code review:

1. **Functionality**: Does the code work as intended?
2. **Performance**: Are there any performance implications?
3. **Security**: Are there any security vulnerabilities?
4. **Maintainability**: Is the code easy to understand and maintain?
5. **Testing**: Are there adequate tests for the changes?
6. **Documentation**: Is the code properly documented?

## Issue Reporting and Feature Requests

### Bug Reports

When reporting bugs, include:

```markdown
## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- Hybrid version: [e.g. 1.0.0]
- Package manager: [e.g. pnpm, npm]

## Additional Context
Add any other context about the problem here.

## Logs
```
Include relevant logs or error messages
```

### Feature Requests

When requesting features, include:

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Use Case
Describe the use case or problem this feature would solve.

## Proposed Solution
A clear and concise description of what you want to happen.

## Alternatives Considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional Context
Add any other context or screenshots about the feature request here.
```

## Community Guidelines and Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat and community support
- **Twitter**: For announcements and updates

### Getting Help

If you need help:

1. Check the documentation first
2. Search existing GitHub issues
3. Ask in GitHub Discussions
4. Join our Discord community
5. Create a new issue if needed

### Recognition

Contributors are recognized in:

- **CONTRIBUTORS.md**: All contributors are listed
- **Release notes**: Significant contributions are highlighted
- **Documentation**: Contributors are credited for documentation improvements
- **Social media**: We highlight community contributions

## Development Workflow

### Setting Up Your Fork

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/hybrid.git
cd hybrid

# Add upstream remote
git remote add upstream https://github.com/ian/hybrid.git

# Install dependencies
pnpm install
```

### Keeping Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

### Creating a Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code changes ...

# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
pnpm prepare

# Hooks will run automatically on commit
# To run manually:
pnpm lint
pnpm typecheck
pnpm test
```

## Next Steps

- Learn about [Framework Development](/developing/framework) for core development
- Check out [Using Hybrid](/using-hybrid) for development workflow
- Explore [Agent Configuration](/agent/prompts) for customizing behavior
