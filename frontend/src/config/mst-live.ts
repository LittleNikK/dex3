/**
 * LIVE MST TESTNET CONFIGURATION
 * These values are loaded from Vite environment variables at build time.
 * Use frontend/.env to override any live MST Testnet endpoint or contract address.
 */

import type { Address } from "viem";

const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? "91562037");
const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://testnetrpc.mstblockchain.com";
const WS_RPC_URL = import.meta.env.VITE_WS_RPC_URL ?? "wss://testnetrpc.mstblockchain.com";

const WMST_ADDRESS = (import.meta.env.VITE_WMST_ADDRESS ?? "0xAa0Ab95AA3d885c00711541000eA2c2E66b9472b") as Address;
const SWAP_ROUTER_ADDRESS = (import.meta.env.VITE_SWAP_ROUTER_ADDRESS ?? "0xB8dbCe17CB5931DD83aF8dD9a23A4aFbFf33E7a6") as Address;
const QUOTER_V2_ADDRESS = (import.meta.env.VITE_QUOTER_V2_ADDRESS ?? "0x2A4fec9387Fb44338fC8Cc51E1a96c51c936012b") as Address;
const QUOTER_ADDRESS = (import.meta.env.VITE_QUOTER_ADDRESS ?? "0x2A4fec9387Fb44338fC8Cc51E1a96c51c936012b") as Address;
const TESTING_EXECUTOR_ADDRESS = (import.meta.env.VITE_TESTING_EXECUTOR_ADDRESS ?? "0x2E6300717bD17215E6E232455ACCe871756d8D0E") as Address;
const LP_STATE_STORAGE_ADDRESS = (import.meta.env.VITE_LP_STATE_STORAGE_ADDRESS ?? "0xe76541a78EB636fb3154e274f4BD57daF6F2AA5A") as Address;
const USDC_ADDRESS = (import.meta.env.VITE_USDC_ADDRESS ?? "0x3468b4ac95f03534a15F633790d9BbD88b130170") as Address;
const V3_FACTORY_ADDRESS = (import.meta.env.VITE_V3_FACTORY_ADDRESS ?? "0x4BF1F8330834dCbD40A251B642e0a9A427BA5D34") as Address;
const POSITION_MANAGER_ADDRESS = (import.meta.env.VITE_POSITION_MANAGER_ADDRESS ?? "0xCbe60bB7997b9490F6C2CE77dbD3406c865496A9") as Address;
const DEMO_POOL_ADDRESS = (import.meta.env.VITE_POOL_ADDRESS ?? "0xBc3479D30b0216d435e27A4BAeF08de9719F8265") as Address;
const DEMO_LP_STATE_STORAGE_ADDRESS = (import.meta.env.VITE_DEMO_LP_STATE_STORAGE_ADDRESS ?? "0x51F3E29586489c2443718464A2f26bFfb86E4259") as Address;
const DEMO_LP_TOKEN_ID = Number(import.meta.env.VITE_DEMO_LP_TOKEN_ID ?? "1");

export const MST_LIVE_CONFIG = {
  chainId: CHAIN_ID,
  rpcUrl: RPC_URL,
  wsRpcUrl: WS_RPC_URL,

  contracts: {
    wmst: WMST_ADDRESS,
    swapRouter: SWAP_ROUTER_ADDRESS,
    quoterV2: QUOTER_V2_ADDRESS,
    testingExecutor: TESTING_EXECUTOR_ADDRESS,
    lpStateStorage: LP_STATE_STORAGE_ADDRESS,
    usdc: USDC_ADDRESS,
    v3Factory: V3_FACTORY_ADDRESS,
    positionManager: POSITION_MANAGER_ADDRESS,
    quoter: QUOTER_ADDRESS
  },

  demoPool: {
    poolAddress: DEMO_POOL_ADDRESS,
    lpTokenId: DEMO_LP_TOKEN_ID,
    lpStateStorage: DEMO_LP_STATE_STORAGE_ADDRESS
  }
};
