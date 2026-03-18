"use client";

import { useMemo, useState, useEffect } from "react";
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import HeatMapGrid from "./HeatMapGrid";
import TieredView from "./TieredView";
import { useViewPreference } from "@/hooks/useViewPreference";
import { useSettings } from "@/hooks/useSettings";
import SortControl, { SortOption } from "./SortControl";
import ViewToggle from "./ViewToggle";

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  const { viewMode, setViewMode } = useViewPreference();
  const { settings } = useSettings();
  const [sort, setSort] = useState<SortOption>("echo");
  const [sortInitialized, setSortInitialized] = useState(false);

  // Apply default sort from settings on first load
  useEffect(() => {
    if (!sortInitialized && settings.defaultSort) {
      setSort(settings.defaultSort);
      setSortInitialized(true);
    }
  }, [settings.defaultSort, sortInitialized]);

  // Filter by settings: min score + hidden categories
  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (a.echoScore < settings.minScore) return false;
      if (settings.hiddenCategories.includes(a.category)) return false;
      return true;
    });
  }, [articles, settings.minScore, settings.hiddenCategories]);

  const sorted = useMemo(() => {
    if (sort === "echo") {
      return [...filtered].sort((a, b) => {
        const diff = b.echoScore - a.echoScore;
        if (diff !== 0) return diff;
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      });
    }
    return filtered;
  }, [filtered, sort]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg">No articles found</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <SortControl value={sort} onChange={setSort} />
      </div>

      {sort === "tiered" ? (
        <TieredView
          articles={filtered}
          viewMode={viewMode}
        />
      ) : viewMode === "heatmap" ? (
        <HeatMapGrid articles={sorted} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {sorted.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      )}
    </>
  );
}
