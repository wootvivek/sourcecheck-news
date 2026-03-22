import { getArticlesFromKV } from "@/lib/kvCache";
import CategoryContent from "@/components/CategoryContent";
import { Category } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slug as Category;

  // Local news is per-user (needs city), so no server-side prefetch
  const initialArticles =
    category === "local" ? null : await getArticlesFromKV(category);

  return <CategoryContent slug={category} initialArticles={initialArticles} />;
}
