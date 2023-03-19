import type { Options } from "tsup"

const config: Options = {
  entry: ["src/cli.ts"],
  dts: true,
  sourcemap: true,
  format: ["esm", "cjs"]
}

export default config
