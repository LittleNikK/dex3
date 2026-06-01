import { Suspense, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { wagmiConfig } from "./config/wagmi";
import { BackgroundCanvas } from "./components/swap/BackgroundCanvas";

// Import custom pages
import SwapPage from "./pages/SwapPage";
import TrendingPage from "./pages/TrendingPage";
import TransferPage from "./pages/TransferPage";
import ExplorePage from "./pages/ExplorePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LiquidityPage from "./pages/LiquidityPage";
import WalletPage from "./pages/WalletPage";

import { Menu, X, Flame, Sun, Moon } from "lucide-react";
import { useThemeStore } from "./store/themeStore";

const queryClient = new QueryClient();

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const links = [
    { to: "/", label: "Swap" },
    { to: "/trending", label: "Trending" },
    { to: "/transfer", label: "Transfer" },
    { to: "/explore", label: "Explore" },
    { to: "/liquidity", label: "Liquidity" },
    { to: "/wallet", label: "Wallet" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" }
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b transition px-4 py-4 max-w-6xl mx-auto rounded-b-2xl backdrop-blur-xl
      ${isDark ? "border-zinc-900 bg-black/60" : "border-zinc-200 bg-white/70 text-zinc-950 shadow-sm"}`}>
      <div className="flex items-center justify-between">
        {/* TOP LEFT: Theme Toggle and Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition duration-150
              ${
                isDark
                  ? "bg-zinc-900/50 border-zinc-800 text-yellow-400 hover:bg-zinc-800"
                  : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 shadow-sm"
              }`}
            title="Toggle light/dark mode"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="MSTSwap Logo" 
              className="h-8 w-8 object-contain group-hover:scale-110 transition duration-300"
            />
            <span className="font-extrabold uppercase tracking-widest text-sm bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:text-neon-pink">
              MSTSWAP
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = link.to === "/"
              ? (location.pathname === "/" || location.pathname === "/swap")
              : location.pathname === link.to;
            return (
              <Link 
                key={link.to} 
                to={link.to}
                className={`text-xs uppercase tracking-wider font-semibold transition ${isActive ? "text-pink-500 font-extrabold text-neon-pink" : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-950"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>



        {/* Mobile menu trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-zinc-400 hover:text-white transition"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Links Dropdown */}
      {isOpen && (
        <div className={`md:hidden mt-4 pt-4 border-t flex flex-col gap-3 ${isDark ? "border-zinc-900" : "border-zinc-200"}`}>
          {links.map((link) => {
            const isActive = link.to === "/"
              ? (location.pathname === "/" || location.pathname === "/swap")
              : location.pathname === link.to;
            return (
              <Link 
                key={link.to} 
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`text-xs uppercase tracking-wider font-semibold transition py-1 ${isActive ? "text-pink-500 text-neon-pink" : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-950"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

function MainLayout() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ease-in-out select-none
        ${isDark ? "text-white" : "text-zinc-950"}`}
      style={{
        background: isDark
          ? "radial-gradient(100% 100% at 50% 0%, #131A2A 0%, #0D111C 100%)"
          : "radial-gradient(100% 100% at 50% 0%, #FFF4F8 0%, #F9FAFB 100%)"
      }}
    >
      {/* Global persistent 3D WebGL Canvas Background */}
      {isDark && <BackgroundCanvas />}

      {/* Navigation Navbar */}
      <Navigation />

      {/* Page Routing */}
      <div className="relative z-10">
        <Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-xs font-semibold uppercase tracking-wider text-zinc-500 animate-pulse">Loading...</div>}>
          <Routes>
            <Route path="/" element={<SwapPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/liquidity" element={<LiquidityPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
