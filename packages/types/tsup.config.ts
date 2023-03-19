import type { Options } from "tsup"

const config: Options = {
  entry: ["src/types.ts"],
  dts: true,
  sourcemap: true,
  format: ["esm", "cjs"]
}

export default config
