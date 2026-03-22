# 360 Analysis — AI-Powered Story Deep Dive (Paid Tier Preview)

## Context
Users can already see *how many* sources cover a story and their political bias spectrum. The 360 Analysis feature goes deeper: when a user clicks "360 Analysis" on a clustered story, an AI generates a structured one-page analysis covering how different sides frame the story, key differences in coverage, and historical context from Wikipedia. This is the foundation for a paid tier — launching as a free preview (3/day limit) with payments added later.

## User Choices
- **Trigger**: On-demand (user clicks, generated in real-time ~5-10s)
- **Context source**: LLM + Wikipedia summaries for key entities
- **LLM**: OpenAI API (GPT-4o)
- **Auth**: Optional Google Sign-In (NextAuth.js). Anonymous: 3/day (localStorage). Signed in: 5/day (server-tracked)
- **Payments**: Build first, free preview with limits, add payments later

## User Experience

### Step 1 — Discover
On any article card with 2+ sources, users see a small "360°" button. They can also find it as a third tab ("360° Analysis") inside the existing sources modal when they click the echo score badge.

### Step 2 — Generate
User clicks the button → a full-screen panel opens with a loading shimmer → text streams in live, section by section (~5-10 seconds). The analysis includes:

1. **Story Summary** — What all sources agree on (2-3 sentences)
2. **Left-Leaning Coverage** — How left/left-center outlets frame it
3. **Right-Leaning Coverage** — How right/right-center outlets frame it
4. **Center Coverage** — What centrist sources include or exclude
5. **Key Differences** — Bullet points of the biggest framing gaps
6. **Historical Context** — Background pulled from Wikipedia on key people/events/places
7. **What to Watch** — Forward-looking points on how the story might develop

### Step 3 — Rate Limits
- Anonymous: 3 free analyses per day
- Signed in with Google: 5 per day
- Footer shows: "2 of 3 free analyses remaining today"
- When exhausted: "Sign in with Google for 5 daily analyses" (for anonymous) or "You've used all 5 analyses today" (for signed-in)

### Step 4 — Caching
If someone already analyzed the same story, it loads instantly from cache (no re-generation). Cache lasts 24 hours.

## Architecture

```
User clicks "360°" → useAnalysis hook checks rate limit (localStorage)
  → POST /api/analyze with article cluster data
  → Server extracts entities from titles (regex, no LLM)
  → Parallel Wikipedia summary fetches (top 5 entities)
  → Stream OpenAI GPT-4o response back to client
  → Cache completed analysis in Vercel KV (24h TTL)
  → Client renders streamed markdown in AnalysisPanel modal
```

## Auth Layer — Optional Google Sign-In

Uses **NextAuth.js v5** (Auth.js) with Google OAuth provider. Works alongside existing localStorage patterns — the app functions fully without sign-in.

**How it works:**
- Anonymous users: 3 analyses/day tracked in localStorage (same as current bookmarks/streaks pattern)
- Signed-in users: 5 analyses/day tracked server-side in Vercel KV (`usage:<userId>:<date>`)
- Sign-in prompt appears in the AnalysisPanel footer: "Sign in with Google for 5 free analyses/day" (shown to anonymous users)
- Small user avatar/sign-in button added to Navbar (right side, next to settings)
- Session managed via NextAuth JWT strategy (no database needed — stateless)

**New auth files:**
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler with Google provider
- `src/lib/auth.ts` — NextAuth config (Google provider, JWT session strategy, callbacks)
- `src/components/AuthButton.tsx` — Navbar sign-in/avatar button. Shows "Sign in" or user avatar+name. Uses `useSession()` from next-auth/react.
- `src/components/AuthProvider.tsx` — SessionProvider wrapper for the app layout

**Modified for auth:**
- `src/app/layout.tsx` — Wrap children with `<AuthProvider>`
- `src/components/Navbar.tsx` — Add `<AuthButton />` next to settings icon
- `src/app/api/analyze/route.ts` — Check session: if signed in, use server-side KV rate limit (5/day); if anonymous, rely on client-side limit + IP backstop
- `src/hooks/useAnalysis.ts` — Check session to determine limit (3 vs 5) and show appropriate messaging

## Files to Create

### 1. `src/app/api/analyze/route.ts` — **New**
Core API route. POST handler that:
- Accepts `{ article: Article }` body (main article with relatedArticles)
- Computes cache key: `analysis:<md5(sorted-article-ids)>` — checks KV first, returns cached if found
- Calls `extractEntities()` from wikipedia.ts to get top 5 proper nouns from all titles in cluster
- Calls `fetchWikipediaContext()` in parallel for each entity
- Builds prompt with: all source articles annotated with bias labels (from `getSourceBias()`), Wikipedia context, and structured output instructions
- Streams response using OpenAI SDK `chat.completions.create({ stream: true })` + Web ReadableStream
- On stream completion, fire-and-forget caches full text to KV (TTL 24h)
- Basic IP rate limit backstop: `ratelimit:<ip>:<date>` in KV, reject at 10/day

**Prompt structure:**
- System: "You are a media analyst for SourceCheck.News. Be balanced, factual, transparent. Never take sides."
- User message contains: Primary article (source + bias + title + description), all related articles (same format), Wikipedia context blocks
- Requested output sections: **Story Summary**, **Left-Leaning Coverage**, **Right-Leaning Coverage**, **Center Coverage**, **Key Differences** (bullets), **Historical Context**, **What to Watch**
- Model: `gpt-4o`, max_tokens: 2000

### 2. `src/lib/wikipedia.ts` — **New**
- `extractEntities(titles: string[]): string[]` — Finds capitalized multi-word sequences (proper nouns) across all titles, deduplicates, returns top 5 by frequency. Simple regex, no LLM needed — news titles are entity-dense.
- `fetchWikipediaContext(entities: string[]): Promise<WikiContext[]>` — Hits Wikipedia REST API summary endpoint (`https://en.wikipedia.org/api/rest_v1/page/summary/{title}`) in parallel via `Promise.allSettled`. Returns `{ entity, extract }` for successful lookups, silently skips 404s.

### 3. `src/hooks/useAnalysis.ts` — **New**
Client hook managing:
- **Rate limiting**: localStorage key `sourcecheck-analysis-usage` stores `{ date: "YYYY-MM-DD", count: number }`. Resets daily. Limit: 3/day (anonymous) or 5/day (signed in).
- **Streaming state**: `status: 'idle' | 'loading' | 'streaming' | 'done' | 'error'`, `content: string` (accumulated markdown)
- **`analyze(article: Article)`**: Checks rate limit → POSTs to `/api/analyze` → reads response stream via `response.body.getReader()` → accumulates chunks into `content` → increments usage on success
- **`remaining`**: computed analyses left today
- Follows same localStorage patterns as `useBookmarks.ts` and `useStreak.ts`

### 4. `src/components/AnalysisPanel.tsx` — **New**
Full-screen modal (same pattern as SourcesModal) that:
- Header: story title, source count, BiasSpectrum visualization (reuse existing component)
- Body: renders streamed markdown with a pulsing cursor while streaming
- Uses lightweight inline markdown renderer (handles `###` headings, `**bold**`, `- bullets`, paragraphs — no new dependency)
- Footer: "{n} of {limit} free analyses remaining today"
- When rate limit exhausted: shows sign-in prompt (anonymous) or "used all analyses" (signed in)
- Escape key / backdrop click to close (same as SourcesModal)
- Loading skeleton/shimmer before first token arrives

### 5. `src/components/MarkdownRenderer.tsx` — **New**
Minimal markdown-to-JSX component handling the subset GPT-4o will produce:
- `### Heading` → `<h3>`
- `**bold**` → `<strong>`
- `- bullet` → `<li>`
- Paragraphs → `<p>`
- No external dependency needed — ~50 lines of code

## Files to Modify

### 6. `src/components/SourcesModal.tsx`
- Add a third tab: "360° Analysis" alongside "Perspective View" and "All Sources"
- Tab type becomes: `"sources" | "perspectives" | "analysis"`
- When "360° Analysis" tab is selected, render `<AnalysisPanel>` inline in the modal content area
- Pass full article data (main + related + echoScore + echoSources) through
- Show remaining count badge on the tab: "360° Analysis (2 left)"
- Only show tab when `echoScore >= 2` (need multiple sources for meaningful analysis)

### 7. `src/components/ArticleCard.tsx`
- Add a small "360°" shortcut button on cards with `echoScore >= 2`:
  - Desktop: overlay button bottom-left of image (next to bookmark)
  - Mobile: small icon in the source/time row
- Clicking opens SourcesModal directly on the "analysis" tab
- Pass new prop `defaultTab?: Tab` to SourcesModal so it can open to analysis tab directly

### 8. `src/lib/types.ts`
- Add `AnalysisUsage` interface: `{ date: string; count: number }`

### 9. `package.json`
- Add `openai` and `next-auth` dependencies

## Environment Variables
- `OPENAI_API_KEY` — add to `.env.local` and Vercel dashboard
- `GOOGLE_CLIENT_ID` — from Google Cloud Console OAuth credentials
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — production URL (Vercel auto-detects)

## Tech Stack Additions
- **OpenAI GPT-4o** — generates the analysis (streamed)
- **Wikipedia REST API** — provides historical context on key entities
- **NextAuth.js + Google OAuth** — optional sign-in (JWT, no database)
- **Vercel KV** — caches analyses (24h) + tracks signed-in user usage

## Implementation Order

**Phase 1 — Auth foundation:**
1. `npm install openai next-auth`
2. `src/lib/auth.ts` (NextAuth config)
3. `src/app/api/auth/[...nextauth]/route.ts` (auth route)
4. `src/components/AuthProvider.tsx` (session provider)
5. `src/components/AuthButton.tsx` (navbar sign-in/avatar)
6. `src/app/layout.tsx` (wrap with AuthProvider)
7. `src/components/Navbar.tsx` (add AuthButton)

**Phase 2 — Analysis backend:**
8. `src/lib/wikipedia.ts` (entity extraction + Wikipedia fetching)
9. `src/app/api/analyze/route.ts` (API route with streaming + caching + auth-aware rate limiting)

**Phase 3 — Analysis frontend:**
10. `src/lib/types.ts` (add AnalysisUsage type)
11. `src/hooks/useAnalysis.ts` (client hook, session-aware limits)
12. `src/components/MarkdownRenderer.tsx` (lightweight renderer)
13. `src/components/AnalysisPanel.tsx` (analysis display)
14. `src/components/SourcesModal.tsx` (add 360° tab)
15. `src/components/ArticleCard.tsx` (add shortcut button)

## Verification
1. Click echo badge on a 2+ source story → SourcesModal opens → "360° Analysis" tab visible
2. Click tab → loading shimmer → streamed markdown appears section by section
3. Analysis shows balanced coverage from left/right/center with Wikipedia context
4. Close and reopen same story → instant load from KV cache
5. Anonymous: use 3 analyses → "0 remaining" → shows sign-in prompt for more
6. Sign in with Google → avatar appears in navbar → limit increases to 5/day
7. Next day → count resets
8. Stories with echoScore=1 → no 360° tab or button shown
9. Sign out → reverts to anonymous 3/day limit
10. Mobile layout works cleanly
