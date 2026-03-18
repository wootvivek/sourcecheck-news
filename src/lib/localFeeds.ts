import Parser from "rss-parser";
import { Article } from "@/lib/types";
import { fetchFeed, clusterArticles } from "@/lib/fetchAndCluster";

interface LocalFeedSource {
  url: string;
  name: string;
}

const localParser = new Parser({
  customFields: {
    item: [["News:Source", "newsSource"]],
  },
  headers: {
    "User-Agent": "SourceCheckNews/1.0 (news aggregator)",
  },
});

/**
 * Try to extract og:image from a page's HTML <head>.
 * Uses a partial fetch (only first ~24KB) to avoid downloading full pages.
 */
async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SourceCheckNews/1.0 (news aggregator)" },
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (!res.ok || !res.body) return undefined;

    // Read just enough to find the og:image tag (first ~24KB)
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    const MAX_BYTES = 24576;

    while (totalBytes < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      totalBytes += value.length;
    }
    controller.abort(); // stop downloading rest of page

    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0))
    );

    // Try og:image first, then twitter:image
    const ogMatch =
      text.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      text.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );
    if (ogMatch?.[1]) return ogMatch[1];

    const twMatch =
      text.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      text.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
      );
    if (twMatch?.[1]) return twMatch[1];

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * For articles missing images, try to fetch og:image from article URLs.
 * Processes up to `limit` articles concurrently with a timeout.
 */
async function enrichImages(articles: Article[], limit = 12): Promise<void> {
  const missing = articles.filter((a) => !a.imageUrl).slice(0, limit);
  if (missing.length === 0) return;

  await Promise.allSettled(
    missing.map(async (article) => {
      const img = await fetchOgImage(article.link);
      if (img) article.imageUrl = img;
    })
  );
}

/**
 * Extract the real article URL from a Bing News redirect link.
 * Bing links look like: http://www.bing.com/news/apiclick.aspx?...&url=https%3a%2f%2f...&...
 */
function extractBingUrl(bingLink: string): string {
  try {
    const url = new URL(bingLink);
    const realUrl = url.searchParams.get("url");
    if (realUrl) return realUrl;
  } catch {
    // not a valid URL
  }
  return bingLink;
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

/**
 * Fetch local news from Bing News RSS for a city.
 * Returns articles with real URLs (not Bing redirects) and source names.
 */
async function fetchBingNews(city: string): Promise<Article[]> {
  const query = encodeURIComponent(`${city} local news`);
  const url = `https://www.bing.com/news/search?q=${query}&format=rss`;

  try {
    const feed = await localParser.parseURL(url);
    return (feed.items || []).slice(0, 15).map((item) => {
      const realLink = extractBingUrl(item.link || "");
      const source =
        ((item as unknown as Record<string, unknown>).newsSource as string) ||
        "Bing News";
      return {
        id: generateId(realLink, item.title || ""),
        title: item.title || "Untitled",
        description: (item.contentSnippet || item.content || "").slice(0, 200),
        link: realLink,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source,
        category: "local" as const,
        imageUrl: undefined,
        echoScore: 1,
        echoSources: [source],
        relatedArticles: [],
      };
    });
  } catch (error) {
    console.error(`Failed to fetch Bing News for ${city}:`, error);
    return [];
  }
}

// Curated RSS feeds for major US metros
const METRO_FEEDS: Record<string, LocalFeedSource[]> = {
  "new york": [
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml", name: "NYT Metro" },
    { url: "https://gothamist.com/feed", name: "Gothamist" },
    { url: "https://patch.com/new-york/new-york-city/rss.xml", name: "Patch NYC" },
  ],
  "los angeles": [
    { url: "https://www.latimes.com/local/rss2.0.xml", name: "LA Times Local" },
    { url: "https://laist.com/feed", name: "LAist" },
    { url: "https://patch.com/california/los-angeles/rss.xml", name: "Patch LA" },
  ],
  "chicago": [
    { url: "https://www.chicagotribune.com/arcio/rss/category/news/breaking/", name: "Chicago Tribune" },
    { url: "https://blockclubchicago.org/feed/", name: "Block Club Chicago" },
  ],
  "houston": [
    { url: "https://www.houstonchronicle.com/rss/feed/Breaking-News-702.php", name: "Houston Chronicle" },
  ],
  "phoenix": [
    { url: "https://www.azcentral.com/arcio/rss/category/news/", name: "Arizona Republic" },
  ],
  "philadelphia": [
    { url: "https://www.inquirer.com/arcio/rss/category/news/", name: "Philadelphia Inquirer" },
  ],
  "san antonio": [
    { url: "https://www.expressnews.com/rss/feed/Breaking-News-702.php", name: "San Antonio Express-News" },
  ],
  "san diego": [
    { url: "https://www.sandiegouniontribune.com/arcio/rss/category/news/", name: "San Diego Union-Tribune" },
  ],
  "dallas": [
    { url: "https://www.dallasnews.com/arcio/rss/category/news/", name: "Dallas Morning News" },
  ],
  "san francisco": [
    { url: "https://www.sfchronicle.com/rss/feed/Breaking-News-702.php", name: "SF Chronicle" },
    { url: "https://www.sfgate.com/rss/feed/SFGATE-Homepage-702.php", name: "SFGate" },
  ],
  "austin": [
    { url: "https://www.statesman.com/arcio/rss/category/news/", name: "Austin American-Statesman" },
  ],
  "seattle": [
    { url: "https://www.seattletimes.com/feed/", name: "Seattle Times" },
  ],
  "denver": [
    { url: "https://www.denverpost.com/feed/", name: "Denver Post" },
  ],
  "atlanta": [
    { url: "https://www.ajc.com/arcio/rss/category/news/", name: "Atlanta Journal-Constitution" },
  ],
  "miami": [
    { url: "https://www.miamiherald.com/latest-news/article1928025.ece/RSS/ALTERNATES/rss", name: "Miami Herald" },
  ],
  "boston": [
    { url: "https://www.bostonglobe.com/arcio/rss/category/metro/", name: "Boston Globe" },
  ],
  "washington": [
    { url: "https://www.washingtonpost.com/local/?outputType=rss", name: "WaPo Local" },
  ],
  "detroit": [
    { url: "https://www.freep.com/arcio/rss/", name: "Detroit Free Press" },
  ],
  "minneapolis": [
    { url: "https://www.startribune.com/local/index.rss2", name: "Star Tribune" },
  ],
  "portland": [
    { url: "https://www.oregonlive.com/arc/outboundfeeds/rss/category/portland/", name: "The Oregonian" },
  ],
};

// Aliases for metro matching (city names that map to metro keys)
const METRO_ALIASES: Record<string, string> = {
  nyc: "new york",
  manhattan: "new york",
  brooklyn: "new york",
  queens: "new york",
  bronx: "new york",
  la: "los angeles",
  sf: "san francisco",
  "san fran": "san francisco",
  dc: "washington",
  "washington dc": "washington",
  "washington d.c.": "washington",
  dfw: "dallas",
  "fort worth": "dallas",
  philly: "philadelphia",
  mpls: "minneapolis",
  "st paul": "minneapolis",
  "saint paul": "minneapolis",
};

/**
 * Match a city string to curated metro feeds.
 */
function matchMetro(city: string): LocalFeedSource[] {
  const normalized = city.toLowerCase().trim();

  if (METRO_FEEDS[normalized]) return METRO_FEEDS[normalized];
  if (METRO_ALIASES[normalized])
    return METRO_FEEDS[METRO_ALIASES[normalized]] || [];

  for (const [metro, feeds] of Object.entries(METRO_FEEDS)) {
    if (normalized.includes(metro) || metro.includes(normalized)) {
      return feeds;
    }
  }

  return [];
}

/**
 * Fetch local news from Google News RSS for a city.
 * Note: Links are Google redirects (not real URLs) and have no images,
 * but the feed is more comprehensive than Bing.
 */
async function fetchGoogleNews(city: string): Promise<Article[]> {
  const query = encodeURIComponent(`${city} local news`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const articles = await fetchFeed(url, `Google News (${city})`, "local");

    // Google News titles have format "Headline - Source Name"
    // Extract real source name and clean up title
    for (const article of articles) {
      if (article.source.startsWith("Google News")) {
        const dashIdx = article.title.lastIndexOf(" - ");
        if (dashIdx > 0) {
          const realSource = article.title.slice(dashIdx + 3).trim();
          article.source = realSource;
          article.title = article.title.slice(0, dashIdx).trim();
          article.echoSources = [realSource];
        }
      }
    }

    return articles;
  } catch (error) {
    console.error(`Failed to fetch Google News for ${city}:`, error);
    return [];
  }
}

/**
 * Fetch local news for a city using hybrid approach:
 * 1. Bing News RSS (gives real URLs for og:image scraping)
 * 2. Google News RSS (more comprehensive coverage, but no images)
 * 3. Curated metro feeds if city matches a known metro
 * Then deduplicate, cluster, and enrich images.
 */
export async function fetchLocalNews(city: string): Promise<Article[]> {
  const feedPromises: Promise<Article[]>[] = [];

  // Bing News RSS — gives real article URLs we can scrape og:image from
  feedPromises.push(fetchBingNews(city));

  // Google News RSS — more comprehensive but links are Google redirects (no images)
  feedPromises.push(fetchGoogleNews(city));

  // Add curated metro feeds if available
  const metroFeeds = matchMetro(city);
  for (const feed of metroFeeds) {
    feedPromises.push(fetchFeed(feed.url, feed.name, "local"));
  }

  const results = await Promise.allSettled(feedPromises);
  const allArticles: Article[] = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value);

  // Deduplicate by link URL
  const seenLinks = new Map<string, number>();
  const articles: Article[] = [];
  for (const article of allArticles) {
    const key = article.link
      .replace(/\/$/, "")
      .replace(/^https?:\/\/(www\.)?/, "");
    if (!key) continue;
    if (seenLinks.has(key)) continue;
    seenLinks.set(key, articles.length);
    articles.push(article);
  }

  // Deduplicate near-identical titles
  const titleMap = new Map<string, number>();
  const dedupedArticles: Article[] = [];
  for (const article of articles) {
    const normTitle = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (titleMap.has(normTitle)) continue;
    titleMap.set(normTitle, dedupedArticles.length);
    dedupedArticles.push(article);
  }

  // Sort by date
  dedupedArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Cluster local articles
  clusterArticles(dedupedArticles);

  // Enrich missing images by scraping og:image from real article URLs
  await enrichImages(dedupedArticles, 12);

  return dedupedArticles;
}
