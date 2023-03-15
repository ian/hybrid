import { DependencyList, useEffect, useState } from "react"

type Factory<T> = () => Promise<T | undefined | null>

export function useAsyncMemo<T>(
  factory: Factory<T>,
  deps: DependencyList
): T | undefined
export function useAsyncMemo<T>(
  factory: Factory<T>,
  deps: DependencyList,
  initial: T
): T
export function useAsyncMemo<T>(
  factory: Factory<T>,
  deps: DependencyList,
  initial?: T
) {
  const [val, setVal] = useState<T | undefined>(initial)

  useEffect(() => {
    let cancel = false
    const promise = factory()
    if (promise === undefined || promise === null) return

    promise
      .then((val) => {
        if (!cancel) {
          setVal(val)
        }
      })
      .catch((error) => {
        console.error(`Error in useAsyncMemo: ${error}`)
      })

    return () => {
      cancel = true
    }
  }, deps)

  return val
}
