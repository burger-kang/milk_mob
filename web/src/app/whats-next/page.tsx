import Link from "next/link";
import { MOBS } from "@/lib/mobs";

export default function WhatsNextPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">What&apos;s next</div>
      <h1 className="mt-2 font-display text-[48px] sm:text-[68px] leading-[0.95] text-balance">
        After today&apos;s campaign, <span className="italic">three things land.</span>
      </h1>
      <p className="mt-3 text-[15px] text-whisper text-pretty max-w-[64ch] leading-relaxed">
        Iteration 1 is upload-only. The live previews below are placeholders —
        they get built once the customer-facing core has shipped and verified.
        Each is honest about what TwelveLabs can do today and what we&apos;d pair
        it with.
      </p>

      <section className="mt-10 grid lg:grid-cols-2 gap-6">
        <Card
          tag="01"
          title="Platform ingestion"
          headline="Auto-pull tagged posts from Instagram and TikTok."
          body="Subscribe to campaign hashtags across platforms; new posts flow into the same validate-and-assign pipeline you saw on /upload. Real-API access via Meta Graph and TikTok Display/Research; demo lane simulates inbound."
          status="Build after Phase 1"
          accent="bg-honey"
          mock={<IngestQueueMock />}
        />
        <Card
          tag="02"
          title="AI-generated content detection"
          headline="Tell real participation from synthetic submissions."
          body={
            <>
              Pegasus 1.5 with a structured-response schema looks for generative
              artifacts (audio-lip mismatch, hand morphology, motion smoothness)
              and returns evidence-backed authenticity. Honest about scope:
              production-grade detection pairs Pegasus with a dedicated
              detector for accuracy.
            </>
          }
          status="Build last — verify all other beats first"
          accent="bg-mood"
          mock={<AiDetectMock />}
        />
        <Card
          tag="03"
          title="Configurable mob taxonomy"
          headline="Marketing owns the mobs."
          body="Drag to add, retire, or rename a mob. The next ingest cycle reclassifies. Marketing controls the brand-safe categories; the model carries them through."
          status="Configurable input — Phase 2"
          accent="bg-leaf"
          mock={<TaxonomyMock />}
        />
        <Card
          tag="04"
          title="Operator analytics"
          headline="Not just decisions — the ground truth that improves them."
          body="Every operator override on the review queue feeds a quarterly tune. Show marketing where the model gets it right, where it doesn't, and what's drifting."
          status="Phase 2"
          accent="bg-night"
          mock={<AnalyticsMock />}
        />
      </section>

      <section className="mt-14 rounded-2xl bg-cream ring-edge p-6 sm:p-10 grid lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7">
          <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Build order</div>
          <h2 className="mt-2 font-display text-[34px] sm:text-[44px] leading-[1.02] text-balance">
            Phase 1 ships first. Then this surface fills in.
          </h2>
          <p className="mt-3 text-[14px] text-whisper text-pretty leading-relaxed max-w-[62ch]">
            We hold this surface as live previews instead of slides because we
            committed to one artifact: the web app. Each card here degrades
            gracefully if the live preview isn&apos;t ready — the surface still
            tells the story.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/upload"
              className="h-10 px-4 inline-flex items-center text-[13px] font-medium rounded-md bg-ink text-paper hover:bg-ink-2"
            >
              Back to the demo →
            </Link>
            <Link
              href="/architecture"
              className="h-10 px-4 inline-flex items-center text-[13px] font-medium text-ink hover:text-mood"
            >
              See the architecture
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 gap-2">
          {MOBS.slice(0, 4).map((m) => (
            <div key={m.slug} className={`${m.gradientClass} grain ring-edge rounded-md aspect-square relative`} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({
  tag,
  title,
  headline,
  body,
  status,
  accent,
  mock,
}: {
  tag: string;
  title: string;
  headline: string;
  body: React.ReactNode;
  status: string;
  accent: string;
  mock: React.ReactNode;
}) {
  return (
    <article className="rounded-xl ring-edge bg-paper-2/30 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-edge">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">{tag} · {title}</div>
            <h3 className="mt-2 font-display text-[28px] sm:text-[32px] leading-[1.05] text-balance">
              <span className="italic">{headline}</span>
            </h3>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] text-paper ${accent}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-paper" />
            {status}
          </span>
        </div>
        <p className="mt-3 text-[13.5px] text-ink-2 leading-relaxed text-pretty max-w-[58ch]">{body}</p>
      </div>
      <div className="p-5 sm:p-6 bg-paper">
        {mock}
      </div>
    </article>
  );
}

function IngestQueueMock() {
  const items = [
    { src: "TikTok", handle: "@livv.dances", caption: "kitchen-to-living-room mini ballet…", in: "32s ago" },
    { src: "Instagram", handle: "@calloway", caption: "kickflip into a sip. one take.", in: "1m ago" },
    { src: "TikTok", handle: "@trailtrina", caption: "summit toast at 11k feet…", in: "3m ago" },
  ];
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Inbound queue (mock)</div>
      <ul className="divide-y divide-edge ring-edge rounded-md">
        {items.map((it, i) => (
          <li key={i} className="p-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-mood" />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] truncate">{it.caption}</div>
              <div className="text-[11px] text-whisper">{it.handle} · via {it.src}</div>
            </div>
            <span className="text-[11px] text-whisper-2">{it.in}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AiDetectMock() {
  return (
    <div className="rounded-md ring-edge p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Sample verdict (mock)</div>
      <div className="flex items-center gap-3 mb-2">
        <span className="font-display text-[24px] tabular-nums">0.81</span>
        <div className="flex-1 h-1.5 bg-paper-2 rounded-full overflow-hidden">
          <div className="h-full bg-mood" style={{ width: "81%" }} />
        </div>
        <span className="text-[11px] uppercase tracking-[0.12em] text-mood">likely AI</span>
      </div>
      <ul className="space-y-1 text-[12.5px]">
        <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />audio-lip mismatch at 00:04</li>
        <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />hand morphology drift at 00:09</li>
        <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />motion smoothness inconsistent with frame-rate</li>
      </ul>
    </div>
  );
}

function TaxonomyMock() {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Editor (read-only mock)</div>
      <ul className="grid grid-cols-2 gap-2 text-[13px]">
        {MOBS.map((m) => (
          <li key={m.slug} className="rounded-md ring-edge px-3 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.accentHex }} />
            {m.name}
          </li>
        ))}
        <li className="rounded-md ring-edge ring-dashed px-3 py-2 text-whisper italic flex items-center gap-2">
          + add mob
        </li>
      </ul>
    </div>
  );
}

function AnalyticsMock() {
  const bars = [42, 28, 60, 34, 51, 22, 38];
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Operator overrides — last 7 days</div>
      <div className="flex items-end gap-1.5 h-20">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-t" style={{ height: `${b}%`, background: i === 2 ? "#e73e2d" : "#2b261d" }} />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10.5px] text-whisper-2">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  );
}
