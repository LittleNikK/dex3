/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_WS_RPC_URL?: string;
  readonly VITE_WMST_ADDRESS?: string;
  readonly VITE_SWAP_ROUTER_ADDRESS?: string;
  readonly VITE_QUOTER_V2_ADDRESS?: string;
  readonly VITE_QUOTER_ADDRESS?: string;
  readonly VITE_TESTING_EXECUTOR_ADDRESS?: string;
  readonly VITE_LP_STATE_STORAGE_ADDRESS?: string;
  readonly VITE_USDC_ADDRESS?: string;
  readonly VITE_V3_FACTORY_ADDRESS?: string;
  readonly VITE_POSITION_MANAGER_ADDRESS?: string;
  readonly VITE_POOL_ADDRESS?: string;
  readonly VITE_DEMO_LP_STATE_STORAGE_ADDRESS?: string;
  readonly VITE_DEMO_LP_TOKEN_ID?: string;
  readonly VITE_USDC_DECIMALS?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_FORM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
