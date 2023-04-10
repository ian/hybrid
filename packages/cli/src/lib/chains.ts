import {
  mainnet,
  goerli,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
  optimism,
  optimismGoerli,
  baseGoerli,
} from "wagmi/chains"

export const CHAINS = {
  ethereum: [mainnet, goerli],
  polygon: [polygon, polygonMumbai],
  arbitrum: [arbitrum, arbitrumGoerli],
  optimism: [optimism, optimismGoerli],
  base: [undefined, baseGoerli],
}

export const CHAIN_NAMES = Object.keys(CHAINS) //.map(([_, v]) => v)

// export * from "wagmi/chains";

// export function chainName(chainId: number | string) {
//   switch (parseInt(chainId.toString())) {
//     case 1:
//       return `Ethereum`;
//     case 3:
//       return `Ropsten`;
//     case 4:
//       return `Rinkeby`;
//     case 5:
//       return `Goerli`;
//     case 137:
//       return `Polygon`;
//     case 80001:
//       return `Mumbai`;
//   }
// }
