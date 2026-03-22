import redis from "@/lib/redis";
import { Article, Category, OpinionPiece } from "@/lib/types";

/**
 * Read articles from Redis cache.
 * Returns null if cache is empty or Redis is unavailable.
 */
export async function getArticlesFromKV(
  category?: Category
): Promise<Article[] | null> {
  const kvKey = category ? `feeds:${category}` : "feeds:all";

  try {
    const cached = await redis.get(kvKey);
    if (cached) {
      return JSON.parse(cached) as Article[];
    }
    return null;
  } catch (e) {
    console.log("[kvCache] Redis read failed:", e);
    return null;
  }
}

/**
 * Get the timestamp of the last successful cron refresh.
 */
export async function getLastRefreshed(): Promise<string | null> {
  try {
    return await redis.get("feeds:lastRefreshed");
  } catch (e) {
    console.log("[kvCache] Redis lastRefreshed read failed:", e);
    return null;
  }
}

/**
 * Read AI opinion pieces from Redis cache.
 */
export async function getOpinionsFromKV(): Promise<OpinionPiece[] | null> {
  try {
    const cached = await redis.get("opinions:current");
    if (cached) return JSON.parse(cached) as OpinionPiece[];
    return null;
  } catch (e) {
    console.log("[kvCache] Redis opinions read failed:", e);
    return null;
  }
}

/**
 * Get the timestamp of the last opinion generation.
 */
export async function getOpinionsGeneratedAt(): Promise<string | null> {
  try {
    return await redis.get("opinions:generatedAt");
  } catch {
    return null;
  }
}
