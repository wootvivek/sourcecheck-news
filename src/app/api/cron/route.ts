import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchAndClusterAll } from "@/lib/fetchAndCluster";
import { CATEGORIES } from "@/lib/types";

export const maxDuration = 60; // Allow up to 60s for cron execution

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Starting feed fetch and clustering...");
    const startTime = Date.now();

    // Fetch and cluster all feeds
    const allArticles = await fetchAndClusterAll();

    // Store all articles
    await kv.set("feeds:all", JSON.stringify(allArticles), { ex: 900 }); // 15 min TTL

    // Store per-category slices
    for (const cat of CATEGORIES) {
      const catArticles = allArticles.filter((a) => a.category === cat.slug);
      await kv.set(`feeds:${cat.slug}`, JSON.stringify(catArticles), { ex: 900 });
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
