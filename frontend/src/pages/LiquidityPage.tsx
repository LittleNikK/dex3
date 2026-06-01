import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Info, Plus, ShieldCheck, Coins, HelpCircle, ArrowRight, ExternalLink } from "lucide-react";
import { formatUnits, parseUnits, type Address } from "viem";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract, useBalance } from "wagmi";
import { getToken, CONTRACTS, erc20Abi, testingExecutorAbi, lpStateStorageAbi } from "../config/contracts";
import { mstChain } from "../config/chains";
import { TokenLogo } from "../components/swap/TokenLogos";
import { useThemeStore } from "../store/themeStore";

export default function LiquidityPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // 1. Fetch live balances (native tMST vs ERC20 tokens)
  const { data: nativeBalanceData } = useBalance({ address });
  const [wmstBalance, setWmstBalance] = useState("0.00");
  const [usdcBalance, setUsdcBalance] = useState("0.00");

  // LP State Stored Values
  const [activeTokenId, setActiveTokenId] = useState<bigint | null>(null);
  const [lpLiquidity, setLpLiquidity] = useState<bigint | null>(null);
  const [lpAmount0, setLpAmount0] = useState<bigint | null>(null);
  const [lpAmount1, setLpAmount1] = useState<bigint | null>(null);
  const [poolAddress, setPoolAddress] = useState<string>("");

  // Input states for Creating / Initializing Pool
  const [initFee, setInitFee] = useState<number>(3000); // 0.3%
  const [initWmst, setInitWmst] = useState("");
  const [initUsdc, setInitUsdc] = useState("");
  const [initTickLower, setInitTickLower] = useState("-887220"); // Full Range Lower
  const [initTickUpper, setInitTickUpper] = useState("887220"); // Full Range Upper

  // Input states for Adding Liquidity
  const [addWmst, setAddWmst] = useState("");
  const [addUsdc, setAddUsdc] = useState("");

  // Input states for Removing Liquidity
  const [removePercent, setRemovePercent] = useState<number>(50); // 50% default

  // Transaction Working States
  const [isWorking, setIsWorking] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [txHash, setTxHash] = useState("");

  const isDark = theme === "dark";

  const wmstToken = useMemo(() => getToken("WMST") || { symbol: "WMST", decimals: 18, address: CONTRACTS.wmst }, []);
  const usdcToken = useMemo(() => getToken("USDC") || { symbol: "USDC", decimals: 6, address: "0x3468b4ac95f03534a15F633790d9BbD88b130170" as Address }, []);



  // Helper: Fetch user ERC20 token balances
  const fetchERC20Balances = async () => {
    if (!isConnected || !address || !publicClient) return;
    try {
      if (wmstToken.address) {
        const bal = await publicClient.readContract({
          address: wmstToken.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address]
        });
        setWmstBalance(Number(formatUnits(bal, wmstToken.decimals)).toFixed(4));
      }
      if (usdcToken.address) {
        const bal = await publicClient.readContract({
          address: usdcToken.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address]
        });
        setUsdcBalance(Number(formatUnits(bal, usdcToken.decimals)).toFixed(4));
      }
    } catch (e) {
      console.error("Error fetching ERC20 balances", e);
    }
  };

  // Helper: Fetch on-chain LP position details from TestingExecutor and LPStateStorage
  const fetchLPState = async () => {
    if (!publicClient) return;
    try {
      // 1. Fetch active token ID from executor
      const tokenId = await publicClient.readContract({
        address: CONTRACTS.testingExecutor,
        abi: testingExecutorAbi,
        functionName: "activeTokenId"
      });
      setActiveTokenId(tokenId);

      if (tokenId > 0n) {
        // 2. Fetch detailed state from lpStateStorage
        const lpLiq = await publicClient.readContract({
          address: CONTRACTS.lpStateStorage,
          abi: lpStateStorageAbi,
          functionName: "lpLiquidity"
        });
        setLpLiquidity(lpLiq);

        const lpAmt0 = await publicClient.readContract({
          address: CONTRACTS.lpStateStorage,
          abi: lpStateStorageAbi,
          functionName: "lpAmount0"
        });
        setLpAmount0(lpAmt0);

        const lpAmt1 = await publicClient.readContract({
          address: CONTRACTS.lpStateStorage,
          abi: lpStateStorageAbi,
          functionName: "lpAmount1"
        });
        setLpAmount1(lpAmt1);

        const pool = await publicClient.readContract({
          address: CONTRACTS.lpStateStorage,
          abi: lpStateStorageAbi,
          functionName: "poolAddress"
        });
        setPoolAddress(pool);
      } else {
        setLpLiquidity(0n);
        setLpAmount0(0n);
        setLpAmount1(0n);
        setPoolAddress("");
      }
    } catch (e) {
      console.error("Error fetching LP states", e);
    }
  };

  // Fetch all live values on load and periodically
  useEffect(() => {
    fetchERC20Balances();
    fetchLPState();

    const interval = setInterval(() => {
      fetchERC20Balances();
      fetchLPState();
    }, 8000);

    return () => clearInterval(interval);
  }, [address, isConnected, publicClient]);

  // Helper: Request token spending approvals to TestingExecutor
  async function approveTokenIfNeeded(tokenAddress: Address, amountRaw: bigint, symbol: string) {
    if (!publicClient || !address) return;

    setStatusText(`Checking ${symbol} allowance for Executor...`);
    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, CONTRACTS.testingExecutor]
    });

    if (allowance >= amountRaw) return;

    setStatusText(`Approving Testing Executor to use your ${symbol}...`);
    const approveTx = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [CONTRACTS.testingExecutor, amountRaw]
    });

    setStatusText(`Confirming ${symbol} approval on-chain...`);
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
  }

  async function ensureMstChain() {
    if (chainId === mstChain.id) return true;

    setStatusText("Switch MetaMask to MST Testnet...");
    try {
      await switchChainAsync({ chainId: mstChain.id });
      return true;
    } catch {
      setStatusText("Transaction blocked until MetaMask is on MST Testnet.");
      return false;
    }
  }

  // Action 1: Create Pool and Initialize Concentrated Liquidity
  const handleInitializePool = async () => {
    if (!isConnected) return;
    if (!(await ensureMstChain())) {
      return;
    }

    if (!initWmst || !initUsdc) {
      setStatusText("Please provide WMST and USDC amounts to create pool.");
      return;
    }

    setIsWorking(true);
    setTxHash("");
    setStatusText("Preparing Pool Initialization...");

    try {
      const wmstRaw = parseUnits(initWmst, wmstToken.decimals);
      const usdcRaw = parseUnits(initUsdc, usdcToken.decimals);

      // Step A: Approve WMST and USDC for testingExecutor
      await approveTokenIfNeeded(wmstToken.address as Address, wmstRaw, "WMST");
      await approveTokenIfNeeded(usdcToken.address as Address, usdcRaw, "USDC");

      // Step B: Call initiatePoolAndLiquidity on testingExecutor
      setStatusText("Confirming pool creation transaction in wallet...");
      
      const SQRT_PRICE_1_TO_1 = 79228162514264337593543950336n;
      const hash = await writeContractAsync({
        address: CONTRACTS.testingExecutor,
        abi: testingExecutorAbi,
        functionName: "initiatePoolAndLiquidity",
        args: [
          {
            fee: initFee,
            sqrtPriceX96: SQRT_PRICE_1_TO_1,
            wmstDesired: wmstRaw,
            usdcDesired: usdcRaw,
            tickLower: Number(initTickLower),
            tickUpper: Number(initTickUpper)
          }
        ],
        value: 0n // paying via WMST ERC20
      });

      setTxHash(hash);
      setStatusText("Submitting initialization request to MST Blockchain...");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatusText("Pool successfully initialized and concentrated liquidity minted!");
      setInitWmst("");
      setInitUsdc("");
      fetchLPState();
      fetchERC20Balances();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Initialization failed.";
      setStatusText(msg.substring(0, 80));
    } finally {
      setIsWorking(false);
    }
  };

  // Action 2: Add Active Liquidity
  const handleAddLiquidity = async () => {
    if (!isConnected || !activeTokenId) return;

    if (!(await ensureMstChain())) {
      return;
    }

    if (!addWmst || !addUsdc) {
      setStatusText("Provide WMST and USDC amounts to add liquidity.");
      return;
    }

    setIsWorking(true);
    setTxHash("");
    setStatusText("Preparing Liquidity Addition...");

    try {
      const wmstRaw = parseUnits(addWmst, wmstToken.decimals);
      const usdcRaw = parseUnits(addUsdc, usdcToken.decimals);

      // Step A: Approve tokens
      await approveTokenIfNeeded(wmstToken.address as Address, wmstRaw, "WMST");
      await approveTokenIfNeeded(usdcToken.address as Address, usdcRaw, "USDC");

      // Step B: Call increaseActiveLiquidity
      setStatusText("Confirming active range addition in wallet...");
      const hash = await writeContractAsync({
        address: CONTRACTS.testingExecutor,
        abi: testingExecutorAbi,
        functionName: "increaseActiveLiquidity",
        args: [wmstRaw, usdcRaw],
        value: 0n
      });

      setTxHash(hash);
      setStatusText("Waiting for block confirmation on MST Blockchain...");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatusText("Concentrated liquidity successfully added!");
      setAddWmst("");
      setAddUsdc("");
      fetchLPState();
      fetchERC20Balances();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to add liquidity.";
      setStatusText(msg.substring(0, 80));
    } finally {
      setIsWorking(false);
    }
  };

  // Action 3: Remove Active Liquidity
  const handleRemoveLiquidity = async () => {
    if (!isConnected || !activeTokenId || !lpLiquidity) return;

    if (!(await ensureMstChain())) {
      return;
    }

    setIsWorking(true);
    setTxHash("");
    setStatusText("Preparing Liquidity Removal...");

    try {
      const liqToRemove = (lpLiquidity * BigInt(removePercent)) / 100n;
      
      setStatusText(`Confirming removal of ${removePercent}% liquidity in wallet...`);
      const hash = await writeContractAsync({
        address: CONTRACTS.testingExecutor,
        abi: testingExecutorAbi,
        functionName: "decreaseActiveLiquidity",
        args: [liqToRemove]
      });

      setTxHash(hash);
      setStatusText("Confirming withdrawal on MST Blockchain...");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatusText("Liquidity successfully removed!");
      fetchLPState();
      fetchERC20Balances();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to remove liquidity.";
      setStatusText(msg.substring(0, 80));
    } finally {
      setIsWorking(false);
    }
  };

  // Action 4: Collect Active LP Fees
  const handleCollectFees = async () => {
    if (!isConnected || !activeTokenId) return;

    if (!(await ensureMstChain())) {
      return;
    }

    setIsWorking(true);
    setTxHash("");
    setStatusText("Requesting LP Fee Collection...");

    try {
      setStatusText("Confirming fee collection in wallet...");
      const hash = await writeContractAsync({
        address: CONTRACTS.testingExecutor,
        abi: testingExecutorAbi,
        functionName: "collectActiveFees"
      });

      setTxHash(hash);
      setStatusText("Withdrawing fees from Uniswap V3 Pool...");
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatusText("Accrued LP fees successfully collected!");
      fetchLPState();
      fetchERC20Balances();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Fee collection failed.";
      setStatusText(msg.substring(0, 80));
    } finally {
      setIsWorking(false);
    }
  };

  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <div
      className={`min-h-screen relative font-sans transition-colors duration-300 ease-in-out select-none overflow-x-hidden pb-16
        ${isDark ? "bg-[#0D111C] text-white" : "bg-[#F9FAFB] text-zinc-950"}`}
      style={{
        background: isDark
          ? "radial-gradient(100% 100% at 50% 0%, #131A2A 0%, #0D111C 100%)"
          : "radial-gradient(100% 100% at 50% 0%, #FFF4F8 0%, #F9FAFB 100%)"
      }}
    >
      {/* Blurred glow background behind the main UI grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute left-[30%] top-[20%] -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 dark:opacity-[0.18]
            ${isDark ? "bg-gradient-to-r from-[#FB118E] to-[#8C33FF]" : "bg-gradient-to-r from-[#FF81C5] to-[#B07EFF]"}`}
        />
      </div>



      {/* Main dashboard view grid */}
      <main className="relative z-10 px-4 pt-10 md:pt-16 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Active Position & Actions - Spans 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#FB118E] to-[#FF7A00] bg-clip-text text-transparent uppercase font-display">
            Active Concentrated LP Position
          </h1>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"} leading-relaxed max-w-lg`}>
            Manage your concentrated range position dynamically. Uniswap V3 utilizes concentrated ticks to generate high capital efficiency.
          </p>

          <AnimatePresence mode="wait">
            {activeTokenId === null ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-10 rounded-[24px] border text-center flex flex-col items-center justify-center gap-4
                  ${isDark ? "bg-[#131A2A]/40 border-[#2C364F]/20" : "bg-white border-zinc-150 shadow-sm"}`}
              >
                <HelpCircle size={48} className="text-zinc-500 opacity-60 animate-bounce" />
                <div>
                  <h3 className="font-bold text-lg">Querying active LP state...</h3>
                  <p className="text-xs text-zinc-500 mt-1">Connecting to tMST blockchain nodes</p>
                </div>
              </motion.div>
            ) : activeTokenId === 0n ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-10 rounded-[24px] border text-center flex flex-col items-center justify-center gap-4
                  ${isDark ? "bg-[#131A2A]/40 border-[#2C364F]/20" : "bg-white border-zinc-150 shadow-sm"}`}
              >
                <Coins size={48} className="text-zinc-500 opacity-60" />
                <div>
                  <h3 className="font-bold text-lg">No Active Position Found</h3>
                  <p className="text-xs text-zinc-500 mt-1">Initialize the Concentrated Liquidity pool in the right panel to get started!</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Active Position Details Panel */}
                <div
                  className={`p-6 rounded-[24px] border shadow-lg relative overflow-hidden
                    ${isDark ? "bg-[#131A2A] border-[#2C364F]/50" : "bg-white border-zinc-150"}`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold py-1 px-2.5 rounded-lg bg-pink-500/10 text-[#FB118E]">
                      NFT Token ID #{activeTokenId.toString()}
                    </span>
                    <span className="text-xs font-semibold flex items-center gap-1 opacity-70">
                      Active Range Lower: {initTickLower} to Upper: {initTickUpper}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#FB118E]" />
                    Concentrated Reserves Stored
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 rounded-xl border ${isDark ? "bg-[#1B2236] border-[#2C364F]/30" : "bg-[#F5F6FC] border-transparent"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <TokenLogo symbol="WMST" size={16} />
                        <span className="text-xs font-semibold text-zinc-400">WMST Reserve</span>
                      </div>
                      <span className="text-lg font-bold">
                        {lpAmount0 !== null ? Number(formatUnits(lpAmount0, wmstToken.decimals)).toFixed(4) : "0.0000"}
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border ${isDark ? "bg-[#1B2236] border-[#2C364F]/30" : "bg-[#F5F6FC] border-transparent"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <TokenLogo symbol="USDC" size={16} />
                        <span className="text-xs font-semibold text-zinc-400">USDC Reserve</span>
                      </div>
                      <span className="text-lg font-bold">
                        {lpAmount1 !== null ? Number(formatUnits(lpAmount1, usdcToken.decimals)).toFixed(4) : "0.0000"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs opacity-75 mt-2">
                    <span className="font-semibold">Pool Address:</span>
                    <a
                      href={`https://testnet.mstscan.com/address/${poolAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono underline hover:text-[#FB118E] flex items-center gap-1"
                    >
                      {poolAddress.slice(0, 10)}...{poolAddress.slice(-8)}
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  {lpLiquidity !== null && (
                    <div className="flex justify-between items-center text-xs opacity-75 mt-2">
                      <span className="font-semibold">Active Liquidity:</span>
                      <span className="font-mono font-bold text-pink-500">{lpLiquidity.toString()}</span>
                    </div>
                  )}
                </div>

                {/* Add Liquidity Operation panel */}
                <div
                  className={`p-6 rounded-[24px] border shadow-md
                    ${isDark ? "bg-[#131A2A] border-[#2C364F]/40" : "bg-white border-zinc-150"}`}
                >
                  <h3 className="text-base font-bold mb-4 flex items-center gap-1.5">
                    <Plus size={18} className="text-emerald-400" />
                    Add Liquidity to Active Position
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                          Desired WMST
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0.0"
                            value={addWmst}
                            onChange={(e) => setAddWmst(e.target.value)}
                            disabled={isWorking}
                            className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium outline-none bg-transparent
                              ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-500">WMST</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Bal: {wmstBalance}</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                          Desired USDC
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0.0"
                            value={addUsdc}
                            onChange={(e) => setAddUsdc(e.target.value)}
                            disabled={isWorking}
                            className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium outline-none bg-transparent
                              ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-500">USDC</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Bal: {usdcBalance}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAddLiquidity}
                      disabled={isWorking || !addWmst || !addUsdc}
                      className="w-full py-3 rounded-xl font-bold text-sm tracking-wide bg-[#FB118E] hover:bg-[#FB118E]/95 text-white active:scale-[0.99] transition-all shadow-md shadow-pink-500/10"
                    >
                      Increase Concentrated LP Range
                    </button>
                  </div>
                </div>

                {/* Remove Liquidity slider and collect LP fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Remove Liquidity card */}
                  <div
                    className={`p-6 rounded-[24px] border shadow-md
                      ${isDark ? "bg-[#131A2A] border-[#2C364F]/40" : "bg-white border-zinc-150"}`}
                  >
                    <h3 className="text-base font-bold mb-4">Remove Concentrated Liquidity</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-zinc-400 font-semibold">Percentage to withdraw</span>
                          <span className="text-[#FB118E] font-bold">{removePercent}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={removePercent}
                          onChange={(e) => setRemovePercent(Number(e.target.value))}
                          disabled={isWorking}
                          className="w-full accent-pink-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <button
                        onClick={handleRemoveLiquidity}
                        disabled={isWorking || !lpLiquidity || lpLiquidity === 0n}
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      >
                        Decrease LP Reserves
                      </button>
                    </div>
                  </div>

                  {/* Collect fees card */}
                  <div
                    className={`p-6 rounded-[24px] border shadow-md flex flex-col justify-between
                      ${isDark ? "bg-[#131A2A] border-[#2C364F]/40" : "bg-white border-zinc-150"}`}
                  >
                    <div>
                      <h3 className="text-base font-bold mb-2">Accumulated LP Fee Rewards</h3>
                      <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"} mb-4`}>
                        Generated from swapping slippages and trading commissions inside your price ranges.
                      </p>
                    </div>

                    <button
                      onClick={handleCollectFees}
                      disabled={isWorking}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition"
                    >
                      Collect Accrued Fees
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Working status feedback box */}
          <AnimatePresence>
            {statusText && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`p-4 rounded-[20px] border text-xs font-semibold leading-relaxed
                    ${
                      statusText.includes("minted") || statusText.includes("added") || statusText.includes("removed") || statusText.includes("collected")
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse"
                        : "bg-[#131A2A] border-[#2C364F]/50 text-zinc-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Status: {statusText}</span>
                    <button
                      onClick={() => setStatusText("")}
                      className="underline text-[10px] uppercase font-bold text-[#FB118E]"
                    >
                      Dismiss
                    </button>
                  </div>
                  {txHash && (
                    <div className="mt-2 font-mono text-[10px] break-all opacity-70">
                      TX Hash: <a href={`https://testnet.mstscan.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline hover:text-[#FB118E] flex items-center gap-1 mt-0.5">{txHash} <ExternalLink size={8} /></a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN (Create Pool Panel - Spans 5 cols) */}
        <div className="lg:col-span-5">
          <div
            className={`p-6 rounded-[24px] border shadow-xl relative
              ${
                isDark
                  ? "bg-[#131A2A] border-[#2C364F]/50 text-white"
                  : "bg-white border-zinc-150 text-zinc-950"
              }`}
          >
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Coins size={18} className="text-[#FB118E]" />
              Create & Initialize Pool
            </h2>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"} mb-5 leading-normal`}>
              Deploy a new concentrated liquidity pool. The orchestrator will initialize token ranges, register the pool with the factory, and mint the concentrated position.
            </p>

            <div className="space-y-4">
              {/* Fee Tier */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-2">
                  Select Pool Fee Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 3000, 10000].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setInitFee(fee)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition
                        ${
                          initFee === fee
                            ? "bg-[#FB118E]/10 border-[#FB118E] text-[#FB118E]"
                            : isDark
                            ? "bg-[#1B2236] border-[#2C364F]/30 text-zinc-400 hover:border-[#2C364F]"
                            : "bg-[#F5F6FC] border-transparent text-zinc-600 hover:bg-zinc-100"
                        }`}
                    >
                      {(fee / 10000).toFixed(2)}%
                      <span className="block text-[9px] font-normal text-zinc-500">
                        {fee === 3000 ? "Best for standard pairs" : fee === 500 ? "Stable pairs" : "Exotic pairs"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Desired inputs */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-zinc-400">Initial WMST Amount</span>
                    <span>Bal: {wmstBalance}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={initWmst}
                      onChange={(e) => setInitWmst(e.target.value)}
                      disabled={isWorking}
                      className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium outline-none bg-transparent
                        ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1">
                      <TokenLogo symbol="WMST" size={16} />
                      <span className="text-xs font-bold">WMST</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-zinc-400">Initial USDC Amount</span>
                    <span>Bal: {usdcBalance}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={initUsdc}
                      onChange={(e) => setInitUsdc(e.target.value)}
                      disabled={isWorking}
                      className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium outline-none bg-transparent
                        ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1">
                      <TokenLogo symbol="USDC" size={16} />
                      <span className="text-xs font-bold">USDC</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tick Lower & Upper bounds */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
                    Tick Lower
                  </label>
                  <input
                    type="number"
                    value={initTickLower}
                    onChange={(e) => setInitTickLower(e.target.value)}
                    disabled={isWorking}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono outline-none bg-transparent
                      ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
                    Tick Upper
                  </label>
                  <input
                    type="number"
                    value={initTickUpper}
                    onChange={(e) => setInitTickUpper(e.target.value)}
                    disabled={isWorking}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono outline-none bg-transparent
                      ${isDark ? "border-[#2C364F]/50 focus:border-[#FB118E]" : "border-zinc-200 focus:border-[#FB118E]"}`}
                  />
                </div>
              </div>

              {/* Info banner */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-[11px] leading-relaxed
                ${isDark ? "bg-[#1B2236] border-[#2C364F]/20 text-zinc-400" : "bg-[#F5F6FC] border-transparent text-zinc-600"}`}>
                <Info size={14} className="text-[#FB118E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-300 dark:text-white block mb-0.5">Initial Pool Rate</span>
                  The initial ratio will deploy at exactly 1:1 price ratio (`sqrtPriceX96` of `2^96`), matching the deployment configuration of the periphery ecosystem. Lower/Upper ticks default to Full Bounds (`-887220` to `887220`).
                </div>
              </div>

              {/* Action trigger button */}
              <button
                onClick={handleInitializePool}
                disabled={isWorking || !initWmst || !initUsdc}
                className="w-full py-4 rounded-xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-[#FB118E] to-[#FF7A00] text-white hover:opacity-95 shadow-md shadow-pink-500/10 active:scale-[0.99] transition-all"
              >
                {isWorking ? "Deploying Pool Contracts..." : "Initialize Pool & Deposit LP"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
