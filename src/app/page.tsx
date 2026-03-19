"use client";

import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import BreakingNewsChecker from "@/components/BreakingNewsChecker";
import { useArticles } from "@/hooks/useArticles";

export default function HomePage() {
  const { articles, loading } = useArticles();

  return (
    <>
      <CategoryPills />
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
        Top Stories
      </h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <BreakingNewsChecker articles={articles} />
          <ArticleGrid articles={articles} />
        </>
      )}
    </>
  );
}
