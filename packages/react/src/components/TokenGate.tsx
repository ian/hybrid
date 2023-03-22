import React from "react"
import { useAccount } from "wagmi"
import { useTokenGating } from "../hooks/useTokenGating"
import { DeployedContract } from "@hybrd/types"

type Props = {
  children: React.ReactNode
  contract: DeployedContract
  loading?: React.ReactNode
  deny?: React.ReactNode
}

const TokenGate: React.FC<Props> = ({
  children,
  contract,
  loading: loadingComponent = <p>Loading</p>,
  deny: denyComponent = <p>You must own a token to view this content.</p>
}: Props) => {
  const { address } = useAccount()
  const { isLoading, allow } = useTokenGating({ address, contract })

  return <>{isLoading ? loadingComponent : allow ? children : denyComponent}</>
}

export default TokenGate
