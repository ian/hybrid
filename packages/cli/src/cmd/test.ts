import { execSync } from "child_process"

export async function test() {
  return execSync("forge test", { stdio: "inherit" })
}
