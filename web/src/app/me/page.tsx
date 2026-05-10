import Link from "next/link";
import { redirect } from "next/navigation";
import { mobBySlug } from "@/lib/mobs";
import { videosByMob } from "@/lib/videos";
import { VideoCard } from "@/components/VideoCard";

const ASSIGNED_MOB = "kitchen" as const; // stub: in v1 tied to a single demo identity

export default function MyMobPage() {
  const mob = mobBySlug(ASSIGNED_MOB);
  if (!mob) redirect("/upload");
  const videos = videosByMob(ASSIGNED_MOB);

  return (
    <div>
      {/* Mob banner */}
      <section className={`relative ${mob.gradientClass} grain text-paper`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-[11px] uppercase tracking-[0.18em] text-paper/80">Your mob</div>
          <div className="mt-3 flex items-end justify-between gap-6 flex-wrap">
            <h1 className="font-display text-[56px] sm:text-[88px] leading-[0.92]">
              <span className="italic">{mob.name.replace(" Mob", "")}</span>
              <span className="text-paper/80"> Mob</span>
            </h1>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.16em] text-paper/70">Members</div>
              <div className="font-display text-[40px] leading-none">{mob.memberCount}</div>
            </div>
          </div>
          <p className="mt-3 max-w-[58ch] text-[14.5px] text-paper/90 text-pretty leading-relaxed">
            {mob.description}
          </p>
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {mob.vibeTags.map((t) => (
              <span
                key={t}
                className="text-[11px] tracking-wider uppercase bg-paper/12 backdrop-blur px-2 py-0.5 rounded ring-1 ring-paper/25"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-2">
            <Link
              href={`/mobs/${mob.slug}`}
              className="h-10 px-4 rounded-md bg-paper text-ink hover:bg-paper-2 inline-flex items-center text-[13px] font-medium"
            >
              About this mob
            </Link>
            <Link
              href="/upload"
              className="h-10 px-4 rounded-md ring-1 ring-paper/40 hover:bg-paper/10 text-paper inline-flex items-center text-[13px] font-medium"
            >
              Drop another
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Your feed</div>
            <h2 className="mt-1 font-display text-[34px]">More from your mob</h2>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <FilterChip label="Newest" active />
            <FilterChip label="Most playful" />
            <FilterChip label="Closest to yours" subtle />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} showMob={false} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterChip({ label, active, subtle }: { label: string; active?: boolean; subtle?: boolean }) {
  return (
    <button
      className={
        active
          ? "h-8 px-3 rounded-full bg-ink text-paper text-[12px] font-medium"
          : subtle
          ? "h-8 px-3 rounded-full ring-edge text-[12px] text-whisper hover:text-ink"
          : "h-8 px-3 rounded-full ring-edge text-[12px] text-ink hover:bg-paper-2"
      }
    >
      {label}
    </button>
  );
}
