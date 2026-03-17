"use client";

import { useState } from "react";
import { Article } from "@/lib/types";
import BiasSpectrum from "./BiasSpectrum";
import SourceMeter from "./SourceMeter";
import SourcesModal from "./SourcesModal";

interface ArticleCardProps {
  article: Article;
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
        className="group flex flex-col sm:flex-col flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
      >
        {/* Image with echo badge overlay */}
        <div className="relative aspect-[4/3] sm:aspect-video w-28 sm:w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
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
          {/* Echo badge — top left */}
          <div
            role="button"
            tabIndex={0}
            className={`absolute top-2 left-2 ${badgeBg} backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform shadow-lg`}
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
          {/* Time — top right */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-[10px] font-medium text-white">
              {timeAgo(article.pubDate)}
            </span>
          </div>
          {/* Bias strip — bottom of image (hidden on mobile) */}
          {article.echoScore > 1 && (
            <div
              role="button"
              tabIndex={0}
              className="hidden sm:block absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm px-3 py-1.5 cursor-pointer hover:bg-black/50 transition-colors"
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
              <BiasSpectrum sources={article.echoSources} compact />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-2.5 sm:p-4">
          <div className="mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {article.source}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
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
