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

const TARGET_CATEGORIES = ["world", "local", "tech"] as const;

async function selectTopStories(articles: Article[]): Promise<SelectedStory[]> {
  // Pick the top story from each target category: World, Local, Tech
  const selections: SelectedStory[] = [];

  for (const cat of TARGET_CATEGORIES) {
    // Get candidates for this category, sorted by echoScore
    const catArticles = articles
      .filter((a) => a.category === cat && a.echoScore >= 2)
      .sort((a, b) => b.echoScore - a.echoScore);

    if (catArticles.length === 0) continue;

    // Send top 10 from this category to GPT-4o to pick the most interesting one
    const candidates = catArticles.slice(0, 10);
    const summaries = candidates.map((a) => ({
      index: articles.indexOf(a),
      title: a.title,
      description: a.description?.slice(0, 150) || "",
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
          content: `You are a senior editorial AI for SourceCheck.News. Pick the single most interesting and impactful ${cat.toUpperCase()} story from the list below — the one that would make the best analytical opinion piece.

Prefer stories with high echo scores, wide source coverage, and potential for historical depth and future prediction.

Respond with JSON: { "articleIndex": <number from the list>, "reasoning": "<1 sentence>" }`,
        },
        {
          role: "user",
          content: JSON.stringify(summaries, null, 2),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) continue;

    try {
      const parsed = JSON.parse(content);
      selections.push({
        articleIndex: parsed.articleIndex,
        category: cat,
        reasoning: parsed.reasoning || "Top story",
      });
    } catch {
      // Fallback: just use the highest echoScore article
      selections.push({
        articleIndex: articles.indexOf(catArticles[0]),
        category: cat,
        reasoning: "Top story by source count",
      });
    }
  }

  // Fallback if we got fewer than 3 (e.g., no local articles)
  if (selections.length < 3) {
    const usedIndices = new Set(selections.map((s) => s.articleIndex));
    const remaining = articles
      .filter((a) => !usedIndices.has(articles.indexOf(a)) && a.echoScore >= 3)
      .sort((a, b) => b.echoScore - a.echoScore);

    for (const a of remaining) {
      if (selections.length >= 3) break;
      selections.push({
        articleIndex: articles.indexOf(a),
        category: a.category,
        reasoning: "Fallback: top story by source count",
      });
    }
  }

  return selections;
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
        content: `You are a sharp, opinionated AI analyst for SourceCheck.News. You don't hedge — you make calls.

Write a SHORT, punchy analysis (~300 words, TWO paragraphs only) about the story below.

**Paragraph 1 — Historical Depth:**
Ground this story in history. What past events, patterns, or precedents does this echo? Be specific — name dates, people, outcomes. Draw a direct line from history to now. Show the reader something they wouldn't get from skimming headlines.

**Paragraph 2 — Prediction & Odds:**
Make a bold, specific prediction about what happens next. Assign rough probabilities (e.g., "~70% chance this leads to..."). Explain your reasoning. What's the most likely outcome? What's the wildcard scenario? Be opinionated — take a stance, don't sit on the fence.

Style:
- Write like a sharp analyst briefing a busy executive — concise, direct, no filler
- Use **bold** for key predictions and probabilities
- Reference specific sources from the list and how their framing reveals what's likely coming
- Do NOT use AI cliches ("It's worth noting", "In today's rapidly evolving", "Only time will tell")
- No headers inside the content — just two dense, insightful paragraphs
- Be confident. Be specific. Be interesting.

Respond with JSON: { "headline": "punchy headline with a prediction angle", "summary": "1 sentence — the core prediction", "confidence": <number 0-100 representing your confidence in the primary prediction>, "content": "two paragraphs, no headers" }`,
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
      confidence: Math.max(0, Math.min(100, parsed.confidence ?? 50)),
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
