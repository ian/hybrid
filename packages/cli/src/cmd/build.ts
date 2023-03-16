import { writeConfig } from "../lib/builder"
import { forgeBuild } from "../lib/foundry"
import { spinner } from "../lib/util"

export async function build() {
  return spinner("Building contracts...", () =>
    forgeBuild().then(() => writeConfig())
  )
}
