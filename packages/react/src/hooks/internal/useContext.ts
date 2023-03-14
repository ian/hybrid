import { useContext as useReactContext } from "react"

import { Context } from "../../providers/Web3Provider"

export function useContext() {
  return useReactContext(Context)
}
