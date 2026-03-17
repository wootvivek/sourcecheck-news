"use client";

import { useParams } from "next/navigation";
import { CATEGORIES, Category } from "@/lib/types";
import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import { useArticles } from "@/hooks/useArticles";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as Category;
  const { articles, loading } = useArticles(slug);

  const categoryInfo = CATEGORIES.find((c) => c.slug === slug);

  return (
    <>
      <CategoryPills />
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
        {categoryInfo?.label || slug}
      </h1>
      {loading ? (
        <LoadingScreen />
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </>
  );
}
