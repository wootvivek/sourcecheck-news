import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchAndClusterAll } from "@/lib/fetchAndCluster";
import { Category } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as Category | null;
  const kvKey = category ? `feeds:${category}` : "feeds:all";

  // Try reading from KV cache first (instant)
  try {
    const cached = await kv.get<string>(kvKey);
    if (cached) {
      // cached is already parsed by @vercel/kv if it was stored as JSON string
      const articles = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json(articles, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Source": "kv-cache",
        },
      });
    }
  } catch (e) {
    // KV not available (local dev or not configured) — fall through to live fetch
    console.log("[feeds] KV read failed, falling back to live fetch:", e);
  }

  // Fallback: live fetch + cluster (slow path, only on cold start or KV unavailable)
  const articles = await fetchAndClusterAll(category || undefined);

  // Try to store in KV for next request
  try {
    await kv.set(kvKey, JSON.stringify(articles), { ex: 900 });
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
