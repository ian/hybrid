import type {
  TransactionReceipt,
  TransactionResponse
} from "@ethersproject/providers"
import { BigNumber } from "ethers"
import { useCallback, useState } from "react"
import { useBlockNumber, useContract, useProvider, useSigner } from "wagmi"

import { DeployedContract } from "@hybrd/types"
import { useAsyncMemo } from "./internal/useAsyncMemo"

type UseMinting = {
  isMinting: boolean
  isSuccess: boolean
  isError: boolean
  totalSupply: number | undefined
  mint: (amount: number) => Promise<TransactionReceipt | undefined>
}

type MintOpts = {
  value?: BigNumber | string
  gasPrice?: BigNumber | number
}

export const useMinting = (config: DeployedContract): UseMinting => {
  const address = config?.address
  const chainId = config?.chainId

  const { data: block } = useBlockNumber()
  const provider = useProvider({ chainId })
  const { data: signer } = useSigner({ chainId })

  const [isMinting, setMinting] = useState<boolean>(false)
  const [isSuccess, setSuccess] = useState<boolean>(false)
  const [isError, setError] = useState<boolean>(false)

  const contract = useContract({
    address,
    abi: config?.abi
  })

  const totalSupply: number = useAsyncMemo(() => {
    if (!contract) return
    return contract
      .connect(provider)
      .totalSupply()
      .then((res: BigNumber) => res.toNumber())
  }, [contract, block])

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
          gasPrice
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
    totalSupply,
    mint
  }
}
