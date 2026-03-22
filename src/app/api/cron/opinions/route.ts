import { NextRequest, NextResponse } from "next/server";
import { generateAllOpinions } from "@/lib/generateOpinions";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    querySecret === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    console.log("[cron/opinions] Starting opinion generation...");
    const startTime = Date.now();

    const opinions = await generateAllOpinions();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (opinions) {
      console.log(`[cron/opinions] Generated ${opinions.length} opinions in ${elapsed}s`);
      return NextResponse.json({
        success: true,
        opinions: opinions.length,
        headlines: opinions.map((o) => o.headline),
        elapsed: `${elapsed}s`,
      });
    } else {
      console.log(`[cron/opinions] Skipped (articles unchanged or insufficient)`);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Articles unchanged or insufficient data",
        elapsed: `${elapsed}s`,
      });
    }
  } catch (error) {
    console.error("[cron/opinions] Failed:", error);
    return NextResponse.json(
      { error: "Opinion generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
