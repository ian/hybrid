import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: [
		"ai",
		"zod",
		"@xmtp/content-type-group-updated",
		"@xmtp/content-type-reaction",
		"@xmtp/content-type-reply",
		"@xmtp/content-type-transaction-reference",
		"@xmtp/content-type-wallet-send-calls",
		"@xmtp/node-sdk",
		"hono"
	]
})
