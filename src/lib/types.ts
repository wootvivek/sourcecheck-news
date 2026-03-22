export interface RelatedArticle {
  source: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: Category;
  imageUrl?: string;
  echoScore: number;
  echoSources: string[];
  relatedArticles: RelatedArticle[];
}

export type Category =
  | "world"
  | "tech"
  | "business"
  | "sports"
  | "science"
  | "entertainment"
  | "health"
  | "politics"
  | "opinion"
  | "local";

export interface CategoryInfo {
  slug: Category;
  label: string;
}

export interface OpinionSourceRef {
  title: string;
  source: string;
  link: string;
}

export interface OpinionPiece {
  id: string;
  headline: string;
  summary: string;
  content: string;
  category: Category;
  confidence: number; // 0-100, prediction confidence percentage
  sourceArticles: OpinionSourceRef[];
  generatedAt: string;
}

export type ViewMode = "grid" | "heatmap";

export const CATEGORY_COLORS: Record<Category, string> = {
  world: "border-l-blue-500",
  politics: "border-l-red-500",
  tech: "border-l-purple-500",
  business: "border-l-green-500",
  health: "border-l-pink-500",
  sports: "border-l-orange-500",
  science: "border-l-cyan-500",
  entertainment: "border-l-yellow-500",
  opinion: "border-l-gray-500",
  local: "border-l-emerald-500",
};

export const CATEGORIES: CategoryInfo[] = [
  { slug: "local", label: "Local" },
  { slug: "world", label: "World" },
  { slug: "politics", label: "Politics" },
  { slug: "tech", label: "Tech" },
  { slug: "business", label: "Business" },
  { slug: "health", label: "Health" },
  { slug: "sports", label: "Sports" },
  { slug: "science", label: "Science" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "opinion", label: "Opinion" },
];
