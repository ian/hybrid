export function etherscanAddressURL(address: string, chainId = 1) {
  return etherscanHost(chainId) + "/address/" + address
}

export function etherscanTxURL(hash: string, chainId = 1) {
  return etherscanHost(chainId) + "/tx/" + hash
}

export function etherscanHost(chainId = 1) {
  switch (chainId) {
    case 1:
    case 1337: // for localhost lets just go to mainnet
      return `https://etherscan.io`
    case 5:
      return `https://goerli.etherscan.io`
    case 137:
      return `https://polygonscan.com`
    case 80001:
      return `https://mumbai.polygonscan.com`
    default:
      throw new Error("Etherscan: Unknown chain id " + chainId)
  }
}
