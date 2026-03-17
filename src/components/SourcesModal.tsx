"use client";

import { useEffect, useState } from "react";
import { RelatedArticle } from "@/lib/types";
import BiasSpectrum from "./BiasSpectrum";
import { getSourceBias } from "@/lib/bias";

interface SourcesModalProps {
  mainSource: string;
  mainTitle: string;
  mainDescription: string;
  mainLink: string;
  relatedArticles: RelatedArticle[];
  echoScore: number;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SCORE_COLORS: Record<number, string> = {
  1: "bg-gray-400",
  2: "bg-amber-400",
  3: "bg-blue-400",
  4: "bg-green-400",
  5: "bg-emerald-500",
};

type Tab = "sources" | "perspectives";

export default function SourcesModal({
  mainSource,
  mainTitle,
  mainDescription,
  mainLink,
  relatedArticles,
  echoScore,
  onClose,
}: SourcesModalProps) {
  const [tab, setTab] = useState<Tab>("perspectives");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const allSources = [
    { source: mainSource, title: mainTitle, description: mainDescription, link: mainLink, pubDate: "" },
    ...relatedArticles,
  ];

  const sourceNames = allSources.map((s) => s.source);
  const dotColor = SCORE_COLORS[echoScore] || SCORE_COLORS[1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < echoScore ? dotColor : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                SourceCheck Score: {echoScore}/5
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-0.5">
            <button
              onClick={() => setTab("perspectives")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === "perspectives"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Perspective View
            </button>
            <button
              onClick={() => setTab("sources")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === "sources"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              All Sources
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {tab === "perspectives" ? (
            <PerspectiveView sources={allSources} sourceNames={sourceNames} />
          ) : (
            <SourcesList sources={allSources} />
          )}
        </div>
      </div>
    </div>
  );
}

interface SourceItem {
  source: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

function PerspectiveView({ sources, sourceNames }: { sources: SourceItem[]; sourceNames: string[] }) {
  return (
    <div className="p-5 space-y-5">
      {/* Bias spectrum */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Political Spectrum
        </h4>
        <BiasSpectrum sources={sourceNames} />
      </div>

      {/* Side-by-side headlines */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          How each source framed this story
        </h4>
        <div className="space-y-3">
          {sources.map((article, idx) => {
            const bias = getSourceBias(article.source);
            return (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getBiasColor(bias.rating) }}
                  />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {article.source}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${bias.color} bg-gray-100 dark:bg-gray-700`}>
                    {bias.label}
                  </span>
                  {article.pubDate && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                      {timeAgo(article.pubDate)}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {article.title}
                </h4>
                {article.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                    {article.description}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SourcesList({ sources }: { sources: SourceItem[] }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {sources.map((article, idx) => (
        <a
          key={idx}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {article.source}
            </span>
            {article.pubDate && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {timeAgo(article.pubDate)}
              </span>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
            {article.title}
          </h4>
          {article.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {article.description}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}

function timeAgoInner(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getBiasColor(rating: number): string {
  const colors: Record<number, string> = {
    [-2]: "#3b82f6",
    [-1]: "#38bdf8",
    [0]: "#9ca3af",
    [1]: "#fb923c",
    [2]: "#ef4444",
  };
  return colors[rating] || "#9ca3af";
}
