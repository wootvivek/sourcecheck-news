"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Article } from "@/lib/types";
import ArticleGrid from "@/components/ArticleGrid";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setArticles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/feeds")
      .then((res) => res.json())
      .then((data: Article[]) => {
        const q = query.toLowerCase();
        const filtered = data.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.source.toLowerCase().includes(q)
        );
        setArticles(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
        Search Results
      </h1>
      {query && (
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Showing results for &ldquo;{query}&rdquo;
        </p>
      )}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
