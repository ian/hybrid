import React from "react"
import { ConnectKitProvider, getDefaultClient } from "connectkit"
import { createClient as createWagmi, configureChains } from "wagmi"
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

    const client = createWagmi(
      getDefaultClient({ ...props, chains, provider, webSocketProvider })
    )

    return {
      client,
      Provider: ({ children }: { children: React.ReactNode }) => (
        <ConnectKitProvider {...props}>{children}</ConnectKitProvider>
      )
    } as WalletConnection
  }
}
