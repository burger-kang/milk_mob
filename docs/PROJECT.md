# Got Milk Mob — TwelveLabs Demo

Assignment from twelvelabs.com (received 2026-05-09). Build a demo for an AWS account team selling to a large social media platform's brand-partnership marketing division.

## The Customer's Problem

The brand-partnership team is running a nostalgia "Got Milk" viral campaign — a throwback to the 1993 original, scoped to also pull in younger users. Initial launch seeds the campaign with a few celebrity/influencer videos. They need to:

1. **Identify** when a user is participating: detect posts tagged with campaign hashtags (`#gotmilk?`, `#milkmob`, etc.).
2. **Validate** that the video content is actually campaign-relevant (someone doing something creative while drinking milk) — not just hashtag spam.
3. **Segment** validated participants into "Milk Mobs" — clusters of users whose videos share an activity, location, or vibe (kitchen mob, skate mob, beach mob, etc.).
4. **Explore** — let users browse other videos within their assigned mob.

## Final Deliverable

**A working web application — not a slide deck.** The web app *is* the presentation. The pitch is delivered by walking stakeholders through the live product, not by advancing through PowerPoint. Everything the assignment asks for (the customer use case, the AWS architecture, the SA quota/consumption-impact story, the "what's next" roadmap) lives inside the app itself as navigable surfaces.

The bar: the app should be capable enough that a stakeholder who never sees a separate deck still walks away with the full narrative. It must address every need outlined in the assignment **and more** — extensible product surface, not a single-purpose demo.

This raises the stakes on [DESIGN.md](DESIGN.md) — there is no slide-deck fallback to carry the polish. The app is the artifact being judged.

## The Real Goal — Two Audiences

The assignment is graded on a single literal output (demo + deck), but it is judged by two distinct audiences at the same time:

1. **The fake customer in the scenario** (the social media platform's brand-partnership team). Persona-wise: marketing-minded, cares about brand safety, virality, and creative control. Every product decision must read as "this would actually ship a successful campaign." Anything that smells like a research toy fails this audience.
2. **The TwelveLabs interviewer** (the actual evaluator). They want to see: deep fluency across the full TwelveLabs surface (not just one endpoint), good product judgment, an AWS partnership story that maps to real Bedrock consumption, and presentation polish that proves I can stand in front of an enterprise customer and win.

**Goal of the assignment:** ace the interview by closing the (fake) deal. Both audiences must walk away convinced. When the two pull in different directions, weight the interviewer slightly higher — they're the gate — but never sacrifice the customer narrative, because the interviewer is grading the customer narrative.

### Implications

- **Use multiple TL capabilities visibly.** Marengo (search + embed) AND Pegasus (analyze, structured responses, ideally streaming). Solving the problem with one endpoint is a missed signal.
- **Show, don't list.** A live, polished web app beats anything describing what could be built. There is no deck — the app carries everything.
- **Brand safety is a feature.** Marketing buyers fear brand-unsafe content surfacing under their hashtag. Surface this in the validation UX — it's both a customer win and a Pegasus structured-response showcase.
- **The AWS architecture is a surface inside the app.** Likely an `/architecture` route with an interactive diagram, plus a consumption-impact / economics view (the SA quota story). The interviewer wants to see I understand TwelveLabs' GTM motion through Bedrock — make it clickable and concrete, not a static PNG.

## Build Phases

Everything ships inside the same web app — there is no separate deck artifact, and nothing is "deferred" outside the build. Phases describe the order surfaces come online, not the order in which scope is committed. The whole product is committed; phases just stage the work.

### Phase 1 — Customer-facing core

The surfaces the (fake) customer would actually use:

- **Upload + Validate** — Pegasus 1.5 `/analyze` streaming with a structured-response schema for explainable campaign-relevance gating.
- **My Mob feed** — videos in the user's assigned mob.
- **Explore mobs** — all mobs, browsable.

Locked design decisions for these surfaces are in [Phase 1 — Locked Decisions](#phase-1--locked-decisions) below.

### Phase 2 — Pitch surfaces (same web app, no separate deck)

The surfaces that replace what would have been a slide deck:

- **Architecture** — interactive AWS architecture diagram. Toggle "direct TwelveLabs API" vs "TwelveLabs on Bedrock." Hover services for their role.
- **Economics / SA impact** — consumption-impact view: cost per processed video, scaling assumptions, AWS-service breakdown. The SA quota story made tangible.
- **What's Next** — final-version roadmap, with live-ish previews where possible.

Architecture content includes S3 ingest, EventBridge, Lambda, DynamoDB / OpenSearch for vectors + metadata, Bedrock for LLM-driven mob naming/summaries, API Gateway, CloudFront/Amplify, Cognito. Marengo 3.0 and Pegasus 1.5 are first-class on Bedrock as of 2026 with cross-region inference — the architecture toggle reflects a real customer decision (direct API vs. consume through Bedrock and stay in-account), not a slide gimmick.

### Phase 3 — Final-version capabilities (pitched in What's Next, not built into v1)

The capabilities the pitch promises land after the demo. Live previews land inside Phase 2's What's Next surface; full implementation is roadmap. Detail in [Beyond Phase 1](#beyond-phase-1--final-version-scope) below.

- Platform ingestion (IG / TikTok via official APIs).
- AI-generated content detection (Pegasus structured analyze, possibly paired with a dedicated detector for accuracy).
- Evolving mob taxonomy as a customer-configurable input.

## Phase 1 — Locked Decisions

Decided 2026-05-09 with the two-audience goal in mind. Each decision below names what the customer gets, what TwelveLabs capability it showcases, and the tradeoff being accepted.

### Validation gate → **Pegasus structured response with explainable confidence**

`POST /analyze` against the uploaded video with a JSON Schema returning:

```json
{
  "is_campaign_relevant": true,
  "confidence": 0.0,
  "primary_signals": ["milk visible", "creative activity: skateboarding"],
  "rejection_reasons": [],
  "brand_safety_flags": []
}
```

Three thresholds: auto-approve, human-review queue, auto-reject. The review-queue band is the brand-safety story for marketing. UI surfaces the model's reasons inline — borrowed from how trust-and-safety dashboards present moderation calls.

- **Customer win:** explainable AI for brand safety; no black-box "yes/no" that legal/marketing fears.
- **TwelveLabs showcase:** Pegasus 1.5 + structured JSON Schema (latest capability) + ideally streamed response in the UI for tactile impact.
- **Tradeoff accepted:** one Pegasus call per upload is more expensive than a search-with-threshold gate, but the explainability sells the deal — and `analyze` doesn't require pre-indexing, so it's actually faster end-to-end for the validation step.

### Mob assignment → **Hybrid: curated taxonomy via Pegasus + embedding similarity for in-mob exploration**

Two-stage:

1. **Assign to a mob** via a second `analyze` call (or fold into the validation call) that classifies the video into a curated taxonomy. **Working v1 taxonomy** (kitchen, skate, beach, gym, dance, pet/family, art/craft, outdoors) is a starting point — *expect this to evolve as we approach the final version*. Marketing input on the final taxonomy will be the customer-facing decision; the demo just needs to prove the pattern works. Schema also returns 2-3 free-form vibe tags for richer search.
2. **In-mob exploration** uses Marengo embeddings (Embed API v2) — for any video the user opens, "more like this in your mob" is a vector-similarity query against other videos already assigned to that mob.

- **Customer win:** marketing controls the mob taxonomy (brand-safe categories, predictable for partner pitches) AND users still get organic "videos like this" discovery within their mob.
- **TwelveLabs showcase:** Pegasus *and* Marengo, side-by-side, doing different jobs they're each best at. This is the demo moment that makes the interviewer nod.
- **Tradeoff accepted:** curated taxonomy is less "magical" than full emergent clustering, but emergent clustering with N≈20 demo videos looks like noise. Curated wins for a live demo. Note the path to emergent in the deck as the v2 evolution.

### App surface → **Custom mobile-first web app (Next.js + Tailwind, real design tokens)**

The web app is the deliverable. Phase 1 covers the customer-facing core surfaces; Phase 2 adds the pitch surfaces (architecture, economics, what's next). All in one app.

**Customer-facing core (Phase 1):**

1. **Upload + Validate** — drop a video, watch Pegasus validation reasoning **stream in live** (decision locked: streaming is worth the frontend lift), see the assigned mob land at the end. Upload is the iteration-1 ingestion path; user-uploaded clips also seed the experience for live demos.
2. **My Mob feed** — vertical, TikTok-shaped feed of other videos in the same mob.
3. **Explore mobs** — grid of all mobs with hero clip, tap into any mob's feed.

**Pitch surfaces (Phase 2, same app, replace the deck):**

4. **Architecture** — interactive AWS architecture diagram. Hover/tap services to see what they do; toggle views between "direct TwelveLabs API" and "TwelveLabs on Bedrock."
5. **Economics / SA impact** — consumption-impact view showing per-video processing cost, scaling assumptions, and what flows through which AWS service. The SA quota story, made tangible.
6. **What's Next** — the final-version roadmap (platform ingestion, AI-generated content detection, evolving taxonomy) presented as live-ish previews where possible, slide-style only where necessary.

Streaming validation on (1) is the tactile centerpiece — it lets the audience watch the model "think" rather than waiting on a black-box spinner. Use `analyze_stream()` (Pegasus 1.5 sync streaming, available since 2026-05-06) with the structured-JSON schema and progressively render the `primary_signals[]` and `brand_safety_flags[]` arrays as they arrive.

- **Customer win:** the demo *feels* like something that could ship inside their platform tomorrow. A Streamlit/Gradio surface signals "research demo," and that loses the customer.
- **TwelveLabs showcase:** the polish is part of the pitch. It also forces good async UX for indexing/embedding latency, which is where most TL demos fall apart.
- **Tradeoff accepted:** higher build cost. Mitigate with a hard scope cap (those three screens, nothing else) and seed data for ~15-20 plausible "milk mob" videos so the feed never looks empty. Standards in [DESIGN.md](DESIGN.md) are non-negotiable here — this is the surface that gets judged hardest.

## Beyond Phase 1 — Final Version Scope

Phase 1 ships upload-only with the working v1 taxonomy. The final version (the one the What's Next surface pitches as "what this becomes") expands along three axes the user has explicitly called out:

### 1. Platform scraping ingestion

In addition to direct upload, ingest videos posted to Instagram and TikTok with the campaign hashtags. The product motion is: brand-partnership team subscribes to `#gotmilk?` / `#milkmob` watchlists across platforms, and new posts auto-flow into the same validate → mob-assign pipeline.

- **Implementation reality:** both platforms restrict scraping. The right path is their official APIs (Meta Graph API for IG, TikTok Display/Research API), not scraping in the literal sense. ToS and rate limits will shape the architecture — flag this in the deck rather than glossing it.
- **Demo strategy for the final version:** if real-API access isn't feasible in the build window, simulate the inbound feed with a pre-recorded queue that drips videos into the pipeline as if they were just posted. Customer still sees the experience.

### 2. AI-generated content detection

Distinguish authentic human-created participation from AI-generated submissions. Marketing teams need this — a campaign overrun by AI fakes loses credibility and breaks the "real users having real fun" narrative.

- **TwelveLabs reality check:** TwelveLabs does not ship a first-class "synthetic media detector" endpoint as of 2026-05. The realistic path is **Pegasus 1.5 `/analyze` with a structured-response schema** asking for evidence-backed authenticity assessment (e.g. `{ likely_ai_generated: bool, confidence, artifacts: [{type, timestamp, description}] }`). Pegasus's multimodal reasoning across visual + audio is well-suited to spotting common artifacts (uncanny motion, audio-lip mismatch, generative-model giveaways).
- **Research item:** before building this in, validate Pegasus's actual accuracy on synthetic-vs-real video. If it's weak, the production answer is to combine TL with a dedicated detector (e.g. an open-source synthetic-media model or a third-party API) and use TL for explainability. Pitch this honestly in the deck.
- **Customer framing:** position as a brand-safety feature, not a moderation feature. "Make sure the campaign you're paying to amplify is amplifying real participation."

### 3. Final mob taxonomy

The v1 taxonomy in iteration 1 is a placeholder. The final taxonomy is a customer-facing decision driven by marketing — they own the brand-safe categories. The deck should show this is a configurable input (not a hardcoded enum), with the v1 list as an illustrative example.

## Resolved Open Questions (2026-05-09)

- **Seed videos** — the user uploads them through the app's own upload UI. No stock footage, no synthetic clips, no scraped TikToks. The upload flow must be robust enough to seed the experience and to handle live uploads during the presentation. This implicitly makes the upload UX an A-tier surface, not just a utility.
- **AI-detection in Phase 1?** — No. It belongs in the **What's Next** surface (see app surface #6). The `/analyze` capability is already exercised by the validation flow, so the interviewer's "uses Pegasus structured responses" box is checked without crowding Phase 1.
