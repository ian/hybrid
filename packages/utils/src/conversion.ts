import { BigNumber, BigNumberish, ethers, utils } from "ethers"

export function weiToEth(wei: BigNumberish): number {
  return parseFloat(utils.formatEther(wei.toString()))
}

export function ethToWei(eth: number): BigNumber | null {
  if (typeof eth === "undefined") return null
  return ethers.utils.parseUnits(eth.toString(), "ether")
}
