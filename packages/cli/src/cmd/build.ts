import { writeConfig } from "../lib/builder"
import * as foundry from "../lib/foundry"
import { spinner } from "../lib/helpers"

export async function build() {
  return spinner("Building contracts...", () =>
    foundry.build().then(() => writeConfig())
  )
}
