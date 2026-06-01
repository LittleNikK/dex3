# MSTSwap - Zero Configuration Setup

## 🚀 Quick Start

**No `.env` file required. No configuration needed. Just connect MetaMask.**

### Prerequisites
- MetaMask browser extension installed
- A browser (Chrome, Firefox, Edge, Brave, etc.)

### Steps

1. **Clone or Download the Project**
   ```bash
   git clone <repository-url>
   cd mstswap-v3
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the Dev Server**
   ```bash
   npm run dev
   ```
   The app will start at `http://localhost:3001/` (or another port if 3001 is busy)

4. **Open in Browser**
   - Navigate to the printed URL (e.g., `http://localhost:3001/`)
   - The app loads automatically with:
     - Live MST Testnet RPC endpoint
     - All deployed contract addresses
     - Demo pool configuration

5. **Connect MetaMask**
   - Click the **"Connect Wallet"** button
   - Approve the MetaMask popup
   - Select your wallet account
   - Your wallet address is automatically detected and used

6. **Switch to MST Testnet** (if not already connected)
   - MetaMask will prompt you to switch networks
   - Approve the network addition
   - Confirm the switch

7. **Start Using the App**
   - Swap tokens on the demo pool
   - Transfer tokens to other addresses
   - Provide/manage liquidity
   - All transactions require MST Testnet to be active

## 📋 What's Automated

✅ **Contract Addresses** - Hardcoded to live MST testnet deployments
✅ **RPC Endpoint** - Uses official MST testnet RPC (https://testnetrpc.mstblockchain.com)
✅ **Network Configuration** - MST Testnet (Chain ID: 91562037) pre-configured
✅ **Wallet Detection** - Auto-detects connected MetaMask account
✅ **Token Balances** - Fetched live from on-chain
✅ **Pool Data** - Queried from smart contracts in real-time

## 🔧 Live Deployed Contracts (MST Testnet)

| Contract | Address |
|----------|---------|
| WMST | `0xAa0Ab95AA3d885c00711541000eA2c2E66b9472b` |
| Swap Router | `0xB8dbCe17CB5931DD83aF8dD9a23A4aFbFf33E7a6` |
| Quoter V2 | `0x2A4fec9387Fb44338fC8Cc51E1a96c51c936012b` |
| Testing Executor | `0x2E6300717bD17215E6E232455ACCe871756d8D0E` |
| LP State Storage | `0xe76541a78EB636fb3154e274f4BD57daF6F2AA5A` |
| USDC | `0x3468b4ac95f03534a15F633790d9BbD88b130170` |
| Demo Pool | `0xBc3479D30b0216d435e27A4BAeF08de9719F8265` |

## 📱 Feature Checklist

### Swap Page
- ✅ Select token pairs (MST ↔ WMST, MST ↔ USDC, WMST ↔ USDC)
- ✅ Automatic liquidity quotes
- ✅ Slippage protection
- ✅ Network gating (enforces MST Testnet before transaction)
- ✅ Real-time gas estimation

### Transfer Page
- ✅ Send any token to any address
- ✅ Real-time balance display
- ✅ Gas fee calculation
- ✅ Network enforcement

### Liquidity Page
- ✅ Create/initialize pools
- ✅ Add concentrated liquidity
- ✅ Remove liquidity
- ✅ Collect LP fees
- ✅ View pool state

### Wallet Page
- ✅ Display connected wallet address
- ✅ Show token balances (MST, WMST, USDC)
- ✅ Network status indicator
- ✅ Network switch button

## 🧪 Testing a Swap

1. Connect your MetaMask wallet
2. Navigate to **Swap** page
3. Select **MST** → **USDC** (or any pair)
4. Enter an amount (e.g., 0.01 MST)
5. Click **"Confirm Swap"**
6. Approve in MetaMask
7. Transaction appears on-chain (viewable on https://testnet.mstscan.com)

## 🔐 Security Notes

- **Private Keys**: Never stored locally. MetaMask handles all signing.
- **No Backend Dependencies**: Frontend communicates directly with smart contracts.
- **Open Source**: All code is transparent and auditable.
- **Live Network**: All transactions on actual MST Testnet (not local simulation).

## 🛠️ For Developers: Backend Setup (Optional)

If you want to run the full stack with backend and subgraph:

```bash
# Backend (Node.js + Express + Prisma)
cd backend
npm install
npm run dev  # Runs on http://localhost:8000

# Subgraph (The Graph)
cd subgraph
npm install
npm run build
npm run deploy

# Database + Infrastructure
cd ..
docker compose up -d postgres graph-postgres redis ipfs graph-node
```

**Note:** The frontend works independently without the backend. Backend is optional for advanced features like historical data or indexing.

## ❓ Troubleshooting

### "MetaMask not detected"
- Install MetaMask extension
- Refresh the page
- Ensure MetaMask is not locked

### "Wrong Network"
- MetaMask will show a prompt to switch to MST Testnet
- Click "Switch" and confirm

### "Insufficient Balance"
- You need MST tokens on MST Testnet
- Request faucet tokens from: https://testnet.mstscan.com/faucet
- Wait for tokens to arrive (~1-2 minutes)

### "Transaction Failed"
- Check gas price (network may have minimum gas requirements)
- Ensure sufficient token balance
- Check liquidity pools are initialized

## 📚 Useful Links

- **MST Testnet RPC**: https://testnetrpc.mstblockchain.com
- **Block Explorer**: https://testnet.mstscan.com
- **Faucet**: https://testnet.mstscan.com/faucet
- **GitHub**: <repository-url>

## 📝 Summary

This app is designed to work **out of the box**:
1. No configuration files needed
2. No private key management (MetaMask handles it)
3. No build steps (besides `npm install`)
4. Share this folder with anyone—they just connect MetaMask and it works
5. All data is fetched live from MST Testnet smart contracts

**Happy Swapping! 🚀**
