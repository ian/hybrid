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

  const wallet = (): WalletConnectorContext => {
    return {
      connect: () => connect({ connector: client.connector }),
    }
  }

  return {
    client: client as Client,
    wallet,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  } as WalletConnection
}
