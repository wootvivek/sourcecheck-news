import { NextResponse } from "next/server";
import { getOpinionsFromKV, getOpinionsGeneratedAt } from "@/lib/kvCache";

export async function GET() {
  try {
    const [opinions, generatedAt] = await Promise.all([
      getOpinionsFromKV(),
      getOpinionsGeneratedAt(),
    ]);

    return NextResponse.json(
      { opinions: opinions || [], generatedAt },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[api/opinions] Failed:", error);
    return NextResponse.json(
      { opinions: [], generatedAt: null },
      { status: 500 }
    );
  }
}
