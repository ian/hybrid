import React from "react"
import { useHybridContext } from "../providers/Web3Provider"

export type UseWallet = {
  connect: () => void
}

export type UseWalletProps = { chainId?: number }

export function useWallet(props?: UseWalletProps): UseWallet {
  const { chainId } = props || {}

  const [context, setContext] = React.useState<UseWallet>({
    connect: () => {},
  })

  const { wallet } = useHybridContext()

  // Some of the wallet provideers don't like to be loaded on the server.
  // So we only create the context on the client.
  React.useEffect(() => {
    const context = wallet({ chainId })
    setContext(context)
  }, [wallet, chainId])

  return context
}
