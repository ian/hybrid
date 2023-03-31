import React from "react"
import { ConnectKitProvider, getDefaultClient } from "connectkit"
import { createClient, configureChains } from "wagmi"
import type { WalletConnection } from "@hybrd/types"

export function ConnectKit(
  props: // CK doesn't export DefaultClientProps
  Parameters<typeof getDefaultClient>[0] &
    // CK doesn't export ConnectKitProviderProps
    Parameters<typeof ConnectKitProvider>[0]
) {
  return (config) => {
    const { provider, webSocketProvider, chains } = configureChains(
      config.chains,
      config.providers
    )

    const client = createClient(
      getDefaultClient({
        ...props,
        walletConnectOptions: {
          projectId: "f6ad337056eac36bb5be7cb749b890b5",
          version: "2"
        },
        chains,
        provider,
        webSocketProvider
      })
    )

    return {
      client,
      Provider: ({ children }: { children: React.ReactNode }) => (
        <ConnectKitProvider {...props}>{children}</ConnectKitProvider>
      )
    } as WalletConnection
  }
}
