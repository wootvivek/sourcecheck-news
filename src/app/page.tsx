import { getArticlesFromKV } from "@/lib/kvCache";
import HomeContent from "@/components/HomeContent";

export default async function HomePage() {
  const articles = await getArticlesFromKV();
  return <HomeContent initialArticles={articles} />;
}
