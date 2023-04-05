import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { useTokenGating } from "../../src/hooks/useTokenGating"
import { DeployedContract } from "@hybrd/types"
import { Web3Provider } from "../../src/providers/Web3Provider"

const Deployments: Record<
  string,
  DeployedContract
> = require("../deployments/nft.json")

const wrapper = ({ children }) => <Web3Provider>{children}</Web3Provider>

test("should use counter", async () => {
  const { result, waitForNextUpdate } = renderHook(
    () =>
      useTokenGating({
        contract: Deployments.NFT,
        address: "0x0"
      }),
    { wrapper }
  )

  await waitForNextUpdate()

  expect(result.current.allow).toBe(false)
  expect(result.current.deny).toBe(true)
})
