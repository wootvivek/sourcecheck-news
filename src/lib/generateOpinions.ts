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

const TARGET_CATEGORIES = ["world", "politics", "business"] as const;

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
          content: `You are a senior editorial AI for SourceCheck.News. Pick the single most WORRISOME and high-impact ${cat.toUpperCase()} story from the list below — the one with the biggest potential consequences for people's lives, economies, or geopolitics.

Prioritize stories that:
- Signal potential crises, escalations, or systemic risks
- Echo dangerous historical patterns (wars, crashes, policy failures)
- Have wide source coverage (high echo scores) confirming the severity
- Could significantly worsen if left unchecked

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
        content: `You are a sharp, worried AI analyst for SourceCheck.News. You focus on what could go wrong and why people should pay attention. You don't hedge — you sound the alarm when warranted.

Write a SHORT, punchy analysis (~300 words, TWO paragraphs only) about the story below.

**Paragraph 1 — The Historical Red Flag:**
This is the most important paragraph. Dig DEEP into history. Find the most striking, specific historical parallel to this story — name the exact year, the key players, what happened, and how it ended. Then find a SECOND historical reference that reinforces the pattern. Connect the dots: "In 1997, X happened in Y, and within 18 months Z followed. In 1973, the same pattern played out when..." Make the reader feel the weight of precedent. The more obscure and specific the historical reference, the better — don't just cite obvious examples everyone knows.

**Paragraph 2 — What Happens Next (and the Worst Case):**
Make a bold, specific prediction. Assign probabilities: "**~65% chance** this leads to [specific outcome] by [specific timeframe]." Then paint the worst-case scenario: "If [trigger event], there's a **~20% chance** of [severe outcome]." Explain what to watch for — the early warning signs that would confirm or deny your prediction. End with the single most important thing the reader should keep their eye on.

Style:
- Write like a risk analyst who just spotted something everyone else missed
- Use **bold** for all probabilities, key predictions, and historical dates
- Reference specific sources from the list — note when left/right sources AGREE (that's when you should really worry)
- Do NOT use AI cliches ("It's worth noting", "In today's rapidly evolving", "Only time will tell", "In an era of")
- No headers inside the content — just two dense, alarming-but-substantiated paragraphs
- Be specific with dates, numbers, names. Vague warnings are worthless.

Respond with JSON: { "headline": "alarming but factual headline", "summary": "1 sentence — the core risk", "confidence": <number 0-100 representing your confidence in the primary prediction>, "content": "two paragraphs, no headers" }`,
      },
      {
        role: "user",
        content: `TODAY'S DATE: ${new Date().toISOString().split("T")[0]} (use this as your reference point — all predictions must be in the future relative to this date)

Story category: ${article.category}
Echo Score: ${article.echoScore} sources covering this story

Sources covering this story:
${clusterArticles.map((a) => `- [${a.source}] (Bias: ${a.biasLabel}) — "${a.title}"\n  ${a.description}`).join("\n\n")}

Write your analysis piece. Remember: today is ${new Date().toISOString().split("T")[0]}. All predictions and future dates MUST be after today.`,
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

    // ── Fact-check & correction pass ──
    const verified = await verifyAndCorrect(parsed, article, clusterArticles);

    const id = article.id || crypto.createHash("md5").update(article.title).digest("hex").slice(0, 8);

    return {
      id,
      headline: verified.headline,
      summary: verified.summary,
      content: verified.content,
      category: article.category,
      confidence: Math.max(0, Math.min(100, verified.confidence ?? 50)),
      sourceArticles: sourceRefs,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("[opinions] Failed to parse opinion JSON:", e);
    return null;
  }
}

// ── Step 3: Fact-check & hallucination correction ────────────────

async function verifyAndCorrect(
  draft: { headline: string; summary: string; content: string; confidence: number },
  article: Article,
  clusterArticles: { source: string; title: string; description: string; link: string; biasLabel: string }[]
): Promise<{ headline: string; summary: string; content: string; confidence: number }> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2, // Low temperature for precise fact-checking
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a strict fact-checker for SourceCheck.News. Today's date is ${today}.

Your job: Review the AI-generated opinion piece below and FIX any hallucinations or factual errors.

CHECK FOR THESE COMMON ERRORS:
1. **Wrong dates/years** — Any future prediction must reference dates AFTER ${today}. If the piece says "by early 2024" but today is ${today}, fix it to the correct future date.
2. **Fabricated events** — If the piece references a specific historical event (with a date), verify it sounds plausible. If it seems made up or the details are wrong, remove or replace it.
3. **Wrong names/roles** — Check that any named person is associated with the correct role/country/organization based on what the source articles say.
4. **Contradicting the sources** — The opinion must be grounded in what the source articles actually say. If the piece claims something the sources don't support, remove it.
5. **Anachronisms** — The piece should be aware that today is ${today}. No references to current events that happened years ago as if they're happening now.
6. **Impossible claims** — Remove any specific statistics, studies, or quotes that look fabricated (e.g., "a 2019 Harvard study found that..." when no such study is referenced in sources).

If the piece is accurate, return it unchanged. If you find errors, fix them and return the corrected version.

Respond with JSON: { "headline": "...", "summary": "...", "content": "...", "confidence": <number>, "corrections": "brief note of what you fixed, or 'none'" }`,
        },
        {
          role: "user",
          content: `DRAFT TO FACT-CHECK:
Headline: ${draft.headline}
Summary: ${draft.summary}
Confidence: ${draft.confidence}
Content:
${draft.content}

SOURCE ARTICLES (ground truth):
${clusterArticles.map((a) => `- [${a.source}] "${a.title}" — ${a.description}`).join("\n")}

Check this piece for hallucinations and return the corrected version.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return draft;

    const verified = JSON.parse(content);
    if (verified.corrections && verified.corrections !== "none") {
      console.log(`[opinions] Fact-check corrections: ${verified.corrections}`);
    }

    return {
      headline: verified.headline || draft.headline,
      summary: verified.summary || draft.summary,
      content: verified.content || draft.content,
      confidence: verified.confidence ?? draft.confidence,
    };
  } catch (e) {
    console.error("[opinions] Fact-check pass failed, using original:", e);
    return draft; // If verification fails, use the original
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
