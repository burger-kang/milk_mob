"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { mobBySlug } from "@/lib/mobs";
import type { Video } from "@/lib/types";
import { cn, formatDuration, relativeTime } from "@/lib/utils";

export function VideoCard({
  video,
  showMob = true,
  size = "md",
}: {
  video: Video;
  showMob?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mob = mobBySlug(video.mob)!;
  const ref = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);

  const handleEnter = () => {
    setHovering(true);
    if (ref.current) {
      ref.current.muted = true;
      ref.current.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    setHovering(false);
    if (ref.current) {
      ref.current.pause();
      ref.current.currentTime = 0;
    }
  };

  const aspect = size === "sm" ? "aspect-[4/5]" : "aspect-[3/4]";

  return (
    <Link
      href={`/v/${video.id}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className="group block rounded-lg overflow-hidden ring-edge bg-ink/95 relative isolate transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className={cn("relative", aspect, mob.gradientClass, "grain")}>
        <video
          ref={ref}
          src={video.videoUrl}
          playsInline
          loop
          preload="none"
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            hovering ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Always-on overlay frame so it never looks blank */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 text-paper">
          <div className="flex items-start justify-between gap-2">
            {showMob && (
              <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium bg-paper/15 backdrop-blur px-2 py-0.5 rounded-full ring-edge">
                {mob.name.replace(" Mob", "")}
              </span>
            )}
            <span className="text-[11px] font-mono bg-ink/40 backdrop-blur px-1.5 py-0.5 rounded">
              {formatDuration(video.durationSec)}
            </span>
          </div>
          <div>
            <p className="text-[13.5px] leading-snug text-pretty line-clamp-3 text-paper drop-shadow-sm">
              {video.caption}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-paper/85">
              <span>{video.user.handle}</span>
              <span>{relativeTime(video.uploadedAt)}</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent pointer-events-none" />
      </div>
    </Link>
  );
}
