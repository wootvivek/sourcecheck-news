import { getOpenAI } from "@/lib/openai";
import redis from "@/lib/redis";
import { Article, OpinionPiece, OpinionSourceRef } from "@/lib/types";
import { SOURCE_BIAS, getBiasLabel } from "@/lib/bias";
import crypto from "crypto";

// ── Change detection ──────────────────────────────────────────────

function computeArticleHash(articles: Article[]): string {
  const top = articles
    .sort((a, b) => b.echoScore - a.echoScore)
    .slice(0, 50)
    .map((a) => a.title)
    .join("|");
  return crypto.createHash("md5").update(top).digest("hex");
}

// ── Step 1: Pick top 3 stories ────────────────────────────────────

interface SelectedStory {
  articleIndex: number;
  category: string;
  reasoning: string;
}

async function selectTopStories(articles: Article[]): Promise<SelectedStory[]> {
  // Filter to well-corroborated stories only
  const candidates = articles
    .filter((a) => a.echoScore >= 3)
    .slice(0, 40); // Limit context size

  if (candidates.length < 3) {
    // Fallback: use top 3 by echoScore from all articles
    const fallback = articles
      .sort((a, b) => b.echoScore - a.echoScore)
      .slice(0, 3);
    return fallback.map((a, i) => ({
      articleIndex: articles.indexOf(a),
      category: a.category,
      reasoning: "Top story by source count",
    }));
  }

  const summaries = candidates.map((a, i) => ({
    index: articles.indexOf(a),
    title: a.title,
    description: a.description?.slice(0, 150) || "",
    category: a.category,
    echoScore: a.echoScore,
    sources: a.echoSources.join(", "),
  }));

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior editorial AI for SourceCheck.News, a news aggregator tracking 196+ sources.
Your job: pick the 3 most important, interesting, and impactful stories from today's news for a general audience.

Rules:
- Choose stories from AT LEAST 2 different categories (don't pick 3 politics stories)
- Prefer stories covered by sources across the political spectrum
- Prefer stories with high echo scores (more independent sources = bigger story)
- Pick stories that would spark thoughtful analysis, not just breaking news updates
- One pick can be a "sleeper" — important but underreported

Respond with JSON: { "selections": [ { "articleIndex": <number from the list>, "category": "<string>", "reasoning": "<1 sentence>" } ] }
Pick exactly 3.`,
      },
      {
        role: "user",
        content: `Here are today's top stories:\n\n${JSON.stringify(summaries, null, 2)}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty GPT-4o response for story selection");

  const parsed = JSON.parse(content);
  return parsed.selections as SelectedStory[];
}

// ── Step 2: Generate opinion piece ────────────────────────────────

async function generateOpinionPiece(
  article: Article,
  allArticles: Article[]
): Promise<OpinionPiece | null> {
  // Gather all articles in this cluster
  const clusterArticles: { source: string; title: string; description: string; link: string; biasLabel: string }[] = [];

  // Add the main article
  const mainBias = SOURCE_BIAS[article.source] ?? 0;
  clusterArticles.push({
    source: article.source,
    title: article.title,
    description: article.description?.slice(0, 300) || "",
    link: article.link,
    biasLabel: getBiasLabel(mainBias).label,
  });

  // Add related articles
  for (const related of article.relatedArticles.slice(0, 8)) {
    const bias = SOURCE_BIAS[related.source] ?? 0;
    clusterArticles.push({
      source: related.source,
      title: related.title,
      description: related.description?.slice(0, 300) || "",
      link: related.link,
      biasLabel: getBiasLabel(bias).label,
    });
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a thoughtful, balanced AI columnist for SourceCheck.News.
Write a ~900-word opinion/analysis piece about the story described below.

Your piece MUST include these sections (use markdown ## headers):

## [Your compelling headline]
A 1-2 sentence hook that draws the reader in.

### What's Happening
Brief factual summary of the story (2-3 paragraphs).

### How It's Being Framed
Analyze how different sources with different political leanings are covering this story. Reference specific sources by name and note their bias rating. Highlight what each side emphasizes or omits.

### The Bigger Picture
Provide historical context. Reference relevant past events, trends, or patterns. Explain why this story matters beyond today's headlines.

### Our Take
Present a balanced, nuanced opinion. Acknowledge the strongest arguments from multiple perspectives. Identify what's missing from the coverage. End with a thought-provoking question or observation.

Style guidelines:
- Write in an engaging, accessible style — like a smart friend explaining the news
- Avoid jargon; be specific over vague
- Use markdown formatting (**bold**, lists) for readability
- Do NOT use AI cliches ("In today's rapidly evolving...", "It's worth noting...", "In conclusion...")
- Be honest about uncertainty — say "it's unclear" when it is
- Do NOT start the content with the headline again — the headline is separate

Respond with JSON: { "headline": "compelling headline", "summary": "1-2 sentence hook for the card", "content": "full markdown body starting with ### What's Happening" }`,
      },
      {
        role: "user",
        content: `Story category: ${article.category}
Echo Score: ${article.echoScore} sources covering this story

Sources covering this story:
${clusterArticles.map((a) => `- [${a.source}] (Bias: ${a.biasLabel}) — "${a.title}"\n  ${a.description}`).join("\n\n")}

Write your analysis piece.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    console.error("[opinions] Empty GPT-4o response for opinion generation");
    return null;
  }

  try {
    const parsed = JSON.parse(content);
    const sourceRefs: OpinionSourceRef[] = clusterArticles.map((a) => ({
      title: a.title,
      source: a.source,
      link: a.link,
    }));

    const id = article.id || crypto.createHash("md5").update(article.title).digest("hex").slice(0, 8);

    return {
      id,
      headline: parsed.headline,
      summary: parsed.summary,
      content: parsed.content,
      category: article.category,
      sourceArticles: sourceRefs,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("[opinions] Failed to parse opinion JSON:", e);
    return null;
  }
}

// ── Orchestrator ──────────────────────────────────────────────────

export async function generateAllOpinions(): Promise<OpinionPiece[] | null> {
  // 1. Read articles from Redis
  const cached = await redis.get("feeds:all");
  if (!cached) {
    console.log("[opinions] No articles in Redis, skipping generation");
    return null;
  }

  const articles: Article[] = JSON.parse(cached);
  if (articles.length < 10) {
    console.log("[opinions] Too few articles (<10), skipping generation");
    return null;
  }

  // 2. Check if articles have changed
  const currentHash = computeArticleHash(articles);
  const storedHash = await redis.get("opinions:articleHash");
  if (storedHash === currentHash) {
    console.log("[opinions] Articles unchanged, skipping generation");
    return null;
  }

  // 3. Pick top 3 stories
  console.log("[opinions] Selecting top 3 stories...");
  const selections = await selectTopStories(articles);

  // 4. Generate opinion for each (sequentially to manage rate limits)
  const opinions: OpinionPiece[] = [];
  for (const selection of selections) {
    const article = articles[selection.articleIndex];
    if (!article) {
      console.warn("[opinions] Invalid article index:", selection.articleIndex);
      continue;
    }

    console.log(`[opinions] Generating opinion for: ${article.title.slice(0, 60)}...`);
    const opinion = await generateOpinionPiece(article, articles);
    if (opinion) {
      opinions.push(opinion);
    }
  }

  if (opinions.length === 0) {
    console.error("[opinions] All opinion generations failed");
    return null;
  }

  // 5. Store in Redis (6 hour TTL)
  const TTL = 21600;
  await redis.set("opinions:current", JSON.stringify(opinions), "EX", TTL);
  await redis.set("opinions:generatedAt", new Date().toISOString(), "EX", TTL);
  await redis.set("opinions:articleHash", currentHash, "EX", TTL);

  console.log(`[opinions] Stored ${opinions.length} opinion pieces`);
  return opinions;
}
