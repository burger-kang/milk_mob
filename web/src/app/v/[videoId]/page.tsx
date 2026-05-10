import Link from "next/link";
import { notFound } from "next/navigation";
import { videoById, videosByMob } from "@/lib/videos";
import { mobBySlug } from "@/lib/mobs";
import { VideoCard } from "@/components/VideoCard";
import { formatDuration, relativeTime } from "@/lib/utils";

export default async function VideoDetail({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  const video = videoById(videoId);
  if (!video) notFound();
  const mob = mobBySlug(video.mob)!;
  const similar = videosByMob(video.mob).filter((v) => v.id !== video.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <Link href={`/mobs/${mob.slug}`} className="text-[12px] text-whisper hover:text-ink inline-flex items-center gap-1">
        ← Back to {mob.name}
      </Link>

      <div className="mt-4 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          <div className={`relative aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden ring-edge bg-ink ${mob.gradientClass} grain`}>
            <video
              src={video.videoUrl}
              controls
              playsInline
              poster=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-display text-[24px] leading-tight">{video.user.name}</div>
              <div className="text-[12.5px] text-whisper">
                {video.user.handle} · {relativeTime(video.uploadedAt)} · {formatDuration(video.durationSec)}
              </div>
            </div>
            <Link
              href={`/mobs/${mob.slug}`}
              className="shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-md ring-edge text-[12.5px] hover:bg-paper-2"
            >
              <span className={`w-2.5 h-2.5 rounded-full`} style={{ background: mob.accentHex }} />
              {mob.name}
            </Link>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-pretty max-w-[64ch]">{video.caption}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {video.vibeTags.map((t) => (
              <span key={t} className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full ring-edge text-whisper">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right rail — validation + similarity */}
        <aside className="space-y-5">
          <div className="rounded-xl ring-edge bg-paper-2/40 p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2 mb-2">Validation</div>
            <div className="flex items-center gap-3">
              <span className="font-display text-[28px] tabular-nums">{video.validation.confidence.toFixed(2)}</span>
              <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden">
                <div
                  className="h-full bg-leaf"
                  style={{ width: `${video.validation.confidence * 100}%` }}
                />
              </div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-leaf">approved</span>
            </div>
            <div className="mt-4 space-y-1.5">
              {video.validation.primarySignals.map((s) => (
                <div key={s} className="flex items-start gap-2 text-[12.5px]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf shrink-0" />
                  <span className="leading-snug">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10.5px] font-mono text-whisper-2">campaign_relevance.v1 · pegasus 1.5</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">More like this in your mob</div>
              <span className="text-[10.5px] font-mono text-whisper-2">marengo embed sim</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {similar.map((v) => (
                <VideoCard key={v.id} video={v} showMob={false} size="sm" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
