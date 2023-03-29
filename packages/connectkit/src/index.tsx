import React from "react"
import { ConnectKitProvider, getDefaultClient } from "connectkit"
import { createClient as createWagmi } from "wagmi"
import type { WalletConnection } from "@hybrd/types"

export function ConnectKit(
  props: // CK doesn't export DefaultClientProps
  Parameters<typeof getDefaultClient>[0] &
    // CK doesn't export ConnectKitProviderProps
    Parameters<typeof ConnectKitProvider>[0]
) {
  const client = createWagmi(getDefaultClient(props))
  return {
    client,
    // Provider
    Provider: ({ children }: { children: React.ReactNode }) => (
      <ConnectKitProvider {...props}>{children}</ConnectKitProvider>
    )
  } as WalletConnection
}
