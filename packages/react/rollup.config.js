import autoprefixer from "autoprefixer"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import typescript from "@rollup/plugin-typescript"
import postcss from "rollup-plugin-postcss"
import analyze from "rollup-plugin-analyzer"
import { visualizer } from "rollup-plugin-visualizer"
import { terser } from "rollup-plugin-terser"

import pkg from "./package.json" assert { type: "json" }

export default [
  {
    input: ["./src/index.ts"],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    output: {
      file: pkg.exports["."]
      // format: "esm",
      // format: "cjs",
      // sourcemap: true
      // sourcemap: "inline"
    },
    plugins: [
      peerDepsExternal(),
      postcss({
        extract: "style.css",
        plugins: [autoprefixer()],
        sourceMap: true,
        minimize: true
      }),
      typescript({
        declaration: true,
        declarationDir: ".",
        tsconfig: "./tsconfig.json"
      }),
      terser(),
      analyze({
        limit: 10,
        summaryOnly: true
      }),
      visualizer({
        filename: "./dist/stats.html",
        template: "treemap",
        sourcemap: true
      })
    ]
  }
]
