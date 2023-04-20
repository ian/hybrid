import React from "react"
import {
  configureChains,
  createClient,
  Client,
  useConnect,
  useDisconnect,
  useAccount,
} from "wagmi"
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
    const { address, isConnected } = useAccount()
    const { isLoading, connectAsync } = useConnect()
    const { disconnectAsync } = useDisconnect()

    return {
      account: address,
      isLoading,
      isConnected,
      connect: () => {
        connectAsync({ connector: client.connector })
      },
      disconnect: () => {
        disconnectAsync()
      },
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
