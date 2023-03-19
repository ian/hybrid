import { useContext as useReactContext } from "react"

import { Web3Context } from "../../providers/Web3Provider"

export function useContext() {
  return useReactContext(Web3Context)
}
