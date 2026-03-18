"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">SourceCheck<span className="text-blue-600 dark:text-blue-400">.News</span></span>
            <Link href="/about" className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={(e) => e.stopPropagation()}>See how many sources agree before you believe.</Link>
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
