import { defineConfig } from "vocs"

export default defineConfig({
	title: "Hybrid",
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
			text: "Agent Configuration",
			items: [
				{
					text: "Behaviors",
					link: "/agent-configuration/behaviors"
				},
				{
					text: "Models",
					link: "/agent-configuration/models"
				},
				{
					text: "Prompts",
					link: "/agent-configuration/prompts"
				}
			]
		},
		{
			text: "Tools & Features",
			items: [
				{
					text: "Tools",
					link: "/tools"
				},
				{
					text: "Mini Apps",
					link: "/mini-apps"
				}
			]
		},
		{
			text: "Blockchain Integration",
			items: [
				{
					text: "Overview",
					link: "/blockchain/tools"
				},
				{
					text: "Foundry",
					link: "/blockchain/foundry"
				},
				{
					text: "Multi-chain",
					link: "/blockchain/multi-chain"
				},
				{
					text: "Ponder",
					link: "/blockchain/ponder"
				}
			]
		},
		{
			text: "XMTP Integration",
			items: [
				{
					text: "Introduction",
					link: "/xmtp/introduction"
				},
				{
					text: "Advanced",
					link: "/xmtp/advanced"
				},
				{
					text: "Tools",
					link: "/xmtp/tools"
				}
			]
		},
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
