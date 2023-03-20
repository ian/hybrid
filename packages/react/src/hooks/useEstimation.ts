import { ethers, Signer, utils, Wallet } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useBlockNumber, useProvider, useWebSocketProvider } from "wagmi"
import type { BytesLike, Deferrable } from "ethers/lib/utils"

type DataOrFn = BytesLike | ((signer: Signer) => BytesLike) | null

type Estimate = {
  gas?: number
  gasPrice?: number
  wei?: number
  eth?: number
}

export function useEstimation(dataOrFn: DataOrFn, chainId?: number) {
  const provider = useProvider({ chainId })
  const { data: block } = useBlockNumber({ watch: true })

  const [estimate, setEstimate] = useState<Estimate>({
    gas: undefined,
    gasPrice: undefined,
    wei: undefined,
    eth: undefined
  })

  const buildData = useCallback(
    (provider) => {
      return typeof dataOrFn === "function" ? dataOrFn(provider) : dataOrFn
    },
    [dataOrFn]
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
  const gas = await provider
    .estimateGas(tx)
    .then((res) => res.toString())
    .then(Number)

  const gasPrice = await provider
    .getFeeData()
    .then((res) => res.maxFeePerGas.toString())
    .then(Number)

  const wei = gas * gasPrice
  const eth = parseFloat(utils.formatUnits(wei, "ether"))

  return {
    gas,
    gasPrice,
    wei,
    eth
  }
}
