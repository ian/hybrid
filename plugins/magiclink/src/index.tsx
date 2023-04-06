import { EthNetworkConfiguration, Magic } from "magic-sdk"
import { configureChains, createClient } from "wagmi"

import type { WalletConnection, WalletConnectorContext } from "@hybrd/types"

type Props = {
  apiKey: string
}

// const formattedNetwork = (): EthNetworkConfiguration => {
//   const network = localStorage.getItem("network")
//   switch (network) {
//     case Networks.Optimism:
//       return {
//         rpcUrl: process.env.REACT_APP_OPTIMISM_RPC_URL as string,
//         chainId: 420,
//       }
//     case Networks.Polygon:
//       return {
//         rpcUrl: process.env.REACT_APP_POLYGON_RPC_URL as string,
//         chainId: 80001,
//       }
//     default:
//       return {
//         rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL as string,
//         chainId: 5,
//       }
//   }
// }

let magic: Magic

export function MagicLink(props: Props) {
  const { apiKey } = props

  return (config: any) => {
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

    const useContext = (): WalletConnectorContext => {
      return {
        connect: () => {
          return magic.wallet.connectWithUI()
        },
      }
    }

    return {
      client,
      useContext,
      Provider: ({ children }: { children: React.ReactNode }) => {
        magic = new Magic(apiKey, {
          network: {
            rpcUrl: process.env.REACT_APP_POLYGON_RPC_URL as string,
            chainId: 80001,
          },
        })
        return <>{children}</>
      },
    } as WalletConnection
  }
}

export { ConnectButton } from "@rainbow-me/rainbowkit"
