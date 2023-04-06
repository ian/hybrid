import {
	TransactionReceipt,
	TransactionResponse
} from "@ethersproject/providers"
import { useCallback, useState } from "react"
import { useAccount, useSigner, useNetwork, useSwitchNetwork } from "wagmi"

import Button from "./Button"
import { getDeployData } from "~/lib/deploy"

export type {
	TransactionReceipt as Receipt,
	TransactionResponse as Transaction
} from "@ethersproject/providers"

type Props = {
	className?: string
	chainId: number
	deployData: string | null
	onTx?: (tx: TransactionResponse) => void
	onReceipt?: (receipt: TransactionReceipt) => void
}

export default function DeployButton(props: Props) {
	const { className, chainId, deployData, onTx, onReceipt } = props
	const [isSending, setSending] = useState<boolean>(false)

	const { address } = useAccount()
	const { data: signer } = useSigner({ chainId })
	const { chain: network } = useNetwork()
	const { switchNetwork } = useSwitchNetwork()

	const handleDeploy = useCallback(async () => {
		setSending(true)

		const tx = {
			from: address,
			data: deployData as string
		}

		signer
			?.sendTransaction(tx)
			.then((tx: TransactionResponse) => {
				onTx?.(tx)
				return tx.wait()
			})
			.then((receipt: TransactionReceipt) => {
				onReceipt?.(receipt)
			})
			.catch((err: Error) => console.error(err))
			.finally(() => setSending(false))
	}, [signer, address, deployData, onTx, onReceipt])

	if (chainId !== network?.id) {
		return (
			<Button className={className} intent="error" onClick={() => switchNetwork?.(chainId)}>
				Switch Blockchain
			</Button>
		)
	}

	return (
		<Button className={className} onClick={handleDeploy} disabled={!deployData || isSending}>
			{isSending ? "Deploying ..." : "Deploy to Blockchain"}
		</Button>
	)
}

