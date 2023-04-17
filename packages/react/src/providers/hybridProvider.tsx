import { providers } from "ethers"

import type { Chain, ChainProviderFn } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

export type HybridProviderConfig = {
  apiKey: string
}

export function hybridProvider<TChain extends Chain = Chain>({
  apiKey,
}: HybridProviderConfig): ChainProviderFn<
  TChain,
  providers.JsonRpcProvider,
  providers.WebSocketProvider
> {
  return jsonRpcProvider({
    rpc: (chain) => {
      const chainName = chain?.network || "mainnet"
      const http =
        process.env.NEXT_PUBLIC_HYBRID_RPC_HTTP ||
        process.env.HYBRID_RPC_HTTP ||
        `https://rpc.hybrid.dev/${chainName}/${apiKey || ""}`
      const webSocket =
        process.env.NEXT_PUBLIC_HYBRID_RPC_WS ||
        process.env.HYBRID_RPC_WS ||
        `wss://rpc.hybrid.dev/${chainName}/${apiKey || ""}`

      return {
        http,
        webSocket,
      }
    },
  })
}
