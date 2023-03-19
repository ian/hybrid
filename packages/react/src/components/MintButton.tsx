import { useMinting } from "../hooks/useMinting"
import { useConnect, useNetwork, useSigner, useSwitchNetwork } from "wagmi"
import DefaultButton, { DefaultButtonProps } from "./DefaultButton"
import { DeployedContract } from "@hybrd/types"

type MintButtonProps = {
  className?: string
  contract: DeployedContract
  button?: React.FC<DefaultButtonProps>
  amount?: number
}

const MintButton = (props: MintButtonProps) => {
  const {
    amount = 1,
    button: Button = DefaultButton,
    className,
    contract
  } = props
  const { data: signer } = useSigner()
  const { connect, connectors } = useConnect()
  const { chain: network } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const { isMinting, isSuccess, isError, mint } = useMinting(contract)

  console.log({ contract })

  if (isMinting) {
    return (
      <Button disabled className={className}>
        Minting
      </Button>
    )
  }

  if (isSuccess) {
    return (
      <Button disabled className={className} intent="success">
        Minted
      </Button>
    )
  }

  if (isError) {
    return (
      <Button disabled className={className} intent="error">
        Error Occurred
      </Button>
    )
  }

  if (!signer) {
    const connector = connectors[0]
    return (
      <Button className={className} onClick={() => connect({ connector })}>
        Connect Wallet
      </Button>
    )
  }

  if (network?.id !== contract?.chainId && switchNetwork) {
    return (
      <Button
        onClick={() => switchNetwork(contract?.chainId)}
        className={className}
        intent="error"
      >
        Switch Network
      </Button>
    )
  }

  return (
    <Button className={className} onClick={() => mint(amount)}>
      Mint Now
    </Button>
  )
}

export default MintButton
