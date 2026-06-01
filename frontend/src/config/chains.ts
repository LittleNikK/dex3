import { MST_LIVE_CONFIG } from "./mst-live";

export const mstChain = {
  id: MST_LIVE_CONFIG.chainId,
  name: "MST Testnet",
  nativeCurrency: {
    name: "tMST",
    symbol: "tMST",
    decimals: 18
  },
  rpcUrls: {
    default: { http: [MST_LIVE_CONFIG.rpcUrl] }
  },
  blockExplorers: {
    default: { name: "MSTScan", url: "https://testnet.mstscan.com" }
  }
} as const;
