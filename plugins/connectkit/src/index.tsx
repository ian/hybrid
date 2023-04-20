import React from "react"
import { ConnectKitProvider, getDefaultClient, useModal } from "connectkit"
import { createClient, configureChains, useDisconnect, useAccount } from "wagmi"
import type { UseWallet, WalletConnection } from "@hybrd/types"

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

    const useWallet = (): UseWallet => {
      const { address: account, isConnected } = useAccount()
      const { setOpen } = useModal()
      const { disconnect } = useDisconnect()

      return {
        account,
        isConnected,
        isLoading: false,
        connect: async () => {
          setOpen(true)
        },
        disconnect,
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
