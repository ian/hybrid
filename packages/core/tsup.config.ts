import { defineConfig } from "tsup"

export default defineConfig({
	entry: {
		index: "src/index.ts",
		"tools/index": "src/tools/index.ts",
		"ponder/index": "src/ponder/index.ts"
	},
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	outDir: "dist",
	target: "es2020"
})
