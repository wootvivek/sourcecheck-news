import { kv } from "@vercel/kv";
import { Article, Category } from "@/lib/types";

/**
 * Read articles from Vercel KV cache.
 * Returns null if cache is empty or KV is unavailable.
 */
export async function getArticlesFromKV(
  category?: Category
): Promise<Article[] | null> {
  const kvKey = category ? `feeds:${category}` : "feeds:all";

  try {
    const cached = await kv.get<string>(kvKey);
    if (cached) {
      const articles =
        typeof cached === "string" ? JSON.parse(cached) : cached;
      return articles as Article[];
    }
    return null;
  } catch (e) {
    console.log("[kvCache] KV read failed:", e);
    return null;
  }
}
