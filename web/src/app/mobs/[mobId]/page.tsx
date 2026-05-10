import Link from "next/link";
import { notFound } from "next/navigation";
import { mobBySlug, MOBS } from "@/lib/mobs";
import { videosByMob } from "@/lib/videos";
import { VideoCard } from "@/components/VideoCard";

export default async function MobDetail({ params }: { params: Promise<{ mobId: string }> }) {
  const { mobId } = await params;
  const mob = mobBySlug(mobId);
  if (!mob) notFound();
  const videos = videosByMob(mob.slug);
  const otherMobs = MOBS.filter((m) => m.slug !== mob.slug).slice(0, 4);

  return (
    <div>
      <section className={`relative ${mob.gradientClass} grain text-paper`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <Link href="/mobs" className="text-[12px] text-paper/80 hover:text-paper inline-flex items-center gap-1">
            ← All mobs
          </Link>
          <div className="mt-4 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/80">Milk Mob</div>
              <h1 className="mt-2 font-display text-[60px] sm:text-[96px] leading-[0.92]">
                <span className="italic">{mob.name.replace(" Mob", "")}</span>
              </h1>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.16em] text-paper/70">Members</div>
              <div className="font-display text-[40px] leading-none">{mob.memberCount}</div>
            </div>
          </div>
          <p className="mt-3 max-w-[60ch] text-[15px] text-paper/90 text-pretty leading-relaxed">
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="font-display text-[28px]">Videos in this mob</h2>
          <span className="text-[12px] text-whisper">Marengo similarity feed · {videos.length} clips</span>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} showMob={false} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-14">
        <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Other mobs</div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {otherMobs.map((m) => (
            <Link
              key={m.slug}
              href={`/mobs/${m.slug}`}
              className={`${m.gradientClass} grain ring-edge rounded-lg p-4 aspect-[3/2] flex flex-col justify-between text-paper relative hover:-translate-y-0.5 transition-transform`}
            >
              <span className="text-[10.5px] uppercase tracking-[0.16em] text-paper/85">{m.memberCount} members</span>
              <span className="font-display italic text-[24px] leading-none">{m.name.replace(" Mob", "")}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
