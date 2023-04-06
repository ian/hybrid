import React from "react"
import { configureChains, createClient, Client, useConnect } from "wagmi"
import type { WalletConnection, WalletConnectorContext } from "@hybrd/types"

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

  const useWallet = (): WalletConnectorContext => {
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
