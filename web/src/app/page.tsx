import Link from "next/link";
import { MOBS } from "@/lib/mobs";
import { VIDEOS } from "@/lib/videos";
import { VideoCard } from "@/components/VideoCard";
import { MobCard } from "@/components/MobCard";

export default function Landing() {
  const recent = [...VIDEOS]
    .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
    .slice(0, 8);
  const totalMembers = MOBS.reduce((sum, m) => sum + m.memberCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-12 sm:pt-20 pb-14 sm:pb-20 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 mb-6 text-[12px] tracking-[0.16em] uppercase text-whisper">
            <span className="w-1.5 h-1.5 rounded-full bg-mood" />
            A tribute to 1993, built for 2026
          </div>
          <h1 className="font-display text-[56px] sm:text-[88px] lg:text-[112px] leading-[0.92] tracking-tight text-balance">
            <span className="not-italic font-sans font-medium tracking-tight">got&nbsp;milk</span>
            <span className="text-mood">?</span>
            <br />
            <span className="italic">find your mob.</span>
          </h1>
          <p className="mt-6 text-[16px] sm:text-[18px] text-whisper max-w-[58ch] text-pretty leading-relaxed">
            Drop a clip with the campaign hashtag. We watch it, listen to it, and decide
            in seconds whether it belongs — and which mob to send it to. Powered by
            TwelveLabs Marengo and Pegasus.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 h-12 px-5 rounded-md bg-ink text-paper hover:bg-ink-2 text-[15px] font-medium transition-colors"
            >
              Drop your milk moment
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/mobs"
              className="inline-flex items-center gap-2 h-12 px-4 rounded-md ring-edge-strong text-ink hover:bg-paper-2 text-[14px] font-medium transition-colors"
            >
              Browse the mobs
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Stat label="mobs" value={MOBS.length.toString()} />
            <Stat label="participants" value={totalMembers.toLocaleString()} />
            <Stat label="auto-validated" value="98.4%" />
          </dl>
        </div>

        <div className="lg:col-span-5">
          <HeroMontage />
        </div>
      </section>

      {/* Mob strip */}
      <section className="py-10 border-t border-edge">
        <SectionHead
          eyebrow="The mobs"
          title="Eight mobs. One campaign."
          desc="Each mob is its own corner of the campaign — assigned automatically by Pegasus when you upload."
          href="/mobs"
          hrefLabel="Explore all"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOBS.slice(0, 4).map((m) => (
            <MobCard key={m.slug} mob={m} size="sm" />
          ))}
        </div>
      </section>

      {/* Recent submissions */}
      <section className="py-14 border-t border-edge">
        <SectionHead
          eyebrow="Just dropped"
          title="The campaign, in real time."
          desc="Every clip here was validated by Pegasus 1.5 against the campaign brief, then sorted into a mob."
          href="/search"
          hrefLabel="Search the campaign"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {recent.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Quiet pitch row */}
      <section className="py-14 border-t border-edge">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[44px] sm:text-[56px] leading-[0.95] text-balance">
              Built on a backbone that <span className="italic">understands video.</span>
            </h2>
            <p className="mt-5 text-[15.5px] text-whisper text-pretty max-w-[48ch] leading-relaxed">
              TwelveLabs Marengo finds the moment. Pegasus reasons about it.
              Both run on AWS Bedrock with cross-region inference — your data and
              every model call stays inside your AWS account.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md ring-edge-strong hover:bg-paper-2 text-[13.5px] font-medium transition-colors"
              >
                See the architecture
              </Link>
              <Link
                href="/impact"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-[13.5px] font-medium text-ink hover:text-mood transition-colors"
              >
                See the impact →
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-3">
            <PowerCard
              k="Marengo 3.0"
              v="Multimodal retrieval & embeddings — visual, audio, transcription. 36+ languages, audio up to 4 hours."
            />
            <PowerCard
              k="Pegasus 1.5"
              v="Video-language reasoning, structured JSON responses, streaming output. The validator and the classifier."
            />
            <PowerCard
              k="On Bedrock"
              v="Cross-region inference. Customer data never leaves the AWS account. Compliance-ready, quota-relevant."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.18em] text-whisper-2">{label}</dt>
      <dd className="font-display text-[36px] leading-none mt-1.5">{value}</dd>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div className="max-w-[62ch]">
        <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">{eyebrow}</div>
        <h2 className="mt-2 font-display text-[36px] sm:text-[44px] leading-[1.02] text-balance">{title}</h2>
        <p className="mt-3 text-[14px] text-whisper text-pretty leading-relaxed">{desc}</p>
      </div>
      <Link
        href={href}
        className="text-[13px] font-medium text-ink hover:text-mood transition-colors"
      >
        {hrefLabel} →
      </Link>
    </div>
  );
}

function PowerCard({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-cream p-5 ring-edge">
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Component</div>
      <div className="font-display text-[24px] leading-none mt-1.5">{k}</div>
      <p className="mt-3 text-[12.5px] text-ink-2 leading-relaxed text-pretty">{v}</p>
    </div>
  );
}

function HeroMontage() {
  return (
    <div className="grid grid-cols-3 gap-2 aspect-square">
      <div className="grad-kitchen grain ring-edge rounded-lg col-span-2 row-span-2 relative" />
      <div className="grad-skate grain ring-edge rounded-lg relative" />
      <div className="grad-dance grain ring-edge rounded-lg relative" />
      <div className="grad-beach grain ring-edge rounded-lg relative" />
      <div className="grad-pet grain ring-edge rounded-lg relative" />
      <div className="grad-outdoors grain ring-edge rounded-lg relative" />
    </div>
  );
}
