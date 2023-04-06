import { DeployedContract } from "@hybrd/types"
import { BigNumber } from "ethers"
import { useEffect, useState } from "react"
import { useContract, useProvider } from "wagmi"

type UseTokenGating = {
  isLoading: boolean
  address: string
  allow: boolean
  deny: boolean
}

export function useTokenGating(props: {
  contract: DeployedContract
  address: `0x${string}`
}): UseTokenGating {
  const { address, contract: deployedContract } = props
  const chainId = deployedContract?.chainId
  const provider = useProvider({ chainId })

  const [isLoading, setLoading] = useState(true)
  const [allow, setAllow] = useState<boolean>()
  const [deny, setDeny] = useState<boolean>()

  const contract = useContract(deployedContract)

  useEffect(() => {
    if (!deployedContract) {
      setLoading(false)
      setAllow(false)
      setDeny(true)
    }

    if (!contract) return
    contract
      .connect(provider)
      .balanceOf(address)
      .then((res: BigNumber) => res.toNumber())
      .then((bal) => bal > 0)
      .then((allow) => {
        setAllow(allow)
        setDeny(!allow)
      })
      .catch((err: Error) => {
        console.error(err)
        setAllow(false)
        setDeny(true)
      })
      .finally(() => setLoading(false))
  }, [address, deployedContract])

  return {
    isLoading: isLoading,
    address,
    allow,
    deny,
  }
}
