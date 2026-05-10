# Status — where we left off

> **Read this first if you're picking up after a `/compact` or new session.** This is the moment-in-time snapshot. The stable plan lives in [PROJECT.md](PROJECT.md), [WEBAPP.md](WEBAPP.md), [DESIGN.md](DESIGN.md), [TWELVELABS.md](TWELVELABS.md), [DEMO.md](DEMO.md). For a clone-and-run intro, see [README.md](../README.md).

## Last updated
2026-05-09 — after first frontend build pass, /upload sample-clip refactor, and initial GitHub push (`milk_mob`).

## Run it locally

```bash
cd web
npm install      # only needed once
npm run dev      # boots http://localhost:3000
```

No API key required — the build is fully simulated. See [README.md](../README.md#whats-mocked-vs-real) for the full mocked-vs-real table.

## What to click first

1. `/upload` → pick the **Mia** sample clip → watch the streaming validation panel render `primary_signals` and `confidence`, then land in Kitchen Mob.
2. `/upload` → **Jake** → see the borderline path that routes to operator review.
3. `/upload` → **Sam** → see the friendly auto-reject with stated reasons.
4. `/operator/review` → approve/reject one of the 3 borderline items.
5. `/architecture` → hover any node — side panel reacts.
6. `/impact` → drag the slider, watch the spend breakdown recompute.
7. ⌘K (or click search in TopNav) → free-text search with mob/modality filters.

## What's built right now

**Stack:** Next.js 15 (App Router, Turbopack) + TypeScript + Tailwind v4 with custom design tokens + `motion/react` + Geist + Instrument Serif. Project lives at `/Users/ben.kang/dev/labs/web`.

**Dev server:** running on `http://localhost:3000` (background process, may need to be restarted on a fresh session — `cd web && npx --no-install next dev`).

**Routes — all 12 compile clean and return 200:**

| Route | State |
|---|---|
| `/` | Built — landing with hero, mob strip, recent feed, quiet pitch row |
| `/upload` | Built — drop zone + 3 sample clips (Mia/Jake/Sam) + streaming Pegasus simulation + presenter override in collapsed details |
| `/me` | Built — stubbed to Kitchen Mob, banner + feed |
| `/mobs` | Built — 8-mob grid, marketing-owns-taxonomy callout |
| `/mobs/[mobId]` | Built — mob banner, feed, cross-mob suggestions |
| `/v/[videoId]` | Built — player, validation rail, "more like this in your mob" |
| `/search` | Built — free-text search with modality + operator + mob filters; ⌘K palette in TopNav opens it |
| `/operator/review` | Built — 3 borderline submissions, Pegasus reasoning inline, approve/reject controls, decisions log |
| `/architecture` | Built — Bedrock-only diagram, 14 nodes, side panel updates on hover/click |
| `/impact` | Built — slider with 5 named tiers, live spend recompute, SA-impact callout |
| `/whats-next` | Built — 4 cards (ingestion, AI-detect, taxonomy, analytics) with mocked previews |

**Mock data:** `web/src/lib/{mobs,videos,types}.ts`. 8 mobs, 24 videos with persona-style captions and validation reasoning, 3 review-queue items. Sample video URLs use Google's public CDN (gtv-videos-bucket).

**No real TwelveLabs integration yet** — all model behavior is faithfully simulated (streaming structure, schema shape, response timing) but no SDK calls. Next phase wires this in.

## Most recent user feedback (2026-05-09)

1. UI looks good overall.
2. The "Demo Verdict picker" on `/upload` was confusing → **fixed**. Replaced with three sample-clip cards (Mia/Jake/Sam) where picking one provides both a test clip and the bound outcome. Presenter override moved into a discreet `<details>` block.
3. Couldn't test upload before the fix — needed milk content to drop in. Sample clips solve this.
4. Mob gradients land well.
5. Microcopy voice acceptable.
6. `/architecture` review parked for later.

## Immediate next step (when conversation resumes)

User is testing the refactored `/upload` flow. Wait for their feedback on:
- Does the sample-clip card row read as a real product affordance, not a demo crutch?
- Does the Mia → Kitchen Mob auto-approve transition land?
- Does the Jake → review and Sam → reject flow each tell its beat clearly?

After that, candidate next moves (in rough priority):
1. **Backend integration with the TwelveLabs SDK** — wire real Marengo + Pegasus calls behind the existing API surface. This is what the user originally framed as "scaffolding + backend infra where the 12labs sdk / api serves as the backbone."
2. **Iterate on `/architecture` interactivity** when user is ready to review it.
3. **Build out Beat 8 (`/whats-next` live previews)** — explicitly last per [DEMO.md](DEMO.md).

## Tasks alive on disk (not in TaskList — those don't survive compact)

- Wire TwelveLabs Node SDK in Next.js API routes (Phase 1 backend, see [WEBAPP.md](WEBAPP.md) → "TwelveLabs as the Backbone").
- Persist Video / Validation / MobAssignment / EmbeddingPointer to a real DB (Postgres + Prisma proposed; SQLite acceptable for v1 scaffold).
- Replace mocked search with real Marengo `/search` once SDK is wired.
- Replace simulated Pegasus streaming with real `analyze_stream()` calls.

## Decisions log (recent, durable)

- **Phase framing replaces iteration framing.** Everything ships inside one web app — no separate deck. See PROJECT.md → "Build Phases."
- **Bedrock-only for `/architecture`** — direct-API toggle was rejected. PROJECT.md → Build Phases / Phase 2.
- **Free-text search promoted to a first-class beat (5.5).** Required surface in the demo. DEMO.md.
- **AI-detection in iteration 1: no.** Lives in `/whats-next`, built last after Beats 1–7 verified. DEMO.md → Beat 8 + Build Order Implication.
- **Demo verdict picker removed; sample clips replace it.** 2026-05-09.
- **Design bar named: VC-startup-grade with Linear/Stripe/Vercel/Arc/Cash-App as references.** DESIGN.md → "The Bar."

## Operating rules already in effect (don't relitigate)

- No project-specific content in user-level memory at `~/.claude/.../memory/` unless user explicitly says so. Project memory lives here in `/Users/ben.kang/dev/labs/*.md`.
- DESIGN.md is non-negotiable — no AI slop, must clear the screenshot/cold-open/demo-day/30-second sniff tests.
- The deliverable is the web app, not slides. The web app must carry every demo beat.
- Every demo beat in DEMO.md must remain a navigable surface in the app — confirmed user rule.

## How to fully resume

1. Read this file (you are here).
2. Skim [PROJECT.md](PROJECT.md) for the assignment + phases + locked decisions.
3. Skim [DEMO.md](DEMO.md) for the beats and what each surface must demonstrate.
4. Skim [WEBAPP.md](WEBAPP.md) for the IA + tech stack + open product decisions.
5. [DESIGN.md](DESIGN.md) and [TWELVELABS.md](TWELVELABS.md) are reference; consult when needed.
6. Ask the user what they want to work on next, or wait for their feedback on the most-recent change above.
