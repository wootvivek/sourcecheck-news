"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useArticles } from "@/hooks/useArticles";
import { Article } from "@/lib/types";
import BiasSpectrum from "@/components/BiasSpectrum";
import LoadingScreen from "@/components/LoadingScreen";
import { getSourceBias } from "@/lib/bias";

interface StoryCluster {
  id: string;
  representativeTitle: string;
  sources: { source: string; title: string; link: string; pubDate: string; description: string; imageUrl?: string }[];
  echoScore: number;
  category: string;
  latestPubDate: string;
  imageUrl?: string;
}

function buildClusters(articles: Article[]): StoryCluster[] {
  // Group articles that share the same cluster (same echoSources set)
  const clusterMap = new Map<string, StoryCluster>();

  for (const article of articles) {
    if (article.echoScore <= 1) continue;

    // Use sorted source names as cluster key
    const key = [...article.echoSources].sort().join("|");

    if (!clusterMap.has(key)) {
      clusterMap.set(key, {
        id: key,
        representativeTitle: article.title,
        sources: [],
        echoScore: article.echoScore,
        category: article.category,
        latestPubDate: article.pubDate,
      });
    }

    const cluster = clusterMap.get(key)!;

    // Add the main article as a source
    if (!cluster.sources.find((s) => s.source === article.source)) {
      cluster.sources.push({
        source: article.source,
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        description: article.description,
        imageUrl: article.imageUrl,
      });
    }

    // Also pull in relatedArticles (dedup folds cluster members here)
    for (const rel of article.relatedArticles) {
      if (!cluster.sources.find((s) => s.source === rel.source)) {
        cluster.sources.push({
          source: rel.source,
          title: rel.title,
          link: rel.link,
          pubDate: rel.pubDate,
          description: rel.description,
        });
      }
    }

    // Use first available image
    if (!cluster.imageUrl && article.imageUrl) {
      cluster.imageUrl = article.imageUrl;
    }

    // Use the latest article's title as representative
    if (article.pubDate > cluster.latestPubDate) {
      cluster.latestPubDate = article.pubDate;
    }
  }

  return Array.from(clusterMap.values()).sort(
    (a, b) => b.echoScore - a.echoScore || new Date(b.latestPubDate).getTime() - new Date(a.latestPubDate).getTime()
  );
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
  2: "bg-amber-400",
  3: "bg-blue-400",
  4: "bg-green-400",
  5: "bg-red-500",
};

function ThumbnailImg({ src, alt }: { src?: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
        <span className="text-xl text-gray-300 dark:text-gray-600">&#9993;</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-20 h-20 rounded-lg object-cover shrink-0"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

export default function CatchUpPage() {
  const { articles, loading } = useArticles();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clusters = useMemo(() => buildClusters(articles), [articles]);
  const singleSourceCount = articles.filter((a) => a.echoScore <= 1).length;

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="sticky top-[57px] z-40 -mx-4 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
            Back to stories
          </Link>
        </div>
        <LoadingScreen />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* Sticky back bar */}
      <div className="sticky top-[57px] z-40 -mx-4 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
          Back to stories
        </Link>
      </div>

      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quick Catch-Up
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {clusters.length} verified stories from {articles.length} articles across all sources.
          {singleSourceCount > 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              {" "}({singleSourceCount} single-source stories hidden)
            </span>
          )}
        </p>
      </div>

      {clusters.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-lg">No multi-source stories found right now</p>
          <p className="text-sm mt-2">Check back later — more sources confirm stories over time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clusters.map((cluster) => {
            const isExpanded = expandedId === cluster.id;
            const sourceNames = cluster.sources.map((s) => s.source);
            const dotColor = SCORE_COLORS[cluster.echoScore] || "bg-gray-400";
            const badgeBg = {
              2: "bg-amber-500",
              3: "bg-blue-500",
              4: "bg-green-500",
              5: "bg-red-500",
            }[cluster.echoScore] || "bg-gray-500";

            return (
              <div
                key={cluster.id}
                className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cluster.id)}
                  className="w-full px-4 py-3.5 text-left flex items-start gap-3"
                >
                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <ThumbnailImg src={cluster.imageUrl} alt={cluster.representativeTitle} />
                    {/* Echo badge on thumbnail */}
                    <div className={`absolute -top-1.5 -left-1.5 ${badgeBg} text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800`}>
                      {cluster.echoScore}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {cluster.representativeTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeBg} text-white`}>
                        {cluster.echoScore} {cluster.echoScore === 1 ? "source" : "sources"}
                      </span>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {cluster.category}
                      </span>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {timeAgo(cluster.latestPubDate)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                      {sourceNames.join(" · ")}
                    </p>
                  </div>

                  {/* Expand arrow */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Bias spectrum */}
                    <div className="pt-4 pb-3">
                      <BiasSpectrum sources={sourceNames} />
                    </div>

                    {/* Each source's take */}
                    <div className="space-y-2 mt-2">
                      {cluster.sources.map((src, idx) => {
                        const bias = getSourceBias(src.source);
                        return (
                          <a
                            key={idx}
                            href={src.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                {src.source}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${bias.color} bg-gray-100 dark:bg-gray-700`}>
                                {bias.label}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {src.title}
                            </p>
                            {src.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {src.description}
                              </p>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
