/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="vitest" />

import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
// import { resolve } from "path"
// import { dependencies, peerDependencies } from "./package.json"
import * as dotenv from "@tinyhttp/dotenv"

dotenv.config()

export default defineConfig({
  plugins: [react()],
  test: {
    deps: { fallbackCJS: true },
    globals: true,
    environment: "jsdom",
    env: {
      VANITY_PK: process.env.VANITY_PK,
      VANITY_ADDRESS: process.env.VANITY_ADDRESS
    }
  }
  // build: {
  //   sourcemap: true,
  //   lib: {
  //     name: "sdk",
  //     entry: resolve(__dirname, "src/index.ts"),
  //     fileName: (format) => `index.${format === "cjs" ? "cjs" : "js"}`,
  //     formats: ["es", "cjs"]
  //   },
  //   rollupOptions: {
  //     external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)]
  //   }
  // }
})
