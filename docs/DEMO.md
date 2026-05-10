# Got Milk Mob — Demo Arc

> Live walkthrough of the web app, ~7 minutes. Each beat is a user story plus the TwelveLabs capability it lands. Sequence is intentional — customer narrative arcs through the full TL surface and ends at the AWS partnership pitch.
> See [PROJECT.md](PROJECT.md), [WEBAPP.md](WEBAPP.md).

## What the App Demonstrates

**Participant capabilities** (Zone A — The Product)
- Upload a video tagged with the campaign hashtag and watch it get judged in real time, with the model's reasoning streaming visibly.
- Land in an assigned mob with a Pegasus-generated headline description.
- Scroll a TikTok-shaped vertical feed of other videos in the mob, HLS-streamed.
- "More like this in your mob" — semantic similarity surfaced via Marengo embeddings, not chronology.
- Browse all mobs from `/mobs`, tap into any mob's feed, watch any video.
- Search across all campaign videos by free-text — cross-modal query against visual + audio + transcription.

**Operator capabilities** (lightweight in v1)
- Review queue for borderline validations with Pegasus reasoning inline.
- Override a model verdict (approve / reject / reroute mob) — operator's call is logged.
- Per-mob aggregate stats (member count, recent uploads, top vibe tags).

**Pitch capabilities** (Zone B — Behind the Build)
- Interactive AWS architecture diagram showing **TwelveLabs on Bedrock** (Marengo + Pegasus 1.5 invoked through Bedrock cross-region inference, all data and inference inside the customer's AWS account).
- Economics page with a "videos per day" slider that recomputes per-AWS-service consumption and projected monthly spend live.
- What's Next surface with previews of the AI-detection Pegasus prompt, simulated IG/TikTok ingestion queue, and read-only taxonomy editor mock.

**Cross-cutting (always on)**
- Streaming Pegasus validation feedback (`analyze_stream`).
- Multi-image search affordance — drop two reference images, find videos that match the combined vibe.
- Mobile-first responsive across every surface.
- Designed loading / empty / error states for every async TL flow.

## Demo Arc — 8 Beats

### Beat 1 — "Here's what a participant sees." (~60s)

> **Mia, 22, posting from her kitchen.** 15-second clip — milk mustache, choreographed pour into cereal, friends laughing.

Drop the clip in. Within seconds the streaming Pegasus panel lights up: `primary_signals: ["milk visible — gallon jug", "creative activity — choreographed pour", "audience present"]`, confidence ticks toward 0.91. Verdict: **Kitchen Mob**. Transitions to `/me` — banner reads *"Kitchen Mob — chaotic counter-tops, cereal-bowl bravado, choreographed pours."* — feed of 6 other Kitchen Mob videos.

**TL capabilities:** Marengo indexing (`POST /tasks`), Pegasus 1.5 streaming structured analyze (`analyze_stream`), mob-classification analyze schema, search-with-filter for the feed, HLS + thumbnail URLs for playback.

**Why first:** the streaming reasoning is the lean-in moment. Lead with the magic.

### Beat 2 — "Here's why marketing trusts this." (~45s)

> **Jake, 34.** Holds a milk carton, talks about how much he likes it. No creative activity, no clear campaign signal.

Drop it in. Pegasus: `primary_signals: ["milk visible"]`, `confidence: 0.54`, `decision: review`. Lands in the **operator review queue**, not auto-approved.

Switch to operator view. Marcus (brand-partnership manager) sees the borderline submission with Pegasus's reasons inline — overrides in two clicks.

**TL capability:** explainability. Brand safety = structured response with auditable reasons.

**Why second:** the customer's #1 fear ("our brand will be associated with the wrong content") gets addressed before they ask.

### Beat 3 — "And here's what doesn't slip through." (~30s)

> **Sam.** Skateboarding clip with no milk in frame, hashtag-spamming `#milkmob`.

Pegasus: `is_campaign_relevant: false`, `confidence: 0.93`, `rejection_reasons: ["no milk product visible", "hashtag inconsistent with content"]`. Auto-reject with stated reason in a friendly redirect ("Doesn't look like a milk moment yet — try another clip.").

**Why:** false-positive resistance, fast. Closes the loop on Beat 2.

### Beat 4 — "Once in, here's what keeps participants engaged." (~45s)

Back to Mia's `/me`. Tap a video → "More like this in your mob." Semantically-ranked subset of Kitchen Mob surfaces — Marengo embedding similarity, not chronological. Mention that the same machinery supports image-similarity ("drop a reference frame, find vibe-matches").

**TL capability:** Marengo embeddings + similarity search.

**Why:** virality runs on dwell-time. This is the "they keep scrolling" moment.

### Beat 5 — "And here's how the campaign feels collectively." (~45s)

`/mobs`. The 8 mob cards — each autoplays a hero clip, has a member count, top vibe tags. Tap into Skate Mob → its own feed, headline ("Skate Mob: ollies into milk crates, sunlit parks, slow-mo pours mid-grind."). Hop into Beach Mob, Pet/Family Mob — establish breadth.

**Why:** sells platform-level vision. The customer sees the campaign as an ecosystem, not a single feed.

### Beat 6 — Flip to the pitch. "And here's what's running underneath." (~75s)

Open `/architecture`. The AWS diagram renders: S3 ingest, EventBridge, Lambda, OpenSearch (or Postgres+pgvector), DynamoDB, **Bedrock running Marengo 3.0 and Pegasus 1.5 via cross-region inference**, CloudFront, Cognito.

The pitch: **all data and inference stay inside the customer's AWS account.** No data leaves the boundary. Compliance teams light up. Hover Bedrock — side panel explains exactly which TL workload it serves and confirms it's the same model behind the live demo we just walked through.

**Why:** the TwelveLabs interviewer has been waiting for this. This is the GTM motion that justifies the partnership and unlocks AWS sales channels.

### Beat 7 — "And here's what it costs to run at scale." (~45s)

`/impact`. Default: "campaign with 1,000 videos/day." Drag the slider to **100,000 videos/day** (Super Bowl spike). Stacked bar recomputes live: S3 GB/mo, Lambda invocations, Bedrock token spend, OpenSearch units, CloudFront egress. Side callout: *"At this volume, this campaign drives ~$X/mo through your account team's services — quota-relevant deal."*

**Why:** the AWS account team needs ammunition to defend the deal internally. This page is that ammunition. Also the SA-quota-impact story the assignment explicitly asked for.

### Beat 8 — "And here's where this goes next." (~45s)

> **Build last, only after Beats 1–7 are verified working end-to-end.** This beat carries the highest live-demo flake risk and the lowest base-product cost of being late. Treat as additive polish.

`/whats-next`. Three live previews:

1. **IG/TikTok ingestion** — mocked queue of platform-tagged posts streaming in. Click any to push it through the same validate-and-assign pipeline.
2. **AI-generated content detection** — drop a synthetic clip; Pegasus runs a structured prompt looking for generative artifacts and returns evidence-backed authenticity ("likely AI-generated, confidence 0.81, artifacts: [audio-lip mismatch at 00:04, hand morphology at 00:09]"). Honest caveat in fine print: production answer pairs TL with a dedicated detector for accuracy.
3. **Configurable mob taxonomy** — read-only mock showing marketing can drag-create new mobs and the app re-classifies on next ingest.

**Why:** sells the future without overselling. Customer sees a buyable roadmap; interviewer sees creative use of TL beyond the obvious endpoints.

### Closing line (~15s)

> "All of this — every screen you just saw, the validation, the mobs, the discovery, the architecture, the economics — runs on TwelveLabs as the backbone. Two models, four endpoints, one product. Marengo finds. Pegasus reasons. Bedrock keeps the customer's data where it needs to stay."

## Free-Text Search — Promoted to a First-Class Beat

User request 2026-05-09: free-text search must be a real surface in the web app, not a power-user afterthought. Promoted from B-side to its own beat between Beat 5 and Beat 6.

### Beat 5.5 — "And here's how to find any moment in the campaign." (~30s)

> **The presenter, mid-demo,** types into the global search bar in the top nav: *"slow-motion milk pour, golden hour, outdoor"*.

Results stream in across all mobs — the query runs cross-modal against visual + audio + transcription via Marengo 3.0, ranked by semantic relevance. Click a result, jump to its clip with the matching segment highlighted. Try a second query — *"someone laughing while spilling milk"* — different result set, same machinery.

**TL capability landed:** cross-modal Marengo retrieval as the discovery layer that makes the entire campaign navigable for both participants and operators.

**Why it's promoted:** it's the most direct showcase of Marengo as a foundation model. Hiding it as an operator-only power feature undersells the most expensive capability on the platform.

## Demo Beats — All Live in the Web App (Don't Forget)

**Rule (user, 2026-05-09): every beat in this doc must be a navigable surface in the web app.** No PowerPoint fallback for any beat. If a beat is too risky to demo live (e.g. Beat 8), keep its surface in the app but let the surface degrade gracefully — never collapse the surface entirely.

| Beat | Surface (route) | Web app status |
|------|-----------------|----------------|
| 1 — Mia uploads | `/upload` → `/me` | Required |
| 2 — Borderline → review | `/upload` → `/operator/review` | Required |
| 3 — Off-campaign rejected | `/upload` (rejection state) | Required |
| 4 — More like this | `/v/[id]` (similarity panel) | Required |
| 5 — Explore mobs | `/mobs`, `/mobs/[id]` | Required |
| 5.5 — Free-text search | `/search` + global search bar | Required |
| 6 — Bedrock architecture | `/architecture` | Required |
| 7 — Economics | `/impact` | Required |
| 8 — What's next | `/whats-next` | Required (built last) |

## Capability B-Sides (for Q&A only, not in linear demo)

- Per-video transcript scroll with audio-event search (find videos where someone says "got milk?" out loud) — searchable from the video detail page.
- Mobile install affordance — the app is responsive enough that the customer pulls it up on a phone mid-Q&A and uploads themselves.
- Operator export — CSV of validated submissions, mob assignments, and review-queue decisions.

## Build Order Implication

Beats 1–7 form the core demo. Beat 8 is a polish layer added once 1–7 are working and verified. If time runs short before delivery, Beat 8 collapses into a static "What's Next" panel without flaky live previews — the demo still lands.
