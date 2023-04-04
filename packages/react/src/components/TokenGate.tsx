import React from "react"
import { useAccount } from "wagmi"
import { useTokenGating } from "../hooks/useTokenGating"
import { DeployedContract } from "@hybrd/types"
import DefaultButton, { DefaultButtonProps } from "./DefaultButton"
import { useHybridContext } from "providers/Web3Provider"

type Props = {
  className?: string
  button?: React.FC<DefaultButtonProps>
  style?: React.CSSProperties
  children: React.ReactNode
  contract: DeployedContract
  loading?: React.ReactNode
  deny?: React.ReactNode
}

const TokenGate: React.FC<Props> = ({
  className,
  style,
  children,
  contract,
  button: Button = DefaultButton,
  loading: loadingComponent = <p>Loading</p>,
  deny: denyComponent = <p>You must own a token to view this content.</p>
}: Props) => {
  const { address } = useAccount()
  const { useContext } = useHybridContext()
  const { connect } = useContext()

  const { isLoading, allow } = useTokenGating({ address, contract })

  if (!address) {
    return (
      <Button className={className} style={style} onClick={() => connect()}>
        Connect Wallet
      </Button>
    )
  }

  if (isLoading) {
    return (
      <span className={className} style={style}>
        {loadingComponent}
      </span>
    )
  }

  if (allow) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <span className={className} style={style}>
      {denyComponent}
    </span>
  )
}

export default TokenGate
