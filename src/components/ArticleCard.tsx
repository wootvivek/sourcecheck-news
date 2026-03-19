"use client";

import { useState } from "react";
import { Article } from "@/lib/types";
import BiasDial from "./BiasDial";
import SourceMeter from "./SourceMeter";
import SourcesModal from "./SourcesModal";

interface ArticleCardProps {
  article: Article;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
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

export default function ArticleCard({
  article,
  isBookmarked = false,
  onToggleBookmark,
}: ArticleCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const badgeBg = {
    1: "bg-gray-500/80",
    2: "bg-amber-500/90",
    3: "bg-blue-500/90",
    4: "bg-green-500/90",
    5: "bg-red-600/95 ring-2 ring-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.6)]",
  }[article.echoScore] || "bg-gray-500/80";

  const openModal = () => {
    if (article.relatedArticles.length > 0) setShowModal(true);
  };

  return (
    <>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-row sm:flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
      >
        {/* Image — clean on mobile, overlays on desktop */}
        <div className="relative w-24 sm:w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 sm:aspect-video">
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
          {/* Echo badge — desktop only overlay */}
          <div
            role="button"
            tabIndex={0}
            className={`hidden sm:flex absolute top-2 left-2 ${badgeBg} backdrop-blur-sm rounded-lg px-2 py-1 items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform shadow-lg`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openModal();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                openModal();
              }
            }}
          >
            <SourceMeter score={article.echoScore} sourceCount={article.echoSources.length} />
          </div>
          {/* Time — desktop only overlay */}
          <div className="hidden sm:block absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-[10px] font-medium text-white">
              {timeAgo(article.pubDate)}
            </span>
          </div>
          {/* Bookmark — desktop only, bottom left */}
          {onToggleBookmark && (
            <div
              role="button"
              tabIndex={0}
              className="hidden sm:flex absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg w-8 h-8 items-center justify-center cursor-pointer hover:bg-black/60 transition-colors z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBookmark();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleBookmark();
                }
              }}
              title={isBookmarked ? "Remove bookmark" : "Save for later"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          )}
          {/* Bias dial — desktop only, bottom right */}
          {article.echoScore > 1 && (
            <div
              role="button"
              tabIndex={0}
              className="hidden sm:flex absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-1 cursor-pointer hover:bg-black/60 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal();
                }
              }}
            >
              <BiasDial sources={article.echoSources} size={48} />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-2.5 sm:p-4 min-w-0">
          {/* Mobile: source + time + bookmark inline */}
          <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {article.source}
            </span>
            <span className="text-[10px] text-gray-400 sm:hidden">·</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 sm:hidden">
              {timeAgo(article.pubDate)}
            </span>
            {onToggleBookmark && (
              <button
                className="sm:hidden ml-auto p-0.5 text-gray-400 hover:text-blue-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                title={isBookmarked ? "Remove bookmark" : "Save for later"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          {/* Mobile: meter + bias dial row */}
          <div className="sm:hidden flex items-end justify-between gap-2 mt-auto">
            <div
              role="button"
              tabIndex={0}
              className={`inline-flex items-center gap-1.5 ${badgeBg} backdrop-blur-sm rounded-md px-1.5 py-0.5 w-fit cursor-pointer`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal();
                }
              }}
            >
              <SourceMeter score={article.echoScore} sourceCount={article.echoSources.length} compact />
            </div>
            {article.echoScore > 1 && (
              <div
                role="button"
                tabIndex={0}
                className="bg-black/50 backdrop-blur-sm rounded-md p-0.5 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                  }
                }}
              >
                <BiasDial sources={article.echoSources} size={36} />
              </div>
            )}
          </div>
          <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {article.description}
          </p>
        </div>
      </a>

      {showModal && (
        <SourcesModal
          mainSource={article.source}
          mainTitle={article.title}
          mainDescription={article.description}
          mainLink={article.link}
          relatedArticles={article.relatedArticles}
          echoScore={article.echoScore}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
