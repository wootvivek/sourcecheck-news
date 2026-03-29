"use client";

import useSWR from "swr";
import { Article, Category } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Pick the best representative article per cluster.
 * For clustered articles (echoScore >= 2), show only one card —
 * the one with the best image and longest description.
 * All others become relatedArticles on that card.
 */
function deduplicateClusters(articles: Article[]): Article[] {
  const clusterMap = new Map<string, Article[]>();

  for (const article of articles) {
    if (article.echoScore <= 1) continue;
    // Articles in the same cluster share the same sorted echoSources
    const key = [...article.echoSources].sort().join("|");
    if (!clusterMap.has(key)) clusterMap.set(key, []);
    clusterMap.get(key)!.push(article);
  }

  // Build a set of article IDs to hide (non-representative cluster members)
  const hideIds = new Set<string>();

  for (const [, members] of clusterMap) {
    if (members.length <= 1) continue;

    // Pick the best representative: prefer one with an image, then longest description
    const sorted = [...members].sort((a, b) => {
      const aImg = a.imageUrl ? 1 : 0;
      const bImg = b.imageUrl ? 1 : 0;
      if (bImg !== aImg) return bImg - aImg;
      return b.description.length - a.description.length;
    });

    const representative = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      hideIds.add(sorted[i].id);
    }

    // Ensure the representative has all related articles from the cluster
    const existingLinks = new Set(representative.relatedArticles.map((r) => r.link));
    for (const member of sorted.slice(1)) {
      if (!existingLinks.has(member.link)) {
        representative.relatedArticles.push({
          source: member.source,
          title: member.title,
          description: member.description.slice(0, 150),
          link: member.link,
          pubDate: member.pubDate,
        });
        existingLinks.add(member.link);
      }
    }
  }

  return articles.filter((a) => !hideIds.has(a.id));
}

export function useArticles(
  category?: Category,
  city?: string,
  fallbackData?: Article[] | null
) {
  const url = category === "local"
    ? city
      ? `/api/feeds?category=local&city=${encodeURIComponent(city)}`
      : null // Don't fetch until city is available
    : category
      ? `/api/feeds?category=${category}`
      : "/api/feeds";

  const { data, error, isLoading, isValidating, mutate } = useSWR<Article[]>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000, // dedupe requests within 60s
    refreshInterval: 5 * 60_000, // auto-refresh every 5 min in background
    keepPreviousData: true, // show stale data while refreshing
    fallbackData: fallbackData ?? undefined,
  });

  const articles = data ? deduplicateClusters(data) : [];

  return {
    articles,
    loading: isLoading,
    refreshing: isValidating && !isLoading,
    error,
    refresh: mutate,
  };
}
