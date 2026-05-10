# Got Milk Mob — Web App Spec

> **Audience:** technical PM. Use this to react, redirect, and align on v1 before scaffolding.
> **Purpose of v1:** scaffolding + backend infra with the TwelveLabs SDK/API serving as the product backbone, plus the Phase 1 customer-facing surfaces working end-to-end.
> See also: [README.md](../README.md) (quick start + what's mocked), [PROJECT.md](PROJECT.md), [DESIGN.md](DESIGN.md), [TWELVELABS.md](TWELVELABS.md).

> **What's actually shipped today (2026-05-09):** frontend-only scaffold. Every customer-facing surface is built and navigable, but every TL model call is simulated (`setTimeout`-driven streams, static mock arrays for search/feed). No SDK is wired yet; no API key required to run locally. Full mocked-vs-real table in [README.md](../README.md#whats-mocked-vs-real). The "v1 Build Scope" section below describes the *target* for the next phase, not the current state.

## TL;DR

Got Milk Mob is a web app that lets a brand-partnership marketing team run a viral video campaign with three things they can't do today: (1) automatic, explainable validation that tagged user-submitted videos are actually on-brand; (2) automatic segmentation of validated participants into themed "mobs"; (3) a TikTok-shaped feed where users explore other videos in their mob. The same web app doubles as the sales surface — it walks AWS stakeholders through the architecture and consumption story without a separate deck.

## Product Overview

**What it is.** A working web product, not a prototype. A user uploads a video tagged with a campaign hashtag; within seconds the app streams back an explainable validation verdict, assigns the video to a mob, and drops the user into a feed of other videos in that mob. The app also hosts the pitch — architecture, economics, and the roadmap — as live, navigable surfaces.

**Who uses it.**
- **Primary in-product user:** a campaign participant — drops a video, gets validated, finds their mob, browses.
- **Secondary in-product user:** a campaign operator (marketing) — watches the validation queue, reviews borderline cases, manages the mob taxonomy. (Full operator console is Phase 2/3; v1 surfaces enough to suggest the role exists.)
- **Pitch audience:** AWS account team and the customer's stakeholders, walked through the live app instead of a deck.

**What problem it solves for the customer.** Campaign teams currently scrape hashtags manually and eyeball each post for brand fit, then group winners into clusters by gut feel. This is slow, biased, and doesn't scale past launch week. Got Milk Mob replaces the manual judgment with explainable model verdicts and replaces gut-feel clustering with consistent, taxonomy-driven mob assignment.

## The Two Audiences (Why It's Built This Way)

The app must convince the (fake) customer that they'd ship this, AND convince the TwelveLabs interviewer that I've built the right thing on top of TL. Build implications:

- **The product surface is genuinely usable** — not a thin wrapper around an API call. The customer needs to imagine onboarding their team to it.
- **TL capabilities are visible, not hidden** — the validation UI shows Pegasus reasoning streaming in; the "more like this in your mob" link advertises that it's running embedding similarity. Don't bury the model.
- **The pitch surfaces are first-class app routes**, not a `/about` afterthought — Architecture, Economics, and What's Next are designed as content surfaces, not slide PNGs.

## Information Architecture

Top-level nav has two clearly separated zones. This separation is intentional — it lets a presenter walk customer-experience first, then flip into pitch-mode without breaking immersion.

**Zone A — The Product** (the customer's experience):
- `/` — Landing. Single CTA: upload your video.
- `/upload` — Upload + Validate flow.
- `/me` — My Mob (the user's assigned mob feed).
- `/mobs` — Explore mobs.
- `/mobs/[mobId]` — Individual mob feed.
- `/v/[videoId]` — Single video detail / playback.

**Zone B — Behind the Build** (the pitch):
- `/architecture` — Interactive AWS architecture.
- `/impact` — Economics and SA consumption story.
- `/whats-next` — Final-version roadmap.

Zone A is what the customer experiences. Zone B is what's revealed when the presenter says "and here's what powers this."

## Surface-by-Surface Breakdown

### Landing — `/`

- **Purpose:** anchor the brand of the app and route to upload. Briefly explain what the user is about to do.
- **User action:** click "Drop your milk moment."
- **Key UI:** hero with a looping milk-moment montage (if seeded), single primary CTA, footer link to "Behind the build" zone.
- **TL APIs:** none.
- **Data:** static (or trending mob preview from indexed content if available).

### Upload + Validate — `/upload`

- **Purpose:** the demo's tactile centerpiece. Watch a video get judged and assigned a mob in real time.
- **User action:** drag-drop or pick a file → submit → watch validation stream → land in their mob feed.
- **Key UI:**
  - Drag-drop zone with file constraints (4s–2 min for v1; Pegasus tolerates up to 2hr but demo videos should be short).
  - Live progress through three discrete states: **uploading** → **validating** → **assigning mob**.
  - During *validating*, a streaming panel renders the Pegasus structured response as it arrives — `primary_signals[]`, `brand_safety_flags[]`, `confidence`. The audience watches the model reason. This is the moment.
  - On *auto-approve*: the assigned mob name appears with a hero animation, then routes the user to `/me`.
  - On *review queue*: a softer outcome screen ("a human will check this") — sells the brand-safety story.
  - On *auto-reject*: a friendly redirect ("doesn't look like a milk moment yet — tell us more, or try another clip"), with the model's stated reasons.
- **TL APIs:**
  - `POST /tasks` to upload + index the video into a Marengo 3.0 index.
  - `POST /analyze` (streaming, Pegasus 1.5) with the campaign-relevance schema, run against the uploaded asset (no pre-indexing required for analyze, but we still index for downstream search/embed).
  - `POST /analyze` again (or folded into one call) with the mob-classification schema returning `{ mob: enum, vibe_tags: string[], confidence }`.
  - `POST /embed-v2/tasks` to embed the video segments for in-mob similarity later.
- **Data written:** `Video`, `Validation`, `MobAssignment`, `EmbeddingPointer` records in our DB (TL holds the actual vectors for 7 days on async; we persist the IDs).

### My Mob — `/me`

- **Purpose:** the participant's home base after validation. Make them feel like they joined a community.
- **User action:** scroll a vertical TikTok-shaped feed of other videos in the same mob; tap to play, tap to see "more like this in your mob."
- **Key UI:**
  - Mob banner (mob name, count of members, a short Pegasus-generated mob description).
  - Vertical paginated video feed using TL's HLS streaming + thumbnail URLs (released April 2026).
  - Per-video: poster, who uploaded, vibe tags, "More like this" affordance.
- **TL APIs:**
  - `POST /search` against the index, filtered to `mob = <user's mob>`, ordered by recency for the default feed.
  - `POST /embed-v2` (or retrieve persisted embeddings) for "more like this" semantic ranking.
- **Data:** `Video[]` filtered by `mob_id`.

### Explore mobs — `/mobs` and `/mobs/[mobId]`

- **Purpose:** breadth — show that there's a whole campaign happening, not just the user's corner.
- **User action:** browse all mobs at `/mobs`; click into any mob to see its feed at `/mobs/[mobId]`.
- **Key UI:**
  - Grid of mob cards: hero clip, mob name, member count, top vibe tags. Cards autoplay the hero clip on hover (desktop) or thumbnail (mobile).
  - Mob detail page mirrors `/me` but for an arbitrary mob.
- **TL APIs:** `POST /search` per mob (cached) and `POST /analyze` once per mob to generate the mob's headline description (cached on first generation).
- **Data:** `Mob[]` with cached aggregates.

### Video detail — `/v/[videoId]`

- **Purpose:** lightweight player and "more like this" entry point.
- **TL APIs:** `POST /search` with image-similarity / embedding query for "more like this in your mob."
- **Data:** `Video` + recommendations.

### Architecture — `/architecture`

- **Purpose:** the centerpiece pitch surface. An AWS architecture diagram you can poke at.
- **User action:** hover/tap a service node → see what it does, why it's chosen, what TL workload it handles. Toggle the top of the page between two modes:
  - **Direct TwelveLabs API** — TL hosted, customer's AWS hosts the app shell.
  - **TwelveLabs on Bedrock** — Marengo 3.0 + Pegasus 1.5 consumed via Bedrock cross-region inference, all data and inference stay in the customer's AWS account.
- **Key UI:** SVG-based diagram (likely React Flow) with annotated nodes; side panel that reacts to the selected node; toggle pill at the top for the two architectures.
- **TL APIs:** none — content is editorial.
- **Data:** static config.

### Impact — `/impact`

- **Purpose:** the SA quota and consumption story made tangible.
- **User action:** drag a slider for "videos per day" → the page recomputes per-service consumption (S3 GB/mo, Lambda invocations, Bedrock token spend if Bedrock-mode, OpenSearch units, CloudFront egress) and a monthly AWS spend estimate.
- **Key UI:** input controls + a stacked bar of services + a few callouts that connect spend to AWS account-team goals.
- **TL APIs:** none — analytical surface.

### What's Next — `/whats-next`

- **Purpose:** sell the future without overselling what's built.
- **User action:** read three live-ish previews — IG/TikTok ingestion (mocked feed simulator), AI-generated content detection (Pegasus prompt run against a sample synthetic clip if feasible), evolving taxonomy editor (read-only mock).
- **TL APIs:** Pegasus `/analyze` for the AI-detection preview if accuracy holds; otherwise a curated walkthrough.

## TwelveLabs as the Backbone

The TwelveLabs SDK (Node) is invoked from Next.js API route handlers — never the browser, so the API key stays server-side. Every customer-facing surface that depends on AI capabilities resolves through one of four backbone calls:

```
Upload + Validate flow:
  client → POST /api/uploads (Next.js)
    → tl.tasks.create({ index_id, video_file })   // Marengo indexing (async)
    → tl.analyze.stream({ video_id, prompt, response_format })  // Pegasus, streaming structured response
    → tl.analyze({ video_id, prompt: <mob-classification>, response_format })
    → tl.embed.tasks.create({ video_id, model_name: 'Marengo-retrieval-3.0' })  // for similarity later
    → persist Video, Validation, MobAssignment, EmbeddingPointer

Feed flow (My Mob, Explore):
  client → GET /api/mobs/[id]/feed
    → tl.search.query({ index_id, search_options, filter: { mob: <id> } })
    → return paginated SearchItem[] with HLS + thumbnail URLs

Similarity flow (More like this):
  client → GET /api/videos/[id]/similar
    → tl.search.query({ index_id, query_media_type: 'image', query_media_urls: [thumbnail], filter: { mob } })
    → or use stored embedding + vector search if we cache vectors locally
```

**Pitfalls baked into the design:**
- TL async embedding results are retained 7 days. We persist the resulting vectors immediately (or persist the TL embedding task ID + re-fetch within window) so we don't lose them.
- Pegasus structured response: schema overrides the prompt — the validation schema explicitly includes the *negative* shape (rejection_reasons, brand_safety_flags) so the model can decline cleanly.
- Streaming Pegasus uses `analyze_stream()` and we surface partial state to the UI via a Next.js streaming response (or SSE).

## Data Model (v1, illustrative)

```
User
  id, handle, created_at, mob_id (nullable until first validated upload)

Video
  id, user_id, twelvelabs_video_id, twelvelabs_index_id,
  duration_sec, hls_url, thumbnail_url, status (uploading|indexing|validated|rejected),
  created_at

Validation
  id, video_id, is_campaign_relevant, confidence,
  primary_signals[], rejection_reasons[], brand_safety_flags[],
  decision (auto_approve|review|auto_reject), created_at

Mob
  id, slug, display_name, description (Pegasus-generated, cached),
  hero_video_id, member_count

MobAssignment
  id, video_id, mob_id, vibe_tags[], confidence, created_at

EmbeddingPointer
  id, video_id, twelvelabs_embed_task_id, vector (jsonb or pgvector, optional),
  fetched_at, expires_at  // mirror TL's 7-day retention
```

## Tech Stack (proposal)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 15 App Router (TypeScript)** | Single-language stack, server-side streaming for Pegasus output, simple deployment. |
| Styling | **Tailwind v4 with custom design tokens** (no default theme) | DESIGN.md rule: don't ship default Tailwind palette. Tokens enforce intentional choices. |
| Component primitives | **shadcn/ui** (heavily customized) or hand-rolled | Avoid templated look. shadcn is OK *if* every component gets restyled — defaults read as AI slop. |
| Motion | **Framer Motion** | Streaming-validation choreography, mob-card hover transitions, page transitions. |
| Data fetching | **TanStack Query** | Async pipeline state (upload → indexing → validating → assigning) maps cleanly to query/mutation flows with retry. |
| Backend | **Next.js API routes** (single deploy) | API key stays server-side; route handlers wrap TL SDK. Trades off some scaling control for speed-to-ship — appropriate for v1. |
| TL SDK | **`@twelvelabs/sdk` (Node)** ≥ multi-image-search version | Matches Next.js stack; full feature parity with Python SDK. |
| DB | **Postgres (Supabase or Neon)** with Prisma | Pgvector available if we want to cache embeddings; cheap; production-credible. SQLite acceptable for the very first scaffold. |
| Hosting | **Vercel** | Pairs with Next.js; ships in minutes; HTTPS, edge, streaming all handled. (Production target in `/architecture` is AWS — Vercel is the dev surface, not the pitched architecture.) |
| Video assets | **Stored in TwelveLabs**, fetched via TL HLS + thumbnail URLs (April 2026 feature) | No second video host to manage. Lines up with the architecture story. |

**Alternative considered and rejected for v1:** Next.js + separate Python FastAPI service. More infrastructure, two languages, slower to ship — not worth it before we know the bottlenecks. Easy to extract later.

## v1 Build Scope (the "scaffolding + backbone" the user asked for)

**In v1:**
- Next.js + Tailwind + Prisma + TL SDK scaffolding, with design tokens and a working app shell.
- API routes wrapping the four backbone TL flows (upload+index, validate-stream, classify-mob, embed-task).
- Postgres schema as above.
- `/upload` working end-to-end against real TL APIs (a real video produces a real streaming Pegasus verdict and a real mob assignment).
- `/me` rendering the user's assigned mob feed against `POST /search`.
- Minimal `/mobs` grid (mobs queried from DB, hero clip pulled from one indexed video).
- Stubbed `/architecture`, `/impact`, `/whats-next` — single-screen placeholders so the routes exist and the IA is testable.
- One seed user account (the presenter's) — auth is a stubbed cookie in v1; Cognito/proper auth lands later.

**Explicitly NOT in v1:**
- Full operator/marketing console.
- Real Cognito or any production auth.
- The interactive architecture diagram (placeholder route only).
- Live consumption sliders (placeholder route only).
- IG/TikTok ingestion or AI-detection (futures).

## Open Product Decisions (your call, PM)

1. **Length cap on uploads in v1.** Pegasus tolerates 4s–2hr. Short clips (≤60s) keep the demo fast and TL spend low; longer clips show off model robustness. Recommend 4s–60s for v1, expandable later.
2. **Auth in v1.** Stubbed cookie (one identity, the presenter) vs. lightweight magic-link via Resend or similar. Stubbed is faster and the live demo only ever has one user; magic-link is more realistic.
3. **Mob description generation** — generate once and cache, or regenerate on each new video joining? Cached is cheap; regenerating keeps mobs feeling alive. Recommend cached + manual "refresh" button visible to operators.
4. **Single TwelveLabs index for all mobs vs. one index per mob.** Single index is simpler and supports cross-mob search; per-mob indexes give cleaner isolation. Recommend single index with `mob` as a metadata filter.
5. **What plays on `/` for the landing montage** — recent uploads from the live index, or a curated highlight reel? Recent feels alive but breaks if the queue is empty; curated is safe but less impressive. Recommend recent with a curated fallback when below a threshold.
