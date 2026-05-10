"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Per-video unit costs in USD — illustrative, defended by industry-standard
// public pricing. Real numbers will land via the SA in the final deck.
const COST = {
  s3: 0.000023, // $/GB-month, ~50MB/video, charged once
  lambda: 0.0000002, // $/invocation, ~6 invocations/video pipeline
  bedrockTokens: 0.0042, // $/video, Pegasus structured analyze (~6k tokens)
  bedrockEmbed: 0.0011, // $/video, Marengo embeddings
  opensearch: 0.000004, // $/video index op
  cloudfront: 0.00045, // $/video egress (HLS streaming + thumbnail)
  ddb: 0.000002, // $/video write+read
};

const SLIDER_LABELS: { v: number; label: string }[] = [
  { v: 250, label: "Soft launch" },
  { v: 1000, label: "Steady week-1" },
  { v: 10000, label: "Trending" },
  { v: 100000, label: "Super Bowl spike" },
  { v: 500000, label: "Generational moment" },
];

export default function ImpactPage() {
  const [perDay, setPerDay] = useState(10000);
  const monthly = perDay * 30;

  const breakdown = useMemo(() => {
    const m = monthly;
    return [
      { service: "Bedrock — Pegasus", cost: m * COST.bedrockTokens, hex: "#16140f", note: "structured analyze (validation + classify)" },
      { service: "Bedrock — Marengo", cost: m * COST.bedrockEmbed, hex: "#2b261d", note: "embeddings + search" },
      { service: "CloudFront", cost: m * COST.cloudfront, hex: "#e73e2d", note: "HLS streaming + thumbnails" },
      { service: "S3", cost: m * COST.s3 * 50, hex: "#e98c5e", note: "raw video at rest, ~50MB/video" },
      { service: "Lambda", cost: m * COST.lambda * 6, hex: "#e8b84b", note: "ingest + validate + classify + embed + search" },
      { service: "OpenSearch", cost: m * COST.opensearch * 8, hex: "#4f7c4a", note: "vector index ops" },
      { service: "DynamoDB", cost: m * COST.ddb * 8, hex: "#5b6cff", note: "video, validation, mob assignment" },
    ];
  }, [monthly]);

  const total = breakdown.reduce((s, b) => s + b.cost, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Impact</div>
      <h1 className="mt-2 font-display text-[48px] sm:text-[68px] leading-[0.95] text-balance">
        Quota-relevant <span className="italic">at every scale.</span>
      </h1>
      <p className="mt-3 text-[15px] text-whisper text-pretty max-w-[64ch] leading-relaxed">
        Drag the slider to size the campaign. Every dollar lands inside the
        customer&apos;s AWS account — Bedrock, S3, Lambda, CloudFront, and OpenSearch
        consumption rolls up under existing commitments.
      </p>

      <div className="mt-10 rounded-2xl ring-edge bg-cream p-6 sm:p-8">
        <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <label className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">Submissions per day</label>
            <div className="mt-1 font-display text-[68px] sm:text-[88px] leading-none tabular-nums">
              {perDay.toLocaleString()}
            </div>
            <div className="text-[12.5px] text-whisper mt-2">
              ≈ {monthly.toLocaleString()} per month · {(monthly * 12).toLocaleString()} per year
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">Projected monthly</div>
            <div className="font-display text-[44px] sm:text-[60px] leading-none mt-1 tabular-nums">
              ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[12.5px] text-whisper mt-1">
              ${(total * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} annualized
            </div>
          </div>
        </div>

        <div className="mt-7">
          <input
            type="range"
            min={100}
            max={500000}
            step={100}
            value={perDay}
            onChange={(e) => setPerDay(Number(e.target.value))}
            className="w-full accent-mood"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {SLIDER_LABELS.map((s) => (
              <button
                key={s.v}
                onClick={() => setPerDay(s.v)}
                className="text-[11px] uppercase tracking-[0.14em] text-whisper hover:text-ink"
              >
                {s.label}
                <div className="text-[10.5px] tabular-nums text-whisper-2 normal-case tracking-normal">
                  {s.v.toLocaleString()}/day
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Breakdown bar */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">Spend breakdown</div>
          <div className="mt-3 h-12 rounded-md overflow-hidden flex ring-edge">
            {breakdown.map((b) => (
              <div
                key={b.service}
                title={`${b.service} — $${b.cost.toFixed(0)}`}
                style={{
                  width: `${(b.cost / total) * 100}%`,
                  background: b.hex,
                }}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {breakdown
              .slice()
              .sort((a, b) => b.cost - a.cost)
              .map((b) => (
                <li key={b.service} className="grid grid-cols-[12px_1fr_auto] gap-3 items-baseline">
                  <span className="w-3 h-3 rounded-sm" style={{ background: b.hex }} />
                  <div>
                    <div className="text-[13.5px] font-medium">{b.service}</div>
                    <div className="text-[12px] text-whisper">{b.note}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-[14.5px] font-medium">${b.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-[11.5px] text-whisper-2">{((b.cost / total) * 100).toFixed(1)}%</div>
                  </div>
                </li>
              ))}
          </ul>
          <p className="mt-4 text-[11.5px] text-whisper-2 leading-relaxed max-w-[60ch]">
            Illustrative unit costs based on public pricing. Production deal-sizing lands
            with the AWS SA team using customer-specific commitments and tier discounts.
          </p>
        </div>

        {/* SA story callout */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-ink text-paper p-6">
            <div className="text-[11px] uppercase tracking-[0.16em] text-paper/70">For the AWS SA</div>
            <div className="mt-2 font-display text-[28px] leading-[1.05] text-balance">
              <span className="italic">Bedrock-led deal,</span> standard AWS commit on the supporting cast.
            </div>
            <ul className="mt-4 space-y-2 text-[13px] leading-snug text-paper/90">
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Bedrock token spend ≈ <span className="font-medium text-paper">${(breakdown[0].cost + breakdown[1].cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span> at this volume — anchors the deal.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />CloudFront + S3 + Lambda is steady recurring spend, easy to commit-discount.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />OpenSearch + DynamoDB scale linearly with submissions — predictable ARR.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Cross-region inference unlocks compliance asks without account-level rework.</li>
            </ul>
          </div>
          <div className="rounded-xl ring-edge p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">For the customer</div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-pretty">
              Spend scales with engagement, not a flat platform fee. A campaign that
              doesn&apos;t take off doesn&apos;t cost much; one that takes off pays for
              itself in earned reach.
            </p>
            <Link
              href="/architecture"
              className="mt-3 inline-flex items-center text-[13px] font-medium text-ink hover:text-mood"
            >
              See the architecture →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
