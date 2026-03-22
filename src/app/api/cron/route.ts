import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { fetchAndClusterAll } from "@/lib/fetchAndCluster";
import { CATEGORIES } from "@/lib/types";

export const maxDuration = 60; // Allow up to 60s for cron execution

export async function GET(request: NextRequest) {
  // Verify cron secret — accept via header (Vercel cron) or query param (external cron services)
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    querySecret === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Starting feed fetch and clustering...");
    const startTime = Date.now();

    // Fetch and cluster all feeds
    const allArticles = await fetchAndClusterAll();

    // Store all articles + last refresh timestamp (2 hour TTL)
    await redis.set("feeds:all", JSON.stringify(allArticles), "EX", 7200);
    await redis.set("feeds:lastRefreshed", new Date().toISOString());

    // Store per-category slices (skip "local" — it's per-user, not pre-computed)
    for (const cat of CATEGORIES) {
      if (cat.slug === "local") continue;
      const catArticles = allArticles.filter((a) => a.category === cat.slug);
      await redis.set(`feeds:${cat.slug}`, JSON.stringify(catArticles), "EX", 7200);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[cron] Done. ${allArticles.length} articles in ${elapsed}s`);

    return NextResponse.json({
      success: true,
      articles: allArticles.length,
      elapsed: `${elapsed}s`,
    });
  } catch (error) {
    console.error("[cron] Failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
