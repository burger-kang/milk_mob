# Design and Engineering Standards

Anything user-facing built for this project — demo UI, presentation assets, code samples shown to stakeholders — must clear a real design and engineering bar. The presentation lands in front of an AWS account team and a customer; perceived polish is part of the pitch.

## The Bar — VC-Startup-Grade

The work must be indistinguishable from a Series A consumer/B2B startup's flagship product. If a YC partner, an a16z/Sequoia investor, or a senior designer at one of the reference companies below saw this app on demo day cold, they should not be able to identify it as a demo, an interview project, or an AI-generated artifact. They should assume a small team has been building it for 6–12 months.

**Reference companies (the bar to clear):**

- **Linear** — interaction density, motion fidelity, keyboard-first feel, type rhythm.
- **Stripe** — typography hierarchy, microcopy voice, dashboard composure.
- **Vercel** — restraint, monochrome confidence, performance as a brand attribute.
- **Arc / The Browser Company** — playful but considered motion, novel interactions that don't sacrifice clarity.
- **Cash App / Cron / Raycast** — consumer-grade polish with engineering-grade speed.

The product doesn't have to mimic any of these aesthetically — it has to land at their *altitude* of care.

**Negative reference (auto-fail signals):**

- Default Vercel/Next.js starter look (any unmodified `create-next-app` aesthetic).
- Tailwind UI / Flowbite / Material drop-ins unmodified.
- AI-suggested color palettes (purple+pink gradient, "modern" sans-serif over a stock photo, "trust badge" rows).
- Generic icon dump from Lucide/Heroicons on every card.
- Stock Unsplash hero imagery, especially with overlay-darken-50%.
- Hero-then-three-feature-cards-then-CTA layout. This is the AI-slop flagship.
- Microcopy in the Voice of the LLM ("Empower your team to..." / "Seamlessly...").

**Sniff tests — apply continuously:**

1. **Screenshot test.** If I screenshot the app and put it next to a screenshot of the reference companies' apps, does it feel like the same tier? If it visibly drops a tier, it fails.
2. **Cold-open test.** Imagine someone landing on the app with zero context. Within 5 seconds, do they think "this is a real product I haven't heard of yet" or "this is a demo / hackathon project / template"? Only the first answer passes.
3. **Demo-day partner test.** If a YC partner asked "what would you change?", the answer should be specific opinions about taste — not "we'd polish the UI." If polish is the obvious gap, we're below the bar.
4. **The 30-second rule.** Every screen, every interaction has a moment that makes the audience lean in within 30 seconds. If a screen has no such moment, it's filler and should be cut or upgraded.

If any sniff test fails, that's a blocker — flag it, don't ship past it.

## Hard Rules (explicit from user)

- **No "AI slop."** No generic gradients, no out-of-the-box Tailwind palettes used as-is, no lorem ipsum, no stock placeholder copy, no emoji-stuffed sections, no template-feeling layouts (hero / 3-feature-grid / CTA stack). Make intentional design choices.
- **Modern design sensibility.** Clean type hierarchy, deliberate spacing, considered color palette, real content.
- **Responsive.** Works well across mobile, tablet, and desktop. Don't ship desktop-only layouts.
- **Engaging and catchy.** Visual interest, smooth interactions, thoughtful micro-animations where they add to the experience — never for their own sake.
- **Best engineering performance practices.** Fast initial load, lazy-load heavy assets (especially video — every Milk Mob screen is video-heavy), code-split where it helps, avoid render-blocking work, mind bundle size.

## Inferred Standards (apply unless overridden)

These follow from the campaign brief (large social media platform, both millennial and younger audiences, presented to a non-technical stakeholder slice):

- **Mobile-first.** The customer is a social media platform; the demo should feel native to that context.
- **Accessibility baseline.** Semantic HTML, keyboard navigation, sufficient color contrast, alt text. Not optional.
- **Designed loading / empty / error states.** TwelveLabs indexing and async embedding tasks take time. The UX of waiting must feel intentional, not broken — skeletons, progress, friendly messaging for failures.
- **Real content over placeholders.** Plausible mob names, plausible video titles, plausible user handles. Lorem ipsum and "Card 1 / Card 2" undermine the demo.
- **Cross-generational visual language.** Don't lean exclusively retro-millennial (the nostalgia angle) or exclusively Gen-Z. Balance both.
- **Demo polish matters disproportionately.** Rough edges in the UI will read as rough edges in the TwelveLabs story.

## How to Apply

- Default to thoughtful design tokens (custom palette, type scale) over framework defaults.
- Before committing to a component or layout, ask whether it feels templated. If yes, make it more specific to the campaign.
- For perf, measure or reason about it — don't ship an unbounded video grid, don't render the whole feed at once, don't block on synchronous TwelveLabs calls.
- If a tradeoff between "fast to ship" and "feels polished" comes up, surface it explicitly. Don't silently pick the quick option.
- If the user adds rules later that overlap with anything inferred above, the user's version becomes canonical.
