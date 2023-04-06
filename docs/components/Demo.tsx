import { WalletConnector, Web3Provider } from "hybrid"
import { DisableSSR } from "next-tools"
import {
	mainnet,
	goerli,
	localhost,
	arbitrum,
	arbitrumGoerli
} from "wagmi/chains"

import { RainbowKit } from "hybrid-rainbowkit"
import { darkTheme } from "@rainbow-me/rainbowkit"

const chains = [mainnet, goerli, arbitrum, arbitrumGoerli, localhost]

export default function Demo({
	children,
	wallet = RainbowKit({
		appName: "Hybrid",
		theme: darkTheme()
	})
}: {
	children: JSX.Element
	wallet?: WalletConnector
}) {
	return (
		<DisableSSR>
			<Web3Provider
				chains={chains}
				wallet={wallet}
				alchemyKey={process.env.NEXT_PUBLIC_ALCHEMY_KEY}
			>
				<div className="mt-10">
					<h4 className="mb-2 text-sm uppercase text-thin">Demo</h4>
					<div
						style={grid}
						className="flex items-center justify-center py-12 bg-blue-900 bg-opacity-20 rounded-xl"
					>
						{children}
					</div>
				</div>
			</Web3Provider>
		</DisableSSR>
	)
}

const grid = {
	backgroundImage: `linear-gradient(#53DDB400 2px, transparent 2px),
										linear-gradient(90deg, #53DDB400 2px, transparent 2px),
										linear-gradient(#53DDB410 1px, transparent 1px),
										linear-gradient(90deg, #53DDB410 1px, transparent 1px)`,
	backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
	backgroundPosition: "center"
}
