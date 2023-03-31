import {
  getDefaultWallets,
  RainbowKitProvider,
  Theme
} from "@rainbow-me/rainbowkit"
import { configureChains, createClient } from "wagmi"

import type { WalletConnection } from "@hybrd/types"

type Props = {
  appName?: string
  theme?: Theme
}

export function RainbowKit(props: Props) {
  const { appName, theme } = props
  return (config: any) => {
    const { provider, webSocketProvider, chains } = configureChains(
      config.chains,
      config.providers
    )

    const { connectors } = getDefaultWallets({
      appName: appName || "Hybrid App",
      chains
    })

    const client = createClient({
      autoConnect: true,
      connectors,
      provider,
      webSocketProvider
    })

    return {
      client,
      Provider: ({ children }: { children: React.ReactNode }) => (
        <RainbowKitProvider theme={theme} chains={chains}>
          {children}
        </RainbowKitProvider>
      )
    } as WalletConnection
  }
}

export { ConnectButton } from "@rainbow-me/rainbowkit"
