import Parser from "rss-parser";
import { FEED_SOURCES } from "@/lib/feeds";
import { Article, Category, RelatedArticle } from "@/lib/types";

const parser = new Parser({
  customFields: {
    item: [["media:content", "media:content", { keepArray: false }]],
  },
  headers: {
    "User-Agent": "SourceCheckNews/1.0 (news aggregator)",
  },
});

function extractImage(item: Record<string, unknown>): string | undefined {
  const media = item["media:content"] as Record<string, unknown> | undefined;
  if (media) {
    const attrs = (media.$ || media) as Record<string, string>;
    if (attrs?.url) return attrs.url;
  }
  const enclosure = item.enclosure as Record<string, string> | undefined;
  if (enclosure?.url && enclosure.type?.startsWith("image")) return enclosure.url;
  const content = (item["content:encoded"] || item.content || item.description || "") as string;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (match) return match[1];
  return undefined;
}

// --- TF-IDF clustering ---

const STOPWORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","has","have",
  "had","do","does","did","will","would","could","should","may","might",
  "can","shall","not","no","nor","so","if","then","than","that","this",
  "these","those","it","its","as","up","out","about","into","over",
  "after","before","says","said","how","what","when","where","who","why",
  "all","just","more","most","other","some","such","only","also","get",
  "got","make","made","take","come","go","see","know","think","like",
  "want","use","find","give","tell","work","call","try","ask","need",
  "new","now","way","back","even","here","there","many","much","well",
  "still","around","since","first","last","year","years","day","days",
  "week","report","reports","according","latest","breaking","update",
  "updates","news","today","top","been","being","through","very",
  "during","while","between","each","every","both","few","because",
]);

function stem(word: string): string {
  if (word.length <= 3) return word;
  return word
    .replace(/ies$/, "y")
    .replace(/ves$/, "f")
    .replace(/(ing|tion|sion|ment|ness|ous|ive|able|ible|ful|less|ated|ting)$/, "")
    .replace(/(?<=[a-z]{3})s$/, "")
    .replace(/(?<=[a-z]{3})ed$/, "")
    .replace(/(?<=[a-z]{3})er$/, "")
    .replace(/'s?$/, "");
}

function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const stemmed = words.map(stem).filter((w) => w.length > 2);

  const bigrams: string[] = [];
  for (let i = 0; i < stemmed.length - 1; i++) {
    bigrams.push(`${stemmed[i]}_${stemmed[i + 1]}`);
  }

  return [...stemmed, ...bigrams];
}

interface TfIdfVector {
  terms: Map<string, number>;
  norm: number;
}

function buildTfIdfVectors(articles: Article[]): TfIdfVector[] {
  const docs = articles.map((a) =>
    tokenize(`${a.title} ${a.title} ${a.title} ${a.description}`)
  );

  const df = new Map<string, number>();
  for (const doc of docs) {
    const unique = new Set(doc);
    for (const term of unique) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  const N = docs.length;

  return docs.map((doc) => {
    const tf = new Map<string, number>();
    for (const term of doc) {
      tf.set(term, (tf.get(term) || 0) + 1);
    }

    const terms = new Map<string, number>();
    let normSq = 0;

    for (const [term, count] of tf) {
      const termDf = df.get(term) || 1;
      const tfidf = (count / doc.length) * Math.log(N / termDf);
      if (tfidf > 0) {
        terms.set(term, tfidf);
        normSq += tfidf * tfidf;
      }
    }

    return { terms, norm: Math.sqrt(normSq) };
  });
}

function cosineSimilarity(a: TfIdfVector, b: TfIdfVector): number {
  if (a.norm === 0 || b.norm === 0) return 0;

  let dot = 0;
  const [smaller, larger] = a.terms.size <= b.terms.size ? [a, b] : [b, a];
  for (const [term, weight] of smaller.terms) {
    const otherWeight = larger.terms.get(term);
    if (otherWeight !== undefined) {
      dot += weight * otherWeight;
    }
  }

  return dot / (a.norm * b.norm);
}

const SIMILARITY_THRESHOLD = 0.35;
const TIME_WINDOW_HOURS = 48;
const MAX_MERGE_ITERATIONS = 10;

export function clusterArticles(articles: Article[]): void {
  if (articles.length === 0) return;

  const vectors = buildTfIdfVectors(articles);
  const timestamps = articles.map((a) => new Date(a.pubDate).getTime());

  const clusters: number[][] = [];

  for (let i = 0; i < articles.length; i++) {
    let bestCluster = -1;
    let bestSim = 0;

    for (let c = 0; c < clusters.length; c++) {
      const rep = clusters[c][0];
      const hoursDiff =
        Math.abs(timestamps[i] - timestamps[rep]) / (1000 * 60 * 60);
      if (hoursDiff > TIME_WINDOW_HOURS) continue;

      let totalSim = 0;
      let comparisons = 0;
      for (const j of clusters[c]) {
        if (articles[i].source === articles[j].source) continue;
        totalSim += cosineSimilarity(vectors[i], vectors[j]);
        comparisons++;
      }

      if (comparisons === 0) continue;
      const avgSim = totalSim / comparisons;

      if (avgSim > SIMILARITY_THRESHOLD && avgSim > bestSim) {
        bestSim = avgSim;
        bestCluster = c;
      }
    }

    if (bestCluster >= 0) {
      clusters[bestCluster].push(i);
    } else {
      clusters.push([i]);
    }
  }

  // Second pass: merge similar clusters (capped iterations)
  const MERGE_THRESHOLD = 0.28;
  let merged = true;
  let iterations = 0;
  while (merged && iterations < MAX_MERGE_ITERATIONS) {
    merged = false;
    iterations++;
    for (let a = 0; a < clusters.length; a++) {
      if (clusters[a].length === 0) continue;
      for (let b = a + 1; b < clusters.length; b++) {
        if (clusters[b].length === 0) continue;

        let maxSim = 0;
        const sampleA = clusters[a].slice(0, 5);
        const sampleB = clusters[b].slice(0, 5);
        for (const ia of sampleA) {
          for (const ib of sampleB) {
            if (articles[ia].source === articles[ib].source) continue;
            const sim = cosineSimilarity(vectors[ia], vectors[ib]);
            if (sim > maxSim) maxSim = sim;
          }
        }

        if (maxSim > MERGE_THRESHOLD) {
          clusters[a].push(...clusters[b]);
          clusters[b] = [];
          merged = true;
        }
      }
    }
  }

  const finalClusters = clusters.filter((c) => c.length > 0);

  for (const cluster of finalClusters) {
    const uniqueSources = [...new Set(cluster.map((i) => articles[i].source))];
    const score = Math.min(uniqueSources.length, 5);

    for (const i of cluster) {
      articles[i].echoScore = score;
      articles[i].echoSources = uniqueSources;

      const seen = new Set<string>();
      const related: RelatedArticle[] = [];
      for (const j of cluster) {
        if (j === i) continue;
        const a = articles[j];
        if (seen.has(a.source)) continue;
        seen.add(a.source);
        related.push({
          source: a.source,
          title: a.title,
          description: a.description.slice(0, 150),
          link: a.link,
          pubDate: a.pubDate,
        });
      }
      articles[i].relatedArticles = related;
    }
  }
}

function generateId(link: string, title: string): string {
  const str = link || title;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function fetchFeed(
  url: string,
  name: string,
  category: Category
): Promise<Article[]> {
  try {
    const feed = await withTimeout(parser.parseURL(url), 8000);
    return (feed.items || []).slice(0, 10).map((item) => ({
      id: generateId(item.link || "", item.title || ""),
      title: item.title || "Untitled",
      description: (item.contentSnippet || item.content || "").slice(0, 200),
      link: item.link || "",
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: name,
      category,
      imageUrl: extractImage(item as unknown as Record<string, unknown>),
      echoScore: 1,
      echoSources: [name],
      relatedArticles: [],
    }));
  } catch (error) {
    console.error(`Failed to fetch ${name} (${url}):`, error);
    return [];
  }
}

/**
 * Fetch all feeds, deduplicate, cluster, and return sorted articles.
 * This is the heavy operation that should be run on a cron schedule.
 */
export async function fetchAndClusterAll(category?: Category): Promise<Article[]> {
  const sources = category
    ? FEED_SOURCES.filter((s) => s.category === category)
    : FEED_SOURCES;

  const results = await Promise.allSettled(
    sources.map((s) => fetchFeed(s.url, s.name, s.category))
  );

  const allArticles: Article[] = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);

  // Deduplicate by link URL
  const seenLinks = new Map<string, number>();
  const articles: Article[] = [];
  for (const article of allArticles) {
    const key = article.link.replace(/\/$/, "").replace(/^https?:\/\/(www\.)?/, "");
    if (!key) continue;
    if (seenLinks.has(key)) continue;
    seenLinks.set(key, articles.length);
    articles.push(article);
  }

  // Deduplicate near-identical titles
  const titleMap = new Map<string, number>();
  const dedupedArticles: Article[] = [];
  for (const article of articles) {
    const normTitle = article.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    if (titleMap.has(normTitle)) continue;
    titleMap.set(normTitle, dedupedArticles.length);
    dedupedArticles.push(article);
  }

  dedupedArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  clusterArticles(dedupedArticles);

  return dedupedArticles;
}
