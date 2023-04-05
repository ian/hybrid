import React from "react";
import { configureChains, createClient, Client, useConnect } from "wagmi";
import type { WalletConnection, WalletConnectorContext } from "@hybrd/types";

export default function DefaultWalletConnector(config) {
  const { provider, webSocketProvider } = configureChains(
    config.chains,
    config.providers
  );

  const client = createClient({
    autoConnect: true,
    // connectors,
    provider,
    webSocketProvider,
  });

  const useContext = (): WalletConnectorContext => {
    const { connect, connectors } = useConnect();
    return {
      connect: () => connect({ connector: connectors[0] }),
    };
  };

  return {
    client: client as Client,
    useContext,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  } as WalletConnection;
}
