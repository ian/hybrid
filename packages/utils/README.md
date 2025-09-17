# @hybrd/utils

Utility functions and helpers for the Hybrid framework ecosystem. This package provides a collection of commonly used utility functions for array manipulation, string processing, date formatting, object operations, and more.

## Installation

```bash
pnpm install @hybrd/utils
```

## Usage

```typescript
import { chunk, truncate, formatDate, stringifyValues } from "@hybrd/utils"
```

## API Reference

### Array Utilities

#### `chunk<T>(arr: T[], size: number): T[][]`

Splits an array into chunks of specified size.

```typescript
import { chunk } from "@hybrd/utils"

const numbers = [1, 2, 3, 4, 5, 6, 7, 8]
const chunks = chunk(numbers, 3)
// Result: [[1, 2, 3], [4, 5, 6], [7, 8]]
```

#### `uniq<T>(array: T[]): T[]`

Returns a new array with only unique elements from the input array.

```typescript
import { uniq } from "@hybrd/utils"

const duplicates = [1, 2, 2, 3, 3, 3, 4]
const unique = uniq(duplicates)
// Result: [1, 2, 3, 4]
```

#### `shuffle(array: any[]): any[]`

Randomly shuffles the elements of an array. Returns an empty array if input is undefined.

```typescript
import { shuffle } from "@hybrd/utils"

const cards = ['A', 'K', 'Q', 'J']
const shuffled = shuffle(cards)
// Result: randomly ordered array
```

### String Utilities

#### `truncate(str: string, length: number): string`

Truncates a string to a specified length, adding an ellipsis if the string is longer than the specified length.

```typescript
import { truncate } from "@hybrd/utils"

const longText = "This is a very long text that needs to be truncated"
const short = truncate(longText, 20)
// Result: "This is a very long..."
```

### Date Utilities

#### `formatDate(stringOrDate?: string | Date): string`

Formats a date string or Date object into a localized date string.

```typescript
import { formatDate } from "@hybrd/utils"

const date = new Date('2024-01-15')
const formatted = formatDate(date)
// Result: "Jan 15, 2024"

const dateString = formatDate('2024-01-15')
// Result: "Jan 15, 2024"

const empty = formatDate()
// Result: ""
```

#### `formatRelativeDate(date: Date): string`

Formats a date relative to the current time with intelligent formatting:
- "Today, [time]" for today's dates
- "Yesterday, [time]" for yesterday's dates  
- "MMM d, h:mm a" for dates in current year
- "MMM d, yyyy" for dates in other years

```typescript
import { formatRelativeDate } from "@hybrd/utils"

const today = new Date()
const todayFormatted = formatRelativeDate(today)
// Result: "Today, 2:30 PM"

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
const yesterdayFormatted = formatRelativeDate(yesterday)
// Result: "Yesterday, 2:30 PM"
```

### Object Utilities

#### `stringifyValues(obj: Record<string, unknown>): Record<string, string>`

Stringifies all values in an object, including objects and null values. Returns an empty object if input is undefined.

```typescript
import { stringifyValues } from "@hybrd/utils"

const mixed = {
  string: "hello",
  number: 42,
  object: { nested: true },
  nullValue: null,
  boolean: false
}

const stringified = stringifyValues(mixed)
// Result: {
//   string: "hello",
//   number: "42", 
//   object: '{"nested":true}',
//   nullValue: "null",
//   boolean: "false"
// }
```

#### `pruneEmpty<T>(obj: T): Partial<T>`

Removes empty values (undefined, null, empty strings) from an object.

```typescript
import { pruneEmpty } from "@hybrd/utils"

const withEmpties = {
  name: "John",
  email: "",
  age: null,
  active: true,
  notes: undefined
}

const pruned = pruneEmpty(withEmpties)
// Result: { name: "John", active: true }
```

### Markdown Utilities

#### `stripMarkdown(markdown: string): Promise<string>`

Strips markdown formatting from a string, returning plain text.

```typescript
import { stripMarkdown } from "@hybrd/utils"

const markdown = "# Hello **world**\n\nThis is *italic* text."
const plain = await stripMarkdown(markdown)
// Result: "Hello world\n\nThis is italic text."
```

### Cloudflare Utilities

#### `getCloudflareEnvironment(): CloudflareEnvironment`

Detects if running in Cloudflare environment and returns appropriate configuration.

```typescript
import { getCloudflareEnvironment } from "@hybrd/utils"

const env = getCloudflareEnvironment()
// Result: { isCloudflare: boolean, branch?: string, url?: string }
```

#### `getCloudflareStoragePath(subPath?: string): string`

Gets the appropriate storage path for the current environment.

```typescript
import { getCloudflareStoragePath } from "@hybrd/utils"

const storagePath = getCloudflareStoragePath("uploads")
// Result: appropriate path based on environment
```

#### `getCloudflareServiceUrl(fallbackPort?: number): string`

Gets service URL based on Cloudflare environment variables.

```typescript
import { getCloudflareServiceUrl } from "@hybrd/utils"

const serviceUrl = getCloudflareServiceUrl(3000)
// Result: CF_PAGES_URL or localhost with fallback port
```

### Storage Utilities

#### `R2StorageAdapter`

Storage adapter for Cloudflare R2.

```typescript
import { R2StorageAdapter } from "@hybrd/utils"

const adapter = new R2StorageAdapter(bucket)
await adapter.uploadFile(localPath, remotePath)
await adapter.downloadFile(remotePath, localPath)
await adapter.delete(remotePath)
```

#### `ExternalDatabaseAdapter`

Storage adapter for external databases.

```typescript
import { ExternalDatabaseAdapter } from "@hybrd/utils"

const adapter = new ExternalDatabaseAdapter(connectionString)
await adapter.uploadFile(localPath, remotePath)
```

#### `createStorageAdapter(): StorageAdapter | null`

Factory function to create appropriate storage adapter based on environment.

```typescript
import { createStorageAdapter } from "@hybrd/utils"

const adapter = createStorageAdapter()
if (adapter) {
  await adapter.uploadFile(localPath, remotePath)
}
```

### URL Utilities

#### `getUrl(path?: string): string`

Gets the appropriate URL for the current environment, checking:
1. `AGENT_URL` environment variable
2. `RAILWAY_PUBLIC_DOMAIN` environment variable (Railway deployment)
3. `http://localhost:8454/` (default)

```typescript
import { getUrl } from "@hybrd/utils"

const baseUrl = getUrl()
// Result: appropriate URL based on environment

const apiUrl = getUrl("/api/messages")
// Result: full URL with path appended
```

### UUID Utilities

#### `randomUUID(): string`

Generates a random UUID string. Uses the uuid package for browser compatibility.

```typescript
import { randomUUID } from "@hybrd/utils"

const id = randomUUID()
// Result: "550e8400-e29b-41d4-a716-446655440000"
```

## Dependencies

This package uses the following external dependencies:

- `date-fns` - Date formatting and manipulation
- `remark` & `strip-markdown` - Markdown processing
- `uuid` - UUID generation

## Related Packages

- [`hybrid`](../core) - Main agent framework
- [`@hybrd/xmtp`](../xmtp) - XMTP client integration
- [`@hybrd/cli`](../cli) - Command-line interface

## Links

- Main repo: [github.com/ian/hybrid](https://github.com/ian/hybrid)
- Website & docs: [hybrid.dev](https://hybrid.dev)

## License

ISC
