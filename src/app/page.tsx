import { getArticlesFromKV } from "@/lib/kvCache";
import HomeContent from "@/components/HomeContent";

// Revalidate every 5 minutes so the server always has fresh KV data
// This means users get instant articles from the server (no loading screen)
// and SWR refreshes in the background for live updates
export const revalidate = 300;

export default async function HomePage() {
  const articles = await getArticlesFromKV();
  return <HomeContent initialArticles={articles} />;
}
