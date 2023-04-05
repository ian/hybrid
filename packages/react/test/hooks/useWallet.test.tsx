import React from "react"
import { expectTypeOf } from "vitest"

import { renderHook } from "@testing-library/react-hooks"
import { useWallet } from "../../src/hooks"
import { Web3Provider } from "../../src/providers/Web3Provider"

const wrapper = ({ children }) => <Web3Provider>{children}</Web3Provider>

test("should use counter", async () => {
  const { result } = renderHook(useWallet, {
    wrapper,
  })

  expectTypeOf(result.current.connect).toBeFunction()
})
