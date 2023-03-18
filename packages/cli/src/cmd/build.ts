import ora from "ora"
import { forgeBuild } from "../lib/foundry"

export async function build() {
  const spinner = ora("Building contracts...").start()
  await forgeBuild()
  spinner.succeed("Building contracts... DONE")
}
