"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { useStreak } from "@/hooks/useStreak";

function StreakPopup({ streak, onClose }: { streak: ReturnType<typeof useStreak>; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const getMessage = () => {
    if (streak.currentStreak >= 30) return "Legendary! You're a news machine! 🏆";
    if (streak.currentStreak >= 14) return "Two weeks strong! Unstoppable! 💪";
    if (streak.currentStreak >= 7) return "A full week! You're on fire! 🔥";
    if (streak.currentStreak >= 3) return "Nice streak! Keep it going! ⚡";
    return "You're building a habit! 🌱";
  };

  return (
    <div ref={ref} className="absolute top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2">
      <div className="text-center">
        <div className="text-3xl mb-1">🔥</div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">{streak.currentStreak}-day streak!</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getMessage()}</div>
        <div className="mt-3 space-y-1 text-[11px] text-gray-400 dark:text-gray-500">
          <div>🏅 Longest streak: <span className="font-semibold text-gray-600 dark:text-gray-300">{streak.longestStreak} days</span></div>
          <div>📰 Total visits: <span className="font-semibold text-gray-600 dark:text-gray-300">{streak.totalVisits}</span></div>
        </div>
      </div>
    </div>
  );
}

function NavDog() {
  return (
    <div className="relative group">
      {/* Subtle glow behind dog on hover */}
      <div className="absolute inset-0 bg-amber-300/0 group-hover:bg-amber-300/30 rounded-full blur-md transition-all duration-300" />
      <svg
        width="44"
        height="44"
        viewBox="0 0 120 120"
        fill="none"
        className="relative drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
      >
        {/* Body */}
        <ellipse cx="55" cy="80" rx="22" ry="16" className="fill-amber-300 dark:fill-amber-400" />
        {/* Back legs */}
        <rect x="38" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />
        <rect x="58" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />
        {/* Front legs */}
        <rect x="68" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400" transform="rotate(-15 71 81)" />
        <rect x="78" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400" transform="rotate(15 81 81)" />
        {/* Head */}
        <circle cx="75" cy="58" r="18" className="fill-amber-300 dark:fill-amber-400" />
        {/* Ears */}
        <ellipse cx="60" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500" transform="rotate(-20 60 44)" />
        <ellipse cx="90" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500" transform="rotate(20 90 44)" />
        {/* Inner ears */}
        <ellipse cx="60" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300" transform="rotate(-20 60 44)" />
        <ellipse cx="90" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300" transform="rotate(20 90 44)" />
        {/* Snout */}
        <ellipse cx="75" cy="64" rx="10" ry="7" className="fill-amber-200 dark:fill-amber-300" />
        {/* Nose */}
        <ellipse cx="75" cy="61" rx="4" ry="3" className="fill-gray-800 dark:fill-gray-900" />
        {/* Mouth */}
        <path d="M 72 65 Q 75 68 78 65" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Eyes — bright and friendly */}
        <circle cx="67" cy="53" r="3.5" className="fill-gray-800 dark:fill-gray-900" />
        <circle cx="83" cy="53" r="3.5" className="fill-gray-800 dark:fill-gray-900" />
        {/* Eye sparkle */}
        <circle cx="65.5" cy="51.5" r="1.5" fill="white" opacity="0.9" />
        <circle cx="81.5" cy="51.5" r="1.5" fill="white" opacity="0.9" />
        {/* Belly spot */}
        <ellipse cx="55" cy="82" rx="10" ry="8" className="fill-amber-200 dark:fill-amber-300" opacity="0.5" />
        {/* Tail — wagging with CSS animation */}
        <path
          d="M 35 75 Q 18 55 25 42"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="text-amber-400 dark:text-amber-300 origin-[35px_75px] group-hover:animate-[wag_0.3s_ease-in-out_infinite_alternate]"
        />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const streak = useStreak();
  const [showStreak, setShowStreak] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1 min-w-0 group/brand">
            <div className="shrink-0">
              <NavDog />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">SourceCheck<span className="text-blue-600 dark:text-blue-400">.News</span></span>
                {streak.currentStreak > 1 && (
                  <div className="relative hidden sm:block">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowStreak(!showStreak); }} className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full shrink-0 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors cursor-pointer">
                      🔥 {streak.currentStreak}
                    </button>
                    {showStreak && <StreakPopup streak={streak} onClose={() => setShowStreak(false)} />}
                  </div>
                )}
              </div>
              <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide group-hover/brand:text-blue-500 transition-colors">See how many sources agree before you believe.</span>
            </div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search — desktop only inline */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            {/* Bookmarks */}
            <Link href="/bookmarks" className="p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Saved Stories">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </Link>
            {/* About — desktop only */}
            <Link href="/about" className="p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="About SourceCheck.News">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </Link>
            <ThemeToggle />
            <Link href="/settings" className="p-1.5 sm:p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Search + streak — mobile only, second row */}
        <div className="sm:hidden mt-2 flex items-center gap-2">
          <div className="flex-1">
            <SearchBar />
          </div>
          {streak.currentStreak > 1 && (
            <div className="relative">
              <button onClick={() => setShowStreak(!showStreak)} className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full shrink-0 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors cursor-pointer">
                🔥 {streak.currentStreak}
              </button>
              {showStreak && <StreakPopup streak={streak} onClose={() => setShowStreak(false)} />}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
