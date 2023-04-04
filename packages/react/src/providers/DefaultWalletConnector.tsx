import React from "react"
import { configureChains, createClient, Client } from "wagmi"
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
    webSocketProvider
  })

  const useContext = (): WalletConnectorContext => {
    return {
      connect: () => {
        console.log("connect")
      }
    }
  }

  return {
    client: client as Client,
    useContext,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  } as WalletConnection
}
