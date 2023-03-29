import React from "react"
import { configureChains, createClient, Client } from "wagmi"
import type { WalletConnection } from "@hybrd/types"
import { buildProviders } from "providers/helpers"

export default function DefaultWalletConnector(config) {
  return ({ chains }) => {
    const { provider, webSocketProvider } = configureChains(
      chains,
      buildProviders(config)
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
}
