import React from "react"
import { configureChains, createClient, Client, useConnect } from "wagmi"
import type { WalletConnection } from "@hybrd/types"

export default function DefaultWalletConnector(config) {
  const { provider, webSocketProvider } = configureChains(
    config.chains,
    config.providers
  )

  const client = createClient({
    autoConnect: true,
    // connectors,
    provider,
    webSocketProvider,
  })

  const useWallet = () => {
    const { connect } = useConnect()
    return {
      connect: () => connect({ connector: client.connector }),
    }
  }

  return {
    client: client as Client,
    hooks: {
      useWallet,
    },
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  } as WalletConnection
}
