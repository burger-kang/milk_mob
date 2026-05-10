# Got Milk Mob

A web app demo for a TwelveLabs interview assignment: an AWS account team selling a brand-partnership marketing org on a "Got Milk?"-style viral video campaign. Users post tagged clips → the app validates them with TwelveLabs models → assigns each clip to a themed "Milk Mob" → drops the user into a TikTok-shaped feed of their mob.

The web app **is** the deliverable — every demo beat is a navigable surface, not a slide.

## Quick start

```bash
cd web
npm install
npm run dev
```

App boots on **http://localhost:3000**. No API key needed — the current build is fully simulated (see [What's mocked](#whats-mocked-vs-real) below).

## Routes

All 12 routes compile clean and return 200. Two zones in the top nav:

### Zone A — The Product (the customer's experience)

| Route | What to notice |
|---|---|
| `/` | Hero, mob strip, recent feed, quiet pitch row at the bottom. |
| `/upload` | **Demo centerpiece.** Three sample-clip cards (Mia → auto-approve, Jake → review, Sam → reject). Pick one and watch a streaming Pegasus-style validation panel render `primary_signals` / `brand_safety_flags` / `rejection_reasons` token-by-token, then the confidence bar springs in, then the mob assignment lands. Drop zone also accepts any file (defaults to auto-approve). Presenter override lives in a collapsed `<details>` block at the bottom. |
| `/me` | Stubbed to Kitchen Mob — banner + paginated feed. |
| `/mobs` | 8-mob grid with a "marketing owns the taxonomy" callout. |
| `/mobs/[mobId]` | Mob banner, feed, cross-mob suggestions. |
| `/v/[videoId]` | Player + validation rail + "more like this in your mob." |
| `/search` | Free-text search with modality (visual/conversation/text-in-video) + operator (or/and) + mob filters. ⌘K palette in TopNav opens this. |

### Zone B — Behind the Build (the pitch)

| Route | What to notice |
|---|---|
| `/operator/review` | Three borderline submissions, Pegasus reasoning inline, approve/reject controls, decisions log. |
| `/architecture` | 14-node Bedrock-only AWS diagram. Hover or click any node — side panel reacts. |
| `/impact` | Slider with 5 named tiers (Soft launch → Generational moment), live spend recompute across Bedrock/CloudFront/S3/Lambda/OpenSearch/DynamoDB, SA-impact callout. |
| `/whats-next` | 4 cards (platform ingestion, AI-detect, configurable taxonomy, operator analytics) with mocked previews. Built last per [DEMO.md](DEMO.md). |

## What's mocked vs real

The current build is a **frontend-first scaffold**. Every model call is faithfully simulated (streaming structure, schema shape, response timing) but no SDK is wired. Backend integration is the next phase.

### Mocked / simulated today

| Surface | What's faked | How |
|---|---|---|
| `/upload` validation stream | Pegasus structured-response streaming | `setTimeout`-driven render of `primary_signals[]`, `brand_safety_flags[]`, `rejection_reasons[]`, `confidence`. Three sample clips carry hardcoded outcomes. |
| `/upload` mob assignment | Pegasus mob-classification call | Pre-bound to each sample (Mia → Kitchen, Jake → Pet review queue, Sam → rejected). |
| `/upload` indexing + embedding | Marengo `/tasks` and `/embed-v2/tasks` | State machine progresses through `uploading → indexing → validating → assigning → done` on timers; no real upload. |
| `/me`, `/mobs/[id]`, `/v/[id]` feeds | Marengo `/search` with `mob` filter | Static array of 24 mock videos in `web/src/lib/videos.ts` filtered in memory. |
| `/v/[id]` "more like this" | Marengo image-similarity search | Same-mob slice of the static list. |
| `/search` results | Marengo cross-modal search | Substring + tag match against the static list. |
| `/operator/review` queue | Pegasus borderline reasoning + decisions log | 3 hand-authored items in `web/src/lib/videos.ts` (`REVIEW_QUEUE`). |
| Sample video playback | TL HLS streams + thumbnails | Google's public sample MP4s from `gtv-videos-bucket`. |
| Authentication | Cognito / magic link | Stubbed — single identity ("the presenter"). |
| `/whats-next` previews | All four | Static cards, no live model calls. |

### What's real

- The full **frontend stack**: Next.js 15 App Router, TypeScript, Tailwind v4 with custom design tokens, `motion/react` animations, Geist + Instrument Serif fonts, mob-specific gradient utilities, paper-pulse loading states.
- The **information architecture** — every demo beat in [DEMO.md](DEMO.md) is a real route.
- The **mock data shape** matches the planned DB schema in [WEBAPP.md](WEBAPP.md) (Video / Validation / MobAssignment / EmbeddingPointer).

### Next phase — wire it for real

See [STATUS.md](STATUS.md) → "Tasks alive on disk" for the backend punch list:

1. Wire the TwelveLabs Node SDK in Next.js API routes (server-side, API key never reaches the browser).
2. Persist Video / Validation / MobAssignment / EmbeddingPointer to Postgres (Prisma proposed; SQLite acceptable for v1 scaffold).
3. Replace mocked search with real Marengo `/search`.
4. Replace simulated Pegasus streaming with real `analyze_stream()` calls.

## Stack

Next.js 15 (App Router, Turbopack) · TypeScript · Tailwind v4 (custom `@theme` tokens, no defaults) · `motion/react` v12 · Geist + Instrument Serif via `next/font` · Node ≥ 20.

Project lives in `web/`. Mock data: `web/src/lib/{mobs,videos,types}.ts` — 8 mobs, 24 videos with persona-style captions and validation reasoning, 3 review-queue items.

## Doc map

This repo is doc-heavy by design — the assignment requires explaining *why* as much as *what*.

| File | What it's for |
|---|---|
| [STATUS.md](STATUS.md) | **Read this first** if you're picking up after a break. Moment-in-time snapshot, what's built, immediate next step. |
| [PROJECT.md](PROJECT.md) | The assignment, the two-audience goal (fake customer + TL interviewer), build phases, locked decisions. |
| [DEMO.md](DEMO.md) | The 8 demo beats with Mia/Jake/Sam personas. Beat-to-route mapping. |
| [DESIGN.md](DESIGN.md) | The design bar — VC-startup-grade, Linear/Stripe/Vercel/Arc/Cash-App as references. The four sniff tests. |
| [WEBAPP.md](WEBAPP.md) | TPM-audience spec — IA, surfaces, TL backbone flows, data model, tech stack, open product decisions. |
| [TWELVELABS.md](TWELVELABS.md) | Reference notes on Marengo 3.0, Pegasus 1.5, endpoints, structured responses, Bedrock availability, demo pitfalls. |

## License

This is a portfolio/interview project. No license intended for redistribution.
