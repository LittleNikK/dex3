import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CandlestickChart from "../components/charts/CandlestickChart";
import { TrendingUp, BarChart3, Clock, DollarSign, Activity } from "lucide-react";

interface TradeLog {
  id: string;
  time: string;
  type: "buy" | "sell";
  price: number;
  amount: string;
}

// Generate premium mock candlestick data for WMST/USDC 0.3% Pool
const CANDLE_MOCK = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const time = `2026-05-${day < 10 ? "0" + day : day}`;
  const base = 56 + Math.sin(i / 3) * 3;
  const open = base;
  const close = base + (Math.random() - 0.5) * 2;
  const high = Math.max(open, close) + Math.random() * 0.8;
  const low = Math.min(open, close) - Math.random() * 0.8;
  return { time, open, high, low, close };
});

export default function TrendingPage() {
  const [logs, setLogs] = useState<TradeLog[]>([]);

  // Periodically stream simulated order book swap events
  useEffect(() => {
    const initialLogs: TradeLog[] = Array.from({ length: 5 }, (_, i) => ({
      id: Math.random().toString(),
      time: new Date(Date.now() - i * 60000).toLocaleTimeString(),
      type: Math.random() > 0.4 ? "buy" : "sell",
      price: Number((56 + (Math.random() - 0.5) * 0.5).toFixed(4)),
      amount: (Math.random() * 50 + 2).toFixed(4)
    }));
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const newLog: TradeLog = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        type: Math.random() > 0.55 ? "buy" : "sell",
        price: Number((56 + (Math.random() - 0.5) * 0.4).toFixed(4)),
        amount: (Math.random() * 80 + 1).toFixed(4)
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen px-4 pb-20 pt-10 overflow-hidden font-sans select-none">
      
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-zinc-800/40 pb-6">
          <div>
            <span className="text-xs font-bold tracking-wider text-orange-400 uppercase flex items-center gap-1.5 font-mono">
              <Activity size={14} className="animate-pulse" />
              Live Pricing Tickers
            </span>
            <h1 className="text-3xl font-display font-extrabold uppercase text-zinc-950 dark:text-white tracking-wide mt-1">Trending Pools</h1>
          </div>
          <div className="text-xs font-bold font-mono text-zinc-500">
            Feed updated every 4s via WebSocket RPC
          </div>
        </div>

        {/* Live Pool metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-xl transition-all hover:bg-zinc-50/80 dark:hover:bg-[#0b0b14]/85">
            <div className="text-xs font-bold font-mono text-zinc-500 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-orange-400" /> Active Pair
            </div>
            <div className="text-lg font-display font-bold text-zinc-950 dark:text-white mt-1">WMST / USDC</div>
          </div>
          <div className="p-5 rounded-2xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-xl transition-all hover:bg-zinc-50/80 dark:hover:bg-[#0b0b14]/85">
            <div className="text-xs font-bold font-mono text-zinc-500 flex items-center gap-1.5">
              <DollarSign size={12} className="text-pink-400" /> Pool Price
            </div>
            <div className="text-lg font-mono font-bold text-zinc-950 dark:text-white mt-1">56.4200 USDC</div>
          </div>
          <div className="p-5 rounded-2xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-xl transition-all hover:bg-zinc-50/80 dark:hover:bg-[#0b0b14]/85">
            <div className="text-xs font-bold font-mono text-zinc-500 flex items-center gap-1.5">
              <BarChart3 size={12} className="text-purple-400" /> 24h Vol
            </div>
            <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">+$420500.0000</div>
          </div>
          <div className="p-5 rounded-2xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-xl transition-all hover:bg-zinc-50/80 dark:hover:bg-[#0b0b14]/85">
            <div className="text-xs font-bold font-mono text-zinc-500 flex items-center gap-1.5">
              <Clock size={12} className="text-zinc-400" /> Fee Tier
            </div>
            <div className="text-lg font-mono font-bold text-zinc-600 dark:text-zinc-300 mt-1">3000.0000 Bps</div>
          </div>
        </div>

        {/* Live Exchange layout */}
        <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* Chart column */}
          <div className="p-5 rounded-3xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">Historical OHLC Price</h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-900/60 text-zinc-400">1D Candles</span>
            </div>
            <div className="border-none p-2 rounded-2xl bg-black/40">
              <CandlestickChart data={CANDLE_MOCK} />
            </div>
          </div>

          {/* Real-time Buy/Sell Trades Feed */}
          <div className="p-5 rounded-3xl border-none bg-white/75 dark:bg-[#0b0b14]/60 backdrop-blur-2xl shadow-2xl space-y-4 h-[390px] flex flex-col">
            <h3 className="text-xs uppercase font-display font-bold text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-pink-500" />
              Live Order Book Stream
            </h3>
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-mono font-bold border-b border-zinc-200/50 dark:border-zinc-900/40 pb-2">
              <span>Time</span>
              <span>Price</span>
              <span>Amount</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs font-mono">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center font-bold"
                  >
                    <span className="text-zinc-500 font-bold">{log.time}</span>
                    <span className={log.type === "buy" ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                      ${log.price.toFixed(4)}
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-bold">{log.amount} WMST</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
