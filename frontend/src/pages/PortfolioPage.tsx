import { useThemeStore } from "../store/themeStore";
import { PortfolioPage } from "../features/portfolio/components/PortfolioPage";

export default function PortfolioPageWrapper() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen relative font-sans transition-colors duration-300 ease-in-out select-none overflow-x-hidden pb-20 pt-10 px-4
        ${isDark ? "dark bg-[#0D111C] text-white" : "bg-white text-zinc-950"}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0D111C 0%, #1a1f2e 50%, #0D111C 100%)"
          : "linear-gradient(135deg, #fafbfc 0%, #f5f7fa 50%, #fafbfc 100%)"
      }}
    >
      {/* Ambient glow effects matching the pool page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={`absolute left-1/4 top-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-12 transition-all duration-500
            ${isDark ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30" : "bg-gradient-to-r from-cyan-400/20 to-blue-400/20"}`}
        />
        <div
          className={`absolute right-1/4 bottom-1/3 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10 transition-all duration-500
            ${isDark ? "bg-gradient-to-l from-pink-500/20 to-orange-500/20" : "bg-gradient-to-l from-pink-300/15 to-orange-300/15"}`}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <PortfolioPage />
      </div>
    </div>
  );
}
