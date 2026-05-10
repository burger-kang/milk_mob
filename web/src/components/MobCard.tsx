"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Mob } from "@/lib/types";
import { videosByMob } from "@/lib/videos";
import { cn } from "@/lib/utils";

export function MobCard({ mob, size = "md" }: { mob: Mob; size?: "sm" | "md" }) {
  const hero = videosByMob(mob.slug)[0];
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

  return (
    <Link
      href={`/mobs/${mob.slug}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className="group block rounded-xl overflow-hidden ring-edge bg-ink relative isolate transition-transform duration-200 hover:-translate-y-1"
    >
      <div className={cn("relative", size === "sm" ? "aspect-[4/5]" : "aspect-[5/6]", mob.gradientClass, "grain")}>
        {hero && (
          <video
            ref={ref}
            src={hero.videoUrl}
            playsInline
            loop
            preload="none"
            muted
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              hovering ? "opacity-65" : "opacity-0",
            )}
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-paper">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-paper/85">Milk Mob</span>
            <span className="text-[11px] font-mono bg-ink/40 backdrop-blur px-1.5 py-0.5 rounded">
              {mob.memberCount} members
            </span>
          </div>
          <div>
            <h3 className="font-display text-[34px] leading-[0.95] not-italic text-paper">
              <span className="italic">{mob.name.replace(" Mob", "")}</span>
              <span className="block text-[13px] font-sans not-italic mt-2 text-paper/85 leading-snug max-w-[36ch] text-pretty">
                {mob.description}
              </span>
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mob.vibeTags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10.5px] tracking-wider uppercase bg-paper/12 backdrop-blur px-1.5 py-0.5 rounded ring-1 ring-paper/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/15 pointer-events-none" />
      </div>
    </Link>
  );
}
