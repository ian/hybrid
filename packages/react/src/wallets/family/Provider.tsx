import { Chain, createClient, WagmiConfig } from "wagmi"
import { ConnectKitProvider, getDefaultClient } from "connectkit"

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
  // const chains = [
  // 	mainnet
  // 	// polygon, optimism, arbitrum
  // ]
  // const { chains, provider, webSocketProvider } = configureChains(
  //   [mainnet, polygon, optimism, arbitrum],
  //   providers
  // )

  const client = createClient({
    ...getDefaultClient({
      appName: "My App",
      chains
    }),
    provider,
    webSocketProvider
  })

  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  )
}
