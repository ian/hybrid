import { EthNetworkConfiguration, Magic } from "magic-sdk"
import {
  MagicAuthConnector,
  MagicConnectConnector,
} from "@everipedia/wagmi-magic-connector"

import { configureChains, createClient, useConnect, useProvider } from "wagmi"

import type { WalletConnection, WalletConnectorContext } from "@hybrd/types"

type Props = {
  apiKey: string
}

export const magicConnector = ({ chains }: any) => ({
  id: "magic",
  name: "Magic",
  iconUrl: "https://svgshare.com/i/iJK.svg",
  iconBackground: "#fff",
  createConnector: () => {
    const connector = new MagicConnectConnector({
      chains: chains,
      options: {
        apiKey: "YOUR_MAGIC_CONNECT_API_KEY",
        magicSdkConfiguration: {
          network: {
            rpcUrl: "https://polygon-rpc.com", // your ethereum, polygon, or optimism mainnet/testnet rpc URL
            chainId: 137,
          },
        },
        //...Other options (check out full API below)
      },
    })
    return {
      connector,
    }
  },
})

export const MagicLink = (props: Props) => {
  const { apiKey } = props

  return (config: any) => {
    const { provider, webSocketProvider } = configureChains(
      config.chains,
      config.providers
    )

    const connector = new MagicConnectConnector({
      options: {
        apiKey,
        //...Other options
      },
    })

    const client = createClient({
      // autoConnect: true,
      // connectors,
      connectors: [connector],
      provider,
      webSocketProvider,
    })

    // const wallet = ({
    // 	chainId
    // }: {
    // 	chainId: number
    // }): WalletConnectorContext => {
    // 	// const provider = useProvider()
    // 	// console.log({ provider })
    // 	// const p = provider({ chainId })
    // 	// console.log({ p, chainId })
    // 	// debugger

    // 	// const magic = new Magic(apiKey, {
    // 	// 	network: {
    // 	// 		rpcUrl: p.providerConfigs[0].provider.connection.url as string,
    // 	// 		chainId: p.network.chainId
    // 	// 	}
    // 	// })

    // 	// console.log("magic", magic)

    // 	return {
    // 		connect: () => {
    // 			console.log("connect")
    // 			// return magic.wallet.connectWithUI()
    // 		}
    // 	}
    // }

    const useWallet = () => {
      const { connect, connectors } = useConnect()
      return {
        connect: () => {
          console.log("CONNECT")
          connect({ connector })
        },
        // connect: () => magic.wallet.connectWithUI()
      }
    }

    // @ts-ignore
    return {
      client,
      hooks: {
        useWallet,
      },
      Provider: ({ children }: { children: React.ReactNode }) => {
        return children
      },
    } as WalletConnection
  }
}

export { ConnectButton } from "@rainbow-me/rainbowkit"
