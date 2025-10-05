import { defineConfig } from "vocs"

export default defineConfig({
	// rootDir: 'site',
	title: "hybrid",
	description: "Typescript Framework for building crypto AI Agents",
	theme: {
		accentColor: "#F87400"
	},
	iconUrl: {
		light: "/hybrid.svg",
		dark: "/hybrid.svg"
	},
	logoUrl: {
		light: "/hybrid-logo-light.svg",
		dark: "/hybrid-logo-dark.svg"
	},
	// topNav: [
	// 	{ text: "Guide & API", link: "/docs" },
	// 	{ text: "Blog", link: "/blog" },
	// 	{
	// 		// text: version,
	// 		text: "1234",
	// 		items: [
	// 			{
	// 				text: "Changelog",
	// 				link: "https://github.com/wevm/vocs/blob/main/src/CHANGELOG.md"
	// 			},
	// 			{
	// 				text: "Contributing",
	// 				link: "https://github.com/wevm/vocs/blob/main/.github/CONTRIBUTING.md"
	// 			}
	// 		]
	// 	}
	// ],
	socials: [
		// {
		// 	icon: "discord",
		// 	link: "https://discord.gg/JUrRkGweXV"
		// },
		{
			icon: "github",
			link: "https://github.com/hybrid-npm/hybrid"
		},
		{
			icon: "x",
			link: "https://twitter.com/hybrid_npm"
		}
	],
	sidebar: [
		{
			text: "Getting Started",
			items: [
				{
					text: "Overview",
					link: "/"
				},
				{
					text: "Quickstart",
					link: "/quickstart"
				},
				{
					text: "Core Concepts",
					link: "/core-concepts"
				},
				{
					text: "Using Hybrid",
					link: "/using-hybrid"
				}
			]
		},
		{
			text: "Agents",
			items: [
				{
					text: "Prompts",
					link: "/agent/prompts"
				},
				{
					text: "Models",
					link: "/agent/models"
				},
				{
					text: "Behaviors",
					link: "/agent/behaviors"
				},
				{
					text: "Runtimes",
					link: "/agent/runtime"
				}
			]
		},
		{
			text: "Tools",
			items: [
				{
					text: "Overview",
					link: "/tools"
				},
				{
					text: "Blockchain Tools",
					link: "/tools/blockchain"
				},
				{
					text: "XMTP Tools",
					link: "/tools/xmtp"
				}
			]
		},
		{
			text: "Deployment",
			items: [
				{
					text: "Cloudflare",
					link: "/deployment/cloudflare"
				}
			]
		},
		{
			text: "How To",
			items: [
				{
					text: "Mini Apps",
					link: "/howto/mini-apps"
				}
			]
		},
		// {
		// 	text: "Blockchain",
		// 	items: [
		// 		{
		// 			text: "Foundry",
		// 			link: "/blockchain/foundry"
		// 		},
		// 		// {
		// 		// 	text: "Multi-chain",
		// 		// 	link: "/blockchain/multi-chain"
		// 		// },
		// 		{
		// 			text: "Ponder",
		// 			link: "/blockchain/ponder"
		// 		}
		// 	]
		// },
		{
			text: "Development",
			items: [
				{
					text: "Framework",
					link: "/developing/framework"
				},
				{
					text: "Plugins",
					link: "/developing/plugins"
				},
				{
					text: "Advanced",
					link: "/developing/advanced"
				},
				{
					text: "Deployment",
					link: "/developing/deployment"
				},
				{
					text: "Contributing",
					link: "/developing/contributing"
				}
			]
		}
	]
})
