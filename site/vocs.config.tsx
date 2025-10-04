import React from "react"
import { defineConfig } from "vocs"

export default defineConfig({
	title: "Hybrid",
	theme: {
		colorScheme: "dark",
		accentColor: "#FF5C00"
	},
	head: {
		"/": <a href="https://github.com/hybrid-ai/hybrid">GitHub</a>
	},
	sidebar: [
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
		},
		{
			text: "Agent Configuration",
			collapsed: false,
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
			collapsed: false,
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
			collapsed: false,
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
			text: "Developing and Contribution",
			collapsed: true,
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
