import { it, expect, describe } from "vitest"
import { weiToEth, ethToWei } from "../../src"

describe("conversion", () => {
  describe("weiToEth", () => {
    it("should convert wei to eth", () => {
      expect(weiToEth(10 ** 18)).toBe(1)
    })
  })
  describe("ethToWei", () => {
    it("should convert eth to wei", () => {
      expect(ethToWei(1)?.toBigInt()).toBe(BigInt(10 ** 18))
    })
  })
})
