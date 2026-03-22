# SourceCheck.News — Future Changes Backlog

## 1. Native iOS & Android Apps
Build native mobile apps for App Store and Google Play distribution. Options explored:
- **PWA** (already implemented in v2.2) — installable, offline support, push notifications
- **React Native / Expo** — share logic with existing Next.js codebase, native feel
- **Capacitor** — wrap existing web app in native shell, access native APIs
- **Native (Swift / Kotlin)** — best performance, most effort

PWA is live. Next step would be Capacitor or React Native for store presence.

## 2. 360° LLM Analysis (Paid Tier)
AI-powered deep dive on any story covered by 2+ sources. Detailed plan in `360-analysis-plan.md`.

**Summary:**
- User clicks "360° Analysis" on a clustered story
- GPT-4o generates a structured one-page analysis: how left/right/center frame the story, key differences, historical context (Wikipedia), and what to watch
- Streamed response for live rendering (~5-10s)
- Cached in Vercel KV (24h TTL)
- Optional Google Sign-In: anonymous gets 3/day, signed-in gets 5/day
- Tech: OpenAI API, NextAuth.js, Wikipedia REST API, Vercel KV
- Foundation for future paid subscription tier
