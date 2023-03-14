import { Abi } from "abitype"
import clsx from "clsx"
import { useMinting } from "hooks/useMinting"
import { useConnect, useNetwork, useSigner, useSwitchNetwork } from "wagmi"

type MintButtonProps = {
  className?: string
  abi: Abi
  button?: React.FC<DefaultButtonProps>
}

const address = "0xc4001295a6f18f8F8Ca7Df1EC28c0b104E17DD99"
const chainId = 1337

const MintButton = (props: MintButtonProps) => {
  const { button: Button = DefaultButton, className, abi } = props
  const { data: signer } = useSigner()
  const { connect, connectors } = useConnect()
  const { chain: network } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()

  const { isMinting, isSuccess, isError, mint, totalSupply } = useMinting({
    abi
  })

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
    <Button className={className} onClick={mint}>
      Mint Now
    </Button>
  )
}

type DefaultButtonProps = {
  className?: string
  intent?: "default" | "success" | "error"
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

const INTENTS = {
  default: "text-white bg-blue-500",
  success: "text-white bg-green-500",
  error: "text-white bg-red-500"
}

const DefaultButton = (props: DefaultButtonProps) => {
  const {
    className = "px-8 py-3 transition-all cursor-pointer duration-250 hover:scale-[1.05] rounded-xl font-bold",
    intent = "default",
    onClick,
    children,
    disabled
  } = props

  return (
    <button
      className={clsx(className, INTENTS[intent], disabled && "brightness-75")}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default MintButton
