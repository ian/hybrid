import { Web3Provider } from "hybrid"
import { DisableSSR } from "next-tools"
import { localhost } from "wagmi/chains"

// This is what I want it to look like:
//
// import { Deployments } from "hybrid/client"
// Deployments.MyNFT = {
// 	address: "0xc4001295a6f18f8F8Ca7Df1EC28c0b104E17DD99",
// 	txHash: "",
// 	chainId: 1337
// }

const address = "0xc4001295a6f18f8F8Ca7Df1EC28c0b104E17DD99"
const chainId = 1337

export default function Example({ children }: { children: JSX.Element }) {
	return (
		<DisableSSR>
			<Web3Provider
				address={address}
				chainId={chainId}
				chains={[localhost]}
				alchemyKey="90ak83PG7C9NxYE9QYKxDAOY0LjNxmi_"
			>
				<div className="mt-10">
					<h4 className="mb-2 text-sm uppercase text-thin">Example</h4>
					<div
						style={grid}
						className="flex items-center justify-center py-12 bg-black rounded-xl"
					>
						{children}
					</div>
				</div>
			</Web3Provider>
		</DisableSSR>
	)
}

const grid = {
	backgroundColor: "#0A0A1D",
	backgroundImage: `linear-gradient(#53DDB400 2px, transparent 2px), 
										linear-gradient(90deg, #53DDB400 2px, transparent 2px), 
										linear-gradient(#53DDB410 1px, transparent 1px), 
										linear-gradient(90deg, #53DDB410 1px, transparent 1px)`,
	backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
	backgroundPosition: "center"
}
