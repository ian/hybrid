import { defineConfig } from "tsup"

export default defineConfig({
	entry: {
		index: "src/cli.ts",
		cli: "src/cli.ts"
	},
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	outDir: "dist",
	target: "es2020",
	shims: true
})
