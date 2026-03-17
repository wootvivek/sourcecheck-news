"use client";

import Link from "next/link";
import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import { useArticles } from "@/hooks/useArticles";

export default function HomePage() {
  const { articles, loading } = useArticles();

  return (
    <>
      <CategoryPills />
      <Link
        href="/catch-up"
        className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 px-4 py-3 group hover:shadow-md transition-all"
      >
        <span className="text-2xl">&#9889;</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Quick Catch-Up
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            See what multiple sources agree on right now
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
        Top Stories
      </h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </>
  );
}
