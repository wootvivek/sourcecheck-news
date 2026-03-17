"use client";

import useSWR from "swr";
import { Article, Category } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useArticles(category?: Category) {
  const url = category ? `/api/feeds?category=${category}` : "/api/feeds";

  const { data, error, isLoading, mutate } = useSWR<Article[]>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000, // dedupe requests within 60s
    refreshInterval: 5 * 60_000, // auto-refresh every 5 min in background
    keepPreviousData: true, // show stale data while refreshing
  });

  return {
    articles: data ?? [],
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
