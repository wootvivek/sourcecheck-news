"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

function NavDog() {
  return (
    <svg width="68" height="68" viewBox="0 0 120 120" fill="none" className="select-none">
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
      <path d="M 72 65 Q 75 68 78 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" className="text-gray-700 dark:text-gray-800" />
      {/* Binoculars */}
      <rect x="62" y="48" width="12" height="16" rx="6" className="fill-gray-600 dark:fill-gray-500" />
      <rect x="78" y="48" width="12" height="16" rx="6" className="fill-gray-600 dark:fill-gray-500" />
      <rect x="73" y="53" width="6" height="6" rx="2" className="fill-gray-500 dark:fill-gray-400" />
      <circle cx="68" cy="49" r="6" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
      <circle cx="84" cy="49" r="6" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
      <circle cx="66" cy="47" r="2" className="fill-white" opacity="0.7" />
      <circle cx="82" cy="47" r="2" className="fill-white" opacity="0.7" />
      {/* Belly spot */}
      <ellipse cx="55" cy="82" rx="10" ry="8" className="fill-amber-200 dark:fill-amber-300" opacity="0.5" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-0.5 shrink-0">
          <NavDog />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">SourceCheck<span className="text-blue-600 dark:text-blue-400">.News</span></span>
            <Link href="/about" className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>One source is a rumor. Multiple sources is news.</Link>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <SearchBar />
          <Link href="/about" className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="About SourceCheck.News">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
