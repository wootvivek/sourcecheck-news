import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchAndClusterAll } from "@/lib/fetchAndCluster";
import { fetchLocalNews } from "@/lib/localFeeds";
import { getArticlesFromKV } from "@/lib/kvCache";
import { Category } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as Category | null;

  // Local news: per-user, requires city param, no KV cache
  if (category === "local") {
    const city = searchParams.get("city");
    if (!city) {
      return NextResponse.json(
        { error: "city parameter required for local news" },
        { status: 400 }
      );
    }

    const articles = await fetchLocalNews(city);
    return NextResponse.json(articles, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
        "X-Source": "live-fetch-local",
      },
    });
  }

  // Try reading from KV cache first (instant)
  const cached = await getArticlesFromKV(category || undefined);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Source": "kv-cache",
      },
    });
  }

  // Fallback: live fetch + cluster (slow path, only on cold start or KV unavailable)
  const articles = await fetchAndClusterAll(category || undefined);

  // Store in KV for next request (2 hour TTL) + update lastRefreshed
  try {
    const kvKey = category ? `feeds:${category}` : "feeds:all";
    await Promise.all([
      kv.set(kvKey, JSON.stringify(articles), { ex: 7200 }),
      kv.set("feeds:lastRefreshed", new Date().toISOString()),
    ]);
  } catch {
    // KV not available — that's fine
  }

  return NextResponse.json(articles, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      "X-Source": "live-fetch",
    },
  });
}
