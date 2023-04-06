import { ethers, Signer, utils, Wallet } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useBlockNumber, useProvider } from "wagmi"
import type { BytesLike, Deferrable } from "ethers/lib/utils"

type DataOrFn = BytesLike | ((signer: Signer) => BytesLike) | null

type Estimate = {
	gas?: number
	gasPrice?: number
	wei?: number
	eth?: number
}

const useBlockBeat = () => {
	const [block, setBlock] = useState<number>()
	useBlockNumber({ watch: true, onBlock: setBlock })

	return block
}

type Opts = {
	deployData: DataOrFn
	chainId?: number
}

export function useEstimation(opts: Opts) {
	const { deployData, chainId } = opts
	const provider = useProvider({ chainId })
	const block = useBlockBeat()

	const [estimate, setEstimate] = useState<Estimate>({
		gas: undefined,
		gasPrice: undefined,
		wei: undefined,
		eth: undefined
	})

	const buildData = useCallback(
		(provider: any) => {
			return typeof deployData === "function"
				? deployData(provider)
				: deployData
		},
		[deployData]
	)

	useEffect(() => {
		const { address: from } = Wallet.createRandom()
		const data = buildData(provider)
		if (!data) return

		getEstimate(provider, {
			data,
			from
		})
			.then(setEstimate)
			.catch((err) => {
				console.error("useEstimation", err)
			})
	}, [block, provider, chainId, buildData])

	return estimate
}

async function getEstimate(
	provider: any,
	tx: Deferrable<ethers.providers.TransactionRequest>
) {
	const gas = await provider.estimateGas(tx)
	const gasPrice = await provider.getGasPrice()
	const wei = gas.mul(gasPrice)
	const eth = parseFloat(utils.formatUnits(wei, "ether"))

	return {
		gas,
		gasPrice,
		wei,
		eth
	}
}
