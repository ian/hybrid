/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { it, expect, describe } from "vitest"
import { etherscanAddressURL, etherscanHost, etherscanTxURL } from "../../src"

describe("lib", () => {
  describe("etherscan", () => {
    it("etherscanHost should return proper hosts", () => {
      const hosts: string[] = []
      for (const chainId of [1, 3, 4, 5, 137, 80001] as const) {
        hosts.push(etherscanHost(chainId))
      }
      expect(hosts).toEqual([
        `https://etherscan.io`,
        `https://ropsten.etherscan.io`,
        `https://rinkeby.etherscan.io`,
        `https://goerli.etherscan.io`,
        `https://polygonscan.com`,
        `https://mumbai.polygonscan.com`
      ])
    })
    it("etherscanAddressURL generates an address URL", () => {
      expect(etherscanAddressURL("vitalik.eth", 1)).toBe(
        "https://etherscan.io/address/vitalik.eth"
      )
    })
    it("etherscanTxURL generates a tx URL", () => {
      expect(
        etherscanTxURL(
          "0xdbd59729237fb4fb1fa132e94f010197a84a560529a2db2293fb78c7f1ef1e0f",
          1
        )
      ).toBe(
        "https://etherscan.io/tx/0xdbd59729237fb4fb1fa132e94f010197a84a560529a2db2293fb78c7f1ef1e0f"
      )
    })
  })
})
