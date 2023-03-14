import { Chain, createClient, WagmiConfig } from "wagmi"

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"

export const Provider = ({
  children,
  chains,
  provider,
  webSocketProvider
}: {
  children: React.ReactNode
  chains: Chain[]
  provider: any // @todo - what is the typing on this?
  webSocketProvider: any // @todo - what is the typing on this?
}) => {
  const { connectors } = getDefaultWallets({
    appName: "My App",
    chains
  })

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider
  })

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  )
}
