export function chainName(chainId: number | string) {
  switch (parseInt(chainId.toString())) {
    case 1:
      return `Ethereum`
    case 3:
      return `Ropsten`
    case 4:
      return `Rinkeby`
    case 5:
      return `Goerli`
    case 137:
      return `Polygon`
    case 80001:
      return `Mumbai`
  }
}
