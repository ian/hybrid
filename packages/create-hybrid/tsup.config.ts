import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	minify: false,
	sourcemap: true,
	target: "node20",
	banner: {
		js: "#!/usr/bin/env node"
	}
})
