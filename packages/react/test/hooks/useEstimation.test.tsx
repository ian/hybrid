import { it, describe } from "vitest"
import { waitFor } from "@testing-library/react"
import { useEstimation } from "../../src"

import "@testing-library/jest-dom"
import { wrapHook } from "../wrapper"
import { ethers } from "ethers"

describe("hooks", () => {
  describe("useEstimation", () => {
    it("estimates transaction costs", async () => {
      const result = await wrapHook<ReturnType<typeof useEstimation>>(() =>
        useEstimation(ethers.utils.formatBytes32String("Hello World"))
      )

      await waitFor(() => expect(result.current.gas).toBeTruthy())

      expect(result.current.gas).toBeGreaterThan(0.0)
      expect(result.current.gasPrice).toBeGreaterThan(0.0)
      expect(result.current.wei).toBeGreaterThan(0.0)
      expect(result.current.eth).toBeGreaterThan(0.0)
    })

    it("supports empty strings (no data)", async () => {
      const result = await wrapHook<ReturnType<typeof useEstimation>>(() =>
        useEstimation(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
      )

      await waitFor(() => expect(result.current.gas).toBeTruthy())

      expect(result.current.gas).toBeGreaterThan(0.0)
      expect(result.current.gasPrice).toBeGreaterThan(0.0)
      expect(result.current.wei).toBeGreaterThan(0.0)
      expect(result.current.eth).toBeGreaterThan(0.0)
    })
  })
})
