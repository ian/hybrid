import * as Chains from "wagmi/chains"

export const CHAINS = {
  ethereum: [Chains.mainnet, Chains.goerli],
  polygon: [Chains.polygon, Chains.polygonMumbai],
  arbitrum: [Chains.arbitrum, Chains.arbitrumGoerli],
  optimism: [Chains.optimism, Chains.optimismGoerli],
  base: [undefined, Chains.baseGoerli],
}

export const CHAIN_NAMES = Object.keys(CHAINS) //.map(([_, v]) => v)

export const chainForStage = (
  chainName: keyof typeof CHAINS,
  stage: "test" | "prod"
) => {
  const chains = CHAINS[chainName]
  if (!chains) throw new Error("Unknown chain: " + chainName)
  const [test, prod] = chains

  switch (stage) {
    case "test":
      return test

    case "prod":
      return prod

    default:
      throw new Error(
        "Unknown deploy stage: " + stage + " (expected test|prod)"
      )
  }
}

export function getChainById(chainId: number | string) {
  const id = parseInt(chainId.toString())
  return Object.values(Chains).find((chain) => chain?.id === id)
}
