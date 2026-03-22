"use client";

import { OpinionPiece } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CATEGORY_BG: Record<string, string> = {
  world: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  politics: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  tech: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  business: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  health: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  sports: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  science: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  entertainment: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  opinion: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  local: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export default function OpinionArticle({ opinion }: { opinion: OpinionPiece }) {
  const catBg = CATEGORY_BG[opinion.category] || CATEGORY_BG.world;

  return (
    <article className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${catBg}`}>
            {opinion.category}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            AI Analysis
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {opinion.headline}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
          {opinion.summary}
        </p>
      </div>

      {/* Markdown body */}
      <div className="px-5 pb-4 sm:px-6">
        <div className="opinion-prose text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-3">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-blue-500 pl-3 my-3 text-gray-600 dark:text-gray-400 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {opinion.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Sources footer */}
      <div className="px-5 py-4 sm:px-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Sources ({opinion.sourceArticles.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {opinion.sourceArticles.map((src, i) => (
            <a
              key={i}
              href={src.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
              title={src.title}
            >
              {src.source}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
