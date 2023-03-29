import React from "react"
import { configureChains, createClient, Client } from "wagmi"
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
    webSocketProvider
  })

  return {
    client: client as Client,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  } as WalletConnection
}
