import type {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers"
import { BigNumber } from "ethers"
import { useCallback, useState } from "react"
import { useContract, useSigner } from "wagmi"

import { DeployedContract } from "@hybrd/types"

type UseMinting = {
  isMinting: boolean
  isSuccess: boolean
  isError: boolean
  mint: (amount: number) => Promise<TransactionReceipt | undefined>
}

type MintOpts = {
  value?: BigNumber | string
  gasPrice?: BigNumber | number
}

type Props = {
  contract: DeployedContract
}

export const useMinting = (props: Props): UseMinting => {
  const { contract: deployedContract } = props
  const chainId = deployedContract?.chainId
  const { data: signer } = useSigner({ chainId })

  const [isMinting, setMinting] = useState<boolean>(false)
  const [isSuccess, setSuccess] = useState<boolean>(false)
  const [isError, setError] = useState<boolean>(false)

  const contract = useContract(deployedContract)

  const mint = useCallback(
    async (amount: number, opts: MintOpts = {}) => {
      if (!contract) return
      setMinting(true)

      // For localhost, we need to set the gas price manually
      // const gasPrice = chainId === 1337 ? await signer.getGasPrice() : null
      const { value = BigNumber.from("0"), gasPrice } = opts

      return contract
        .connect(signer)
        .mint(amount, {
          value,
          gasPrice,
        })
        .then((tx: TransactionResponse) => tx.wait())
        .then((reciept: TransactionReceipt) => {
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
          return reciept
        })
        .catch((err: Error) => {
          console.error(err)
          setError(true)
          setTimeout(() => setError(false), 1000)
        })
        .finally(() => setMinting(false))
    },
    [signer, contract, chainId]
  )

  return {
    isMinting,
    isSuccess,
    isError,
    mint,
  }
}
