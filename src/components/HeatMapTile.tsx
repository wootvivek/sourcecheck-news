"use client";

import { useState } from "react";
import { Article, CATEGORY_COLORS } from "@/lib/types";

interface HeatMapTileProps {
  article: Article;
  tier: "hero" | "medium" | "small";
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

const BADGE_BG: Record<number, string> = {
  1: "bg-gray-500/80",
  2: "bg-amber-500/90",
  3: "bg-blue-500/90",
  4: "bg-green-500/90",
  5: "bg-emerald-500/90",
};

export default function HeatMapTile({
  article,
  tier,
}: HeatMapTileProps) {
  const [imgError, setImgError] = useState(false);
  const borderColor = CATEGORY_COLORS[article.category] || "border-l-gray-500";
  const badgeBg = BADGE_BG[article.echoScore] || BADGE_BG[1];

  if (tier === "hero") {
    return (
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow h-full`}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
          {article.imageUrl && !imgError ? (
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl text-gray-300 dark:text-gray-600">&#9993;</span>
            </div>
          )}
          {/* Echo badge */}
          <div className={`absolute top-2 left-2 ${badgeBg} backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-lg`}>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < article.echoScore ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-white">
              {article.echoScore === 1 ? "1 source" : `${article.echoScore} sources`}
            </span>
          </div>
          {/* Time */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-[10px] font-medium text-white">{timeAgo(article.pubDate)}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {article.source}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {article.description}
            </p>
          )}
        </div>
      </a>
    );
  }

  if (tier === "medium") {
    return (
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block rounded-xl border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} bg-white dark:bg-gray-800 overflow-hidden hover:shadow-md transition-shadow h-full`}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail */}
          {article.imageUrl && !imgError ? (
            <img
              src={article.imageUrl}
              alt=""
              className="w-16 h-16 rounded-lg object-cover shrink-0"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <span className="text-lg text-gray-300 dark:text-gray-600">&#9993;</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {article.source}
              </span>
              <span className="text-[10px] text-gray-400">&#183;</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {timeAgo(article.pubDate)}
              </span>
              <div className="flex items-center gap-0.5 ml-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < article.echoScore ? (BADGE_BG[article.echoScore] || "bg-gray-400").replace("/90", "").replace("/80", "") : "bg-gray-200 dark:bg-gray-700"}`} />
                ))}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {article.title}
            </h3>
          </div>
        </div>
      </a>
    );
  }

  // small
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-lg border border-gray-100 dark:border-gray-700 border-l-4 ${borderColor} bg-white dark:bg-gray-800 px-3 py-2.5 hover:shadow-sm transition-shadow h-full`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i < article.echoScore ? "bg-gray-400" : "bg-gray-200 dark:bg-gray-700"}`} />
          ))}
        </div>
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          {article.source}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
          {timeAgo(article.pubDate)}
        </span>
      </div>
      <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {article.title}
      </h3>
    </a>
  );
}
