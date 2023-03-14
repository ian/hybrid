import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"

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
		<nav className={clsx("", className)} style={style}>
			{NAV.map(({ label, links }) => (
				<ul className="mb-5" key={label}>
					<p className="mb-1 text-xs font-medium text-gray-700 uppercase">
						{label}
					</p>

					{links.map(({ label, href }) => (
						<li className="mb-1 mr-6" key={label}>
							<Link
								className={
									router.asPath === href
										? "text-green-500 font-bold"
										: "text-gray-400 hover:text-gray-100"
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
		label: "Start Here",
		links: [
			{
				label: "What is MintDrop?",
				href: "/#welcome"
			},
			// {
			// 	id: "quickstart",
			// 	label: "Quickstart",
			// 	href: "/#quickstart"
			// },
			{
				label: "Examples",
				href: "/docs/examples"
			}
		]
	},
	{
		label: "Getting Started",
		links: [
			{
				label: "Next.js",
				href: "/docs/nextjs"
			}
		]
	},
	{
		label: "CLI",
		links: [
			{
				label: "mint dev",
				href: "/docs/cli/dev"
			},
			{
				label: "mint build",
				href: "/docs/cli/build"
			},
			{
				label: "mint deploy",
				href: "/docs/cli/deploy"
			}
		]
	},
	{
		label: "Smart Contracts",
		links: [
			{
				label: "Overview",
				href: "/docs/contracts/overview"
			}
			// {
			// 	label: "ERC721",
			// 	href: "/docs/contracts/ERC721"
			// }
		]
	},
	{
		label: "Wallet Connect",
		links: [
			{
				label: "Connectkit",
				href: "/docs/wallet/connectkit"
			},
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
				label: "<MintButton />",
				href: "/docs/components/MintButton"
			},
			// {
			// 	label: "<MintWidget />",
			// 	href: "/docs/components/MintWidget"
			// },
			{
				label: "<TokenGate />",
				href: "/docs/components/TokenGate"
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
			{
				label: "useCounts",
				href: "/docs/hooks/useCounts"
			},
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
