const rehypePrettyCode = require("rehype-pretty-code")
const fs = require("fs")

const options = {
	// Use one of Shiki's packaged themes
	theme: "one-dark-pro",
	// Or your own JSON theme
	// theme: JSON.parse(
	// 	fs.readFileSync(require.resolve("./themes/dark.json"), "utf-8")
	// ),

	// Keep the background or use a custom background color?
	keepBackground: false,

	// Callback hooks to add custom logic to nodes when visiting
	// them.
	onVisitLine(node) {
		// Prevent lines from collapsing in `display: grid` mode, and
		// allow empty lines to be copy/pasted
		if (node.children.length === 0) {
			node.children = [{ type: "text", value: " " }]
		}
	},
	onVisitLine(node) {
		node.properties.className.push("normal")
	},
	onVisitHighlightedLine(node) {
		// Each line node by default has `class="line"`.
		node.properties.className.push("highlighted")
	},
	onVisitHighlightedWord(node) {
		// Each word node has no className by default.
		node.properties.className = ["word"]
	}
}

const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
	options: {
		// If you use remark-gfm, you'll need to use next.config.mjs
		// as the package is ESM only
		// https://github.com/remarkjs/remark-gfm#install
		remarkPlugins: [],
		rehypePlugins: [[rehypePrettyCode, options]]
		// If you use `MDXProvider`, uncomment the following line.
		// providerImportSource: "@mdx-js/react",
	}
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Configure pageExtensions to include md and mdx
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	// Optionally, add any other Next.js config below

	reactStrictMode: false,
	//
	images: {
		unoptimized: true
	}
}

// Merge MDX config with Next.js config
module.exports = withMDX(nextConfig)
