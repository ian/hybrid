import { defineConfig } from "vocs"

export default defineConfig({
	title: "Hybrid",
	description: "TypeScript Framework for building crypto AI Agents",
	logoUrl: "/logo.png",
	topNav: [
		{ text: "Documentation", link: "/quickstart" },
		{ text: "GitHub", link: "https://github.com/hybrid-ai/hybrid" }
	],
	sidebar: [
		{
			text: "Getting Started",
			items: [
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
			text: "Agent Configuration",
			items: [
				{
					text: "Prompts & Instructions",
					link: "/agent-configuration/prompts"
				},
				{
					text: "Models & AI Providers",
					link: "/agent-configuration/models"
				},
				{
					text: "Behaviors",
					link: "/agent-configuration/behaviors"
				}
			]
		},
		{
			text: "XMTP",
			items: [
				{
					text: "Introduction to XMTP",
					link: "/xmtp/introduction"
				},
				{
					text: "XMTP Tools",
					link: "/xmtp/tools"
				},
				{
					text: "Advanced Features",
					link: "/xmtp/advanced"
				}
			]
		},
		{
			text: "Mini Apps",
			link: "/mini-apps"
		},
		{
			text: "Tools",
			link: "/tools"
		},
		{
			text: "Blockchain",
			items: [
				{
					text: "Blockchain Tools",
					link: "/blockchain/tools"
				},
				{
					text: "Ponder Integration",
					link: "/blockchain/ponder"
				},
				{
					text: "Foundry Integration",
					link: "/blockchain/foundry"
				},
				{
					text: "Multi-chain Support",
					link: "/blockchain/multi-chain"
				}
			]
		},
		{
			text: "Development",
			items: [
				{
					text: "Contributing to Hybrid",
					link: "/developing/contributing"
				},
				{
					text: "Framework Development",
					link: "/developing/framework"
				},
				{
					text: "Plugin System",
					link: "/developing/plugins"
				},
				{
					text: "Advanced Development",
					link: "/developing/advanced"
				},
				{
					text: "Deployment",
					link: "/developing/deployment"
				}
			]
		}
	]
})
