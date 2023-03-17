import { useMinting } from "../hooks/useMinting"
import { useConnect, useNetwork, useSigner, useSwitchNetwork } from "wagmi"
import DefaultButton, { DefaultButtonProps } from "./DefaultButton"
import { Contract } from "types"

type MintButtonProps = {
  className?: string
  contract: Contract
  button?: React.FC<DefaultButtonProps>
  amount: number
}

const chainId = 1337

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

  if (network?.id !== chainId && switchNetwork) {
    return (
      <Button
        onClick={() => switchNetwork(chainId)}
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
