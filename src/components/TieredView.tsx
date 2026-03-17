"use client";

import { useMemo } from "react";
import { Article, ViewMode } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import HeatMapGrid from "./HeatMapGrid";

interface TieredViewProps {
  articles: Article[];
  viewMode: ViewMode;
}

interface TierConfig {
  label: string;
  emoji: string;
  filter: (a: Article) => boolean;
}

const TIERS: TierConfig[] = [
  { label: "Major Stories", emoji: "\uD83D\uDD25", filter: (a) => a.echoScore >= 4 },
  { label: "Developing", emoji: "\u26A1", filter: (a) => a.echoScore >= 2 && a.echoScore <= 3 },
  { label: "Single Source", emoji: "\uD83D\uDD0D", filter: (a) => a.echoScore <= 1 },
];

export default function TieredView({
  articles,
  viewMode,
}: TieredViewProps) {
  const tiers = useMemo(() => {
    return TIERS.map((tier) => ({
      ...tier,
      articles: articles
        .filter(tier.filter)
        .sort((a, b) => {
          const diff = b.echoScore - a.echoScore;
          if (diff !== 0) return diff;
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        }),
    }));
  }, [articles]);

  return (
    <div className="space-y-8">
      {tiers.map((tier) => {
        if (tier.articles.length === 0) return null;
        return (
          <section key={tier.label}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {tier.label}
              </h2>
              <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {tier.articles.length}
              </span>
            </div>

            {viewMode === "heatmap" ? (
              <HeatMapGrid articles={tier.articles} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tier.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
