import { DeployedContract } from "@hybrd/types"
import { useBlockNumber, useContract, useProvider } from "wagmi"
import { useAsyncMemo } from "../hooks/internal/useAsyncMemo"
import { BigNumber } from "ethers"

type TotalSupplyProps = {
  className?: string
  contract: DeployedContract
}

const TotalSupply = (props: TotalSupplyProps) => {
  const { className, contract: deployedContract } = props
  const chainId = deployedContract?.chainId
  const provider = useProvider({ chainId })
  const { data: block } = useBlockNumber({ watch: true })

  const contract = useContract({
    address: deployedContract?.address,
    abi: deployedContract?.abi
  })

  const totalSupply: number = useAsyncMemo(() => {
    if (!contract) return
    return contract
      .connect(provider)
      .totalSupply()
      .then((res: BigNumber) => res.toNumber())
  }, [contract, block])

  return <span className={className}>{totalSupply}</span>
}

export default TotalSupply
