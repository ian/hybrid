import { it, expect, describe } from "vitest"
import { percentToBips, bipsToPercent } from "../../src"

describe("basisPoints", () => {
  describe("percentToBips", () => {
    it("converts percent to bips", () => {
      expect(percentToBips(0.25)).toBe(25)
    })
  })

  describe("bipsToPercent", () => {
    it('returns "null" string', () => {
      expect(bipsToPercent("string")).toBe(null)
    })
    it("converts bips to percent", () => {
      expect(bipsToPercent(10000)).toBe(100)
    })
  })
})
