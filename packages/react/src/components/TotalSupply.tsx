import { useMinting } from "../hooks/useMinting"
import { DeployedContract } from "@hybrd/types"

type MintButtonProps = {
  className?: string
  contract: DeployedContract
}

const MintButton = (props: MintButtonProps) => {
  const { className, contract } = props
  const { totalSupply } = useMinting({ contract })

  return <span className={className}>{totalSupply}</span>
}

export default MintButton
