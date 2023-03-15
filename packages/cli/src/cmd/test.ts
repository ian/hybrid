import { exec } from "../lib/run"

export async function test() {
  return exec("forge test")
}
