"use client";

import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import BreakingNewsChecker from "@/components/BreakingNewsChecker";
import NotificationBanner from "@/components/NotificationBanner";
import { useArticles } from "@/hooks/useArticles";
import { Article } from "@/lib/types";

interface HomeContentProps {
  initialArticles: Article[] | null;
}

export default function HomeContent({ initialArticles }: HomeContentProps) {
  const { articles, loading } = useArticles(
    undefined,
    undefined,
    initialArticles
  );

  return (
    <>
      <CategoryPills />
      <NotificationBanner />
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
