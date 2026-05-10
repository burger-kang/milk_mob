import Link from "next/link";
import { MOBS } from "@/lib/mobs";
import { VIDEOS } from "@/lib/videos";
import { MobCard } from "@/components/MobCard";

export default function MobsIndex() {
  const totalMembers = MOBS.reduce((sum, m) => sum + m.memberCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div className="max-w-[64ch]">
          <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">All mobs</div>
          <h1 className="mt-2 font-display text-[48px] sm:text-[68px] leading-[0.95] text-balance">
            One campaign, <span className="italic">eight tribes.</span>
          </h1>
          <p className="mt-4 text-[15px] text-whisper text-pretty max-w-[58ch] leading-relaxed">
            Mobs are how the campaign organizes itself. Pegasus reads each
            submission against the campaign brief and a curated taxonomy, then
            sorts videos into mobs that share a vibe — kitchen, skate, beach,
            and beyond.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-6 max-w-md">
          <Stat label="mobs" value={MOBS.length.toString()} />
          <Stat label="members" value={totalMembers.toLocaleString()} />
          <Stat label="videos" value={VIDEOS.length.toString()} />
        </dl>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {MOBS.map((m) => (
          <MobCard key={m.slug} mob={m} />
        ))}
      </div>

      <section className="mt-16 rounded-2xl bg-cream ring-edge p-6 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">For operators</div>
          <h3 className="mt-2 font-display text-[34px] sm:text-[40px] leading-[1.02] text-balance">
            The taxonomy is yours <span className="italic">to shape.</span>
          </h3>
          <p className="mt-3 text-[14px] text-whisper text-pretty max-w-[58ch] leading-relaxed">
            Marketing controls the mob list. Add a mob, retire one, or rebalance
            the brief — the next batch of submissions classifies against your
            updated taxonomy on the next ingest.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Link
              href="/whats-next"
              className="h-10 px-4 rounded-md bg-ink text-paper hover:bg-ink-2 inline-flex items-center text-[13px] font-medium"
            >
              See the taxonomy editor →
            </Link>
            <Link
              href="/operator/review"
              className="h-10 px-4 inline-flex items-center text-[13px] text-ink hover:text-mood font-medium"
            >
              Open operator console
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 gap-2">
          {MOBS.slice(4, 8).map((m) => (
            <div key={m.slug} className={`${m.gradientClass} grain ring-edge rounded-md aspect-square relative`} />
          ))}
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
