import { ChainProviderFn } from "wagmi"

import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

export type Config = {
	alchemyKey?: string
	infuraKey?: string
	public?: boolean
}

export function buildProviders(config: Config) {
	const { alchemyKey, infuraKey, public: usePublic = true } = config
	const providers: ChainProviderFn[] = []

	// if (alchemyKey) {
	// 	providers.push(
	// 		alchemyProvider({
	// 			apiKey: alchemyKey
	// 		})
	// 	)
	// }
	// if (infuraKey) {
	// 	providers.push(
	// 		infuraProvider({
	// 			apiKey: infuraKey
	// 		})
	// 	)
	// }

	// if (usePublic) {
	// 	providers.push(publicProvider())
	// }

	providers.push(
		jsonRpcProvider({
			rpc: () => ({
				http: "http://localhost:8545",
				ws: "ws://localhost:8545"
			})
		})
	)

	return providers
}
