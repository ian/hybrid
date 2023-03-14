// This is a memoized debounce using lodash debounce.
//
// Taken from https://docs.actuallycolab.org/engineering-blog/memoize-debounce/

import _ from "lodash"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export interface MemoizeDebouncedFunction<F extends AnyFunction>
  extends _.DebouncedFunc<F> {
  (...args: Parameters<F>): ReturnType<F> | undefined
  flush: (...args: Parameters<F>) => ReturnType<F> | undefined
  cancel: (...args: Parameters<F>) => void
}
/**Combines Lodash's _.debounce with _.memoize to allow for debouncing
 * based on parameters passed to the function during runtime.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options Lodash debounce options object.
 * @param resolver The function to resolve the cache key.
 */
export function debounce<F extends AnyFunction>(
  func: F,
  wait = 0,
  options: _.DebounceSettings = {},
  resolver?: (...args: Parameters<F>) => unknown
): MemoizeDebouncedFunction<F> {
  const debounceMemo = _.memoize<
    (...args: Parameters<F>) => _.DebouncedFunc<F>
  >(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (..._args: Parameters<F>) => _.debounce(func, wait, options),
    resolver
  )

  function wrappedFunction(
    this: MemoizeDebouncedFunction<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined {
    return debounceMemo(...args)(...args)
  }

  const flush: MemoizeDebouncedFunction<F>["flush"] = (...args) => {
    return debounceMemo(...args).flush()
  }

  const cancel: MemoizeDebouncedFunction<F>["cancel"] = (...args) => {
    return debounceMemo(...args).cancel()
  }

  wrappedFunction.flush = flush
  wrappedFunction.cancel = cancel

  return wrappedFunction
}
