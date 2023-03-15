import type { TransactionResponse } from "@ethersproject/providers"
import { BigNumber } from "ethers"
import { useCallback, useState } from "react"
import { useAsyncMemo } from "use-async-memo"
import { useBlockNumber, useContract, useProvider, useSigner } from "wagmi"
import { useContext } from "./internal"
import { Contract } from "types"

export const useMinting = (config: Contract) => {
  const { abi } = config
  const { address, chainId } = useContext()

  const { data: block } = useBlockNumber()
  const provider = useProvider({ chainId })
  const { data: signer } = useSigner({ chainId })

  const [isMinting, setMinting] = useState<boolean>(false)
  const [isSuccess, setSuccess] = useState<boolean>(false)
  const [isError, setError] = useState<boolean>(false)

  const contract = useContract({
    address,
    abi
  })

  const totalSupply = useAsyncMemo(() => {
    if (!contract) return
    return contract
      .connect(provider)
      .totalSupply()
      .then((res: BigNumber) => res.toNumber())
  }, [contract, block])

  const mint = useCallback(() => {
    if (!contract) return

    setMinting(true)
    contract
      .connect(signer)
      .mint(1)
      .then((tx: TransactionResponse) => tx.wait())
      .then(() => {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      })
      .catch((err: Error) => {
        console.error(err)
        setError(true)
        setTimeout(() => setError(false), 1000)
      })
      .finally(() => setMinting(false))
  }, [signer, contract])

  return {
    isMinting,
    isSuccess,
    isError,
    totalSupply,
    mint
  }
}
