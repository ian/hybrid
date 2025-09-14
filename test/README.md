# Hybrid Workspace Test Project

This test project verifies that all hybrid workspace packages are working correctly and can be imported and used together. It's particularly useful for testing the XMTP Agent SDK migration and ensuring package compatibility.

## What This Tests

1. **Package Imports**: Verifies all workspace packages can be imported
2. **Utility Functions**: Tests core utility functions from `@hybrd/utils`
3. **XMTP Token Generation**: Tests JWT token generation for XMTP tools
4. **Environment Validation**: Tests environment configuration validation
5. **XMTP Service Client**: Tests service client creation and configuration
6. **Agent Configuration**: Tests basic agent configuration structure
7. **XMTP Client Creation**: Tests XMTP client creation (requires env vars)

## Setup

1. **Install Dependencies** (from project root):
   ```bash
   cd /Users/ian/Projects/01/hybrid
   pnpm install
   ```

2. **Optional Environment Configuration**:
   ```bash
   cd test
   cp env.example .env
   # Edit .env with your values (optional for most tests)
   ```

## Running Tests

### Basic Test Suite
```bash
# From the test directory
cd /Users/ian/Projects/01/hybrid/test
pnpm start
```

### Development Mode (with file watching)
```bash
pnpm dev
```

### Type Checking
```bash
pnpm typecheck
```

## Expected Output

The test suite will output results for each test:

```
🚀 Starting Hybrid Workspace Package Tests
📅 2024-01-01 12:00:00
==================================================
🧪 Running: Package Imports
✅ Package Imports (15ms)
🧪 Running: Utility Functions  
✅ Utility Functions (8ms)
🧪 Running: XMTP Token Generation
✅ XMTP Token Generation (12ms)
...

==================================================
📊 TEST SUMMARY
==================================================
Total: 8
✅ Passed: 6
❌ Failed: 0  
⏭️ Skipped: 2
==================================================
```

## What Each Test Verifies

### Package Imports
- Tests that all workspace packages (`hybrid`, `@hybrd/xmtp`, `@hybrd/utils`, etc.) can be imported
- Verifies key exports are available

### Utility Functions
- Tests `arrayUnique()` function from utils package
- Tests `dateFormat()` function from utils package

### XMTP Token Generation
- Tests JWT token generation for XMTP tools authentication
- Verifies token structure and format

### Environment Validation
- Tests environment configuration validation
- May show warnings in test environment (expected)

### XMTP Service Client
- Tests creation of XMTP service client
- Verifies client configuration

### Agent Configuration
- Tests basic agent configuration structure
- Verifies configuration validation

### XMTP Client Creation
- Tests XMTP client creation (requires `XMTP_PRIVATE_KEY`)
- Will be skipped if environment variables are missing

## Troubleshooting

### Missing Dependencies
If you see import errors, ensure you've installed dependencies from the project root:
```bash
cd /Users/ian/Projects/01/hybrid
pnpm install
```

### Environment Variables
Most tests will run without environment variables. Only the XMTP client creation test requires:
- `XMTP_PRIVATE_KEY`: A valid Ethereum private key
- `XMTP_ENV`: Environment setting (dev/prod)

### Build Issues
If you encounter build issues, try cleaning and rebuilding:
```bash
cd /Users/ian/Projects/01/hybrid
pnpm clean
pnpm build
```

## Integration with Main Project

This test project uses workspace references (`workspace:*`) to test the actual packages being developed. Changes to the main packages will be reflected immediately in the tests.

## Adding New Tests

To add new tests, modify `src/index.ts` and add new test cases using the `runner.run()` method:

```typescript
await runner.run("Your Test Name", async () => {
  // Your test code here
  if (someCondition) {
    throw new Error("Test failed: reason")
  }
  console.log("  ✓ Test passed")
})
```
