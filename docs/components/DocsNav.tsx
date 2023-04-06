import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import styles from "./DocsNav.module.css"

export default function DocsNav({
	className,
	style
}: {
	className?: string
	active?: string
	style?: object
}) {
	const router = useRouter()

	return (
		<nav className={clsx(styles.DocsNav, className)} style={style}>
			{/* <Link href="/"><Logo className="mb-5" /></Link> */}

			{NAV.map(({ label, links }) => (
				<ul className="mb-5" key={label}>
					<p className="mb-1 text-xs font-medium text-gray-700 uppercase">
						{label}
					</p>

					{links.map(({ label, href }, i) => (
						<li className="mb-1 mr-6" key={`DocsNav-${i}`}>
							<Link
								className={
									clsx(router.asPath === href && styles.DocsNavItemActive)

									// router.asPath === href
									// 	? "text-blue-500 font-bold"
									// 	: "text-gray-400 hover:text-gray-100"
								}
								href={href}
							>
								{label}
							</Link>
						</li>
					))}
				</ul>
			))}
		</nav>
	)
}

const NAV = [
	{
		label: "Overview",
		links: [
			{
				label: "Introduction",
				href: "/docs"
			},
			{
				label: "Smart Contracts",
				href: "/docs/smart-contracts"
			},
			{
				label: "Deployment",
				href: "/docs/deployment"
			},
			{
				label: "Configuration",
				href: "/docs/configuration"
			}

			// {
			// 	label: "Discord",
			// 	href: "https://discord.gg/CfrVhsVhfc",
			// 	target: "_blank"
			// },
			// {
			// 	label: "Twitter",
			// 	href: "https://twitter.com/hybrid__dev",
			// 	target: "_blank"
			// }
		]
	},
	{
		label: "Quickstart",
		links: [
			{
				label: "Next.js",
				href: "/docs/quickstart/nextjs"
			},
			{
				label: "React",
				href: "/docs/quickstart/react"
			}
			// {
			// 	label: "Remix",
			// 	href: "/docs/quickstart/remix"
			// },
			// {
			// 	label: "Redwood",
			// 	href: "/docs/quickstart/redwood"
			// }
		]
	},
	{
		label: "CLI",
		links: [
			// {
			// 	label: "build",
			// 	href: "/docs/cli#build"
			// },
			{
				label: "dev",
				href: "/docs/cli#dev"
			},
			{
				label: "deploy",
				href: "/docs/cli#deploy"
			}
		]
	},
	// {
	// 	label: "Smart Contracts",
	// 	links: [
	// 		{
	// 			label: "Overview",
	// 			href: "/docs/contracts/overview"
	// 		}
	// 		// {
	// 		// 	label: "ERC721",
	// 		// 	href: "/docs/contracts/ERC721"
	// 		// }
	// 	]
	// },
	{
		label: "Wallet Connection",
		links: [
			{
				label: "Connectkit",
				href: "/docs/wallet/connectkit"
			},
			// {
			// 	label: "Magic Link",
			// 	href: "/docs/wallet/magiclink"
			// },
			{
				label: "Rainbowkit",
				href: "/docs/wallet/rainbowkit"
			}
		]
	},
	{
		label: "Components",
		links: [
			{
				label: "<ConnectedAs />",
				href: "/docs/components/ConnectedAs"
			},
			{
				label: "<MintButton />",
				href: "/docs/components/MintButton"
			},
			{
				label: "<TokenGate />",
				href: "/docs/components/TokenGate"
			},
			{
				label: "<TotalSupply />",
				href: "/docs/components/TotalSupply"
			}
		]
	},
	{
		label: "Hooks",
		links: [
			// {
			// 	label: "useAllowList",
			// 	href: "/docs/hooks/useAllowList"
			// },
			// {
			// 	label: "useCounts",
			// 	href: "/docs/hooks/useCounts"
			// },
			{
				label: "useMinting",
				href: "/docs/hooks/useMinting"
			},
			{
				label: "useTokenGating",
				href: "/docs/hooks/useTokenGating"
			}
		]
	}
]
