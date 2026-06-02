export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  priceUsd: number;
  address?: string;
  chainId: number;
}

export const TOKENS: Token[] = [
  {
    symbol: "MST",
    name: "tMST Native Token",
    decimals: 18,
    priceUsd: 0.5,
    chainId: 91562037, // MST Testnet
  },
  {
    symbol: "WMST",
    name: "Wrapped MST",
    decimals: 18,
    priceUsd: 0.5,
    address: "0xAa0Ab95AA3d885c00711541000eA2c2E66b9472b",
    chainId: 91562037,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    priceUsd: 1.0,
    address: "0x3468b4ac95f03534a15F633790d9BbD88b130170",
    chainId: 91562037,
  },
  {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    priceUsd: 3400.0,
    address: "0x2170ed8265b2828478396136587c470a1a14c241", // mock Ethereum addresses
    chainId: 1,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    priceUsd: 65000.0,
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    chainId: 1,
  },
  {
    symbol: "UNI",
    name: "Uniswap Token",
    decimals: 18,
    priceUsd: 8.4,
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    chainId: 10, // Optimism
  }
];

export function tokensForChain(chainId: number): Token[] {
  return TOKENS.filter((token) => token.chainId === chainId && token.address);
}
