import React from "react"
import { ConnectKitProvider, getDefaultClient, useModal } from "connectkit"
import { createClient, configureChains } from "wagmi"
import type { WalletConnection } from "@hybrd/types"

export * from "connectkit"

export const ConnectKit = (
  props: // CK doesn't export DefaultClientProps
  Parameters<typeof getDefaultClient>[0] &
    // CK doesn't export ConnectKitProviderProps
    Parameters<typeof ConnectKitProvider>[0]
) => {
  return (config) => {
    const { provider, webSocketProvider, chains } = configureChains(
      config.chains,
      config.providers
    )

    const client = createClient(
      getDefaultClient({
        chains,
        provider,
        webSocketProvider,
        ...props,
      })
    )

    const useWallet = () => {
      const { setOpen } = useModal()

      return {
        connect: () => setOpen(true),
      }
    }

    return {
      client,
      hooks: {
        useWallet,
      },
      Provider: ({ children }: { children: React.ReactNode }) => (
        <ConnectKitProvider {...props}>{children}</ConnectKitProvider>
      ),
    } as WalletConnection
  }
}
