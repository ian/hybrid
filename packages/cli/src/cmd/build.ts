import ora from "ora"
import { writeConfig } from "../lib/config"
import { forgeBuild } from "../lib/foundry"

export async function build() {
  const spinner = ora("Building contracts...").start()
  await forgeBuild().then(writeConfig)
  spinner.succeed("Building contracts... DONE")
}
