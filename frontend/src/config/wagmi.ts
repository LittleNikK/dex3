import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mstChain } from "./chains";
import { MST_LIVE_CONFIG } from "./mst-live";

export const wagmiConfig = createConfig({
  chains: [mstChain],
  connectors: [
    injected({
      target: "metaMask"
    })
  ],
  transports: {
    [mstChain.id]: http(MST_LIVE_CONFIG.rpcUrl)
  }
});
