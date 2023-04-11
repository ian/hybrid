import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { useSigner } from "wagmi"
import {
	mainnet,
	goerli,
	polygon,
	polygonMumbai,
	arbitrum,
	arbitrumGoerli,
	optimism,
	optimismGoerli,
	baseGoerli
} from "wagmi/chains"
import { Web3Provider, etherscanTxURL } from "hybrid"
import { RainbowKit } from "hybrid-rainbowkit"
import Confetti from "~/components/Confetti"
import DeployButton, { Transaction, Receipt } from "~/components/DeployButton"
import DeployEstimates from "~/components/DeployEstimates"
import { getDeployData } from "~/lib/deploy"
import { useLocalBridge } from "~/lib/localBridge"
import { useEstimation } from "~/hooks/useEstimation"

type Config = {
	abi: any
	bytecode: string
	chainId: number
}

const wallet = RainbowKit({
	appName: "Hybrid Deployments"
})

function Deployment() {
	const [config, setConfig] = useState<Config>()
	const { data: signer } = useSigner({ chainId: config?.chainId })
	const [receipt, setReceipt] = useState<Receipt>()

	const deployData = useMemo(() => {
		if (!config) return null
		return getDeployData(config.abi, config?.bytecode, signer, [])
	}, [config, signer])

	const estimate = useEstimation({
		deployData,
		chainId: config?.chainId
	})

	const router = useRouter()
	const socket = useLocalBridge(router.query.url as string, {
		init: (args) => setConfig(args)
	})

	const handleTx = (tx: Transaction) => {
		socket?.emit(
			"tx",
			JSON.stringify({
				txHash: tx.hash,
				deployer: tx.from
			})
		)
	}

	const handleReceipt = (receipt: Receipt) => {
		socket?.emit(
			"receipt",
			JSON.stringify({
				blockHash: receipt.blockHash,
				blockNumber: receipt.blockNumber,
				address: receipt.contractAddress,
				deployer: receipt.from,
				txHash: receipt.transactionHash
			})
		)
		setReceipt(receipt)
		socket.close()
	}

	if (!config) return null

	return (
		<div className="flex bg-black bg-center bg-cover">
			{receipt && <Confetti />}

			<div className="z-10 flex flex-col w-full max-w-5xl py-6 mx-auto">
				<div className="max-w-md mx-auto space-y-5">
					<div className="flex items-center justify-center space-x-2">
						<img src="/hybrid.svg" className="w-16" />
						{/* <h1 className="font-mono text-2xl font-black">hybrid</h1> */}
					</div>

					<div className="relative flex flex-col overflow-hidden">
						<div className="p-5">
							<div className="relative w-[350px] group">
								<div className="absolute transition duration-1000 opacity-50 rounded-xl -inset-1 bg-gradient-to-r from-blue-600 to-green-600 blur group-hover:opacity-100 group-hover:duration-200"></div>
								<div className="relative justify-start p-10 space-y-6 leading-none bg-black rounded-xl ring-1 ring-gray-900/5 items-top">
									{receipt && (
										<div className="w-full space-y-5">
											<h1 className="text-xl">Deploy Successful</h1>
											<p>Hybrid settings updated, you can close this window.</p>
											<p>
												<a
													target="_blank"
													href={etherscanTxURL(
														receipt.transactionHash,
														config.chainId
													)}
												>
													View on Etherscan
												</a>
											</p>
										</div>
									)}
									{!receipt && (
										<div className="w-full space-y-5">
											<h1 className="text-xl">Deploy Contract</h1>

											<DeployEstimates
												chainId={config.chainId}
												estimate={estimate}
											/>
											<DeployButton
												className="w-full"
												chainId={config.chainId}
												deployData={deployData}
												onTx={handleTx}
												onReceipt={handleReceipt}
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

const chains = [
	mainnet,
	goerli,
	polygon,
	polygonMumbai,
	arbitrum,
	arbitrumGoerli,
	optimism,
	optimismGoerli,
	baseGoerli
]

export default function DeployPage() {
	return (
		<Web3Provider chains={chains} wallet={wallet}>
			<Deployment />
		</Web3Provider>
	)
}
