"use client";

import { useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";
import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import { SOURCE_BIAS } from "@/lib/bias";

export default function QuietCornerPage() {
  const { articles, loading } = useArticles();

  const quietStories = useMemo(() => {
    return articles
      .filter((a) => a.echoScore <= 1 && a.source in SOURCE_BIAS)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [articles]);

  return (
    <>
      <CategoryPills />
      <h1 className="text-2xl font-bold mt-6 mb-1 text-gray-900 dark:text-white">
        Quiet Corner
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Single-source stories from reputable outlets — hidden gems the mainstream might be missing.
      </p>
      {loading ? (
        <LoadingScreen />
      ) : (
        <ArticleGrid articles={quietStories} />
      )}
    </>
  );
}
