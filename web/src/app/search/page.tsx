"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VIDEOS } from "@/lib/videos";
import { MOBS, mobBySlug } from "@/lib/mobs";
import { VideoCard } from "@/components/VideoCard";
import { cn } from "@/lib/utils";

type Modality = "visual" | "audio" | "transcription";

const MODALITY_LABELS: Record<Modality, string> = {
  visual: "Visual",
  audio: "Audio",
  transcription: "Transcription",
};

const SUGGESTIONS = [
  "slow-motion milk pour, golden hour",
  "kids laughing, kitchen mess",
  "skate trick at sunset",
  "campfire toast, mountains",
  "ballet routine ending in a sip",
  "someone saying got milk",
];

function score(query: string, fields: string[]) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  let s = 0;
  for (const t of tokens) {
    for (const f of fields) {
      if (f.toLowerCase().includes(t)) s += t.length / 3;
    }
  }
  return s;
}

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [active, setActive] = useState<Modality[]>(["visual", "audio", "transcription"]);
  const [op, setOp] = useState<"or" | "and">("or");
  const [mobFilter, setMobFilter] = useState<string>("all");

  useEffect(() => setQuery(initial), [initial]);

  const results = useMemo(() => {
    if (!query.trim()) return [] as typeof VIDEOS;
    return VIDEOS
      .map((v) => {
        const fields = [
          v.caption,
          ...v.vibeTags,
          ...v.validation.primarySignals,
          mobBySlug(v.mob)?.name ?? "",
          mobBySlug(v.mob)?.description ?? "",
          v.user.handle,
        ];
        return { v, s: score(query, fields) };
      })
      .filter((r) => r.s > 0)
      .filter((r) => mobFilter === "all" || r.v.mob === mobFilter)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.v);
  }, [query, mobFilter]);

  const submit = (q: string) => {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`);
  };

  const toggleMod = (m: Modality) =>
    setActive((cur) => cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Search the campaign</div>
      <h1 className="mt-2 font-display text-[44px] sm:text-[60px] leading-[0.98] text-balance">
        Find any moment. <span className="italic">Across every mob.</span>
      </h1>
      <p className="mt-3 text-[14.5px] text-whisper text-pretty max-w-[60ch] leading-relaxed">
        One free-text query runs cross-modal against visual, audio, and transcription
        on every clip in the campaign — powered by Marengo 3.0.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(query); }}
        className="mt-7 rounded-xl ring-edge-strong bg-paper-2/40 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-edge bg-paper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-whisper">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            autoFocus
            placeholder="ballet routine ending in a sip…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-whisper-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => submit("")}
              className="text-[12px] text-whisper hover:text-ink"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="h-10 px-3.5 rounded-md bg-ink text-paper hover:bg-ink-2 text-[13px] font-medium"
          >
            Search
          </button>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
          <div className="flex items-center gap-2">
            <span className="text-whisper-2 uppercase tracking-[0.14em] text-[10.5px]">Modalities</span>
            {(["visual", "audio", "transcription"] as Modality[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMod(m)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[12px] transition-colors",
                  active.includes(m)
                    ? "bg-ink text-paper"
                    : "ring-edge text-whisper hover:text-ink",
                )}
              >
                {MODALITY_LABELS[m]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-whisper-2 uppercase tracking-[0.14em] text-[10.5px]">Operator</span>
            <button
              type="button"
              onClick={() => setOp("or")}
              className={cn("h-7 px-2.5 rounded-full text-[12px]",
                op === "or" ? "bg-ink text-paper" : "ring-edge text-whisper hover:text-ink",
              )}
            >
              or
            </button>
            <button
              type="button"
              onClick={() => setOp("and")}
              className={cn("h-7 px-2.5 rounded-full text-[12px]",
                op === "and" ? "bg-ink text-paper" : "ring-edge text-whisper hover:text-ink",
              )}
            >
              and
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-whisper-2 uppercase tracking-[0.14em] text-[10.5px]">Mob</span>
            <select
              value={mobFilter}
              onChange={(e) => setMobFilter(e.target.value)}
              className="h-7 px-2 rounded-md ring-edge bg-paper text-[12.5px]"
            >
              <option value="all">All mobs</option>
              {MOBS.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {!query.trim() && (
        <div className="mt-10">
          <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2 mb-3">Try one of these</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="px-3 h-9 rounded-full ring-edge text-[12.5px] hover:bg-paper-2 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.trim() && (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-2 text-[12px] text-whisper">
            <span>
              {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="text-ink font-medium">&ldquo;{query}&rdquo;</span>
            </span>
            <span className="font-mono text-[11px]">marengo 3.0 · {active.join("+")} · {op}</span>
          </div>
          {results.length === 0 ? (
            <div className="mt-8 rounded-xl bg-cream ring-edge p-8 text-center">
              <div className="font-display text-[28px]">Nothing yet.</div>
              <p className="mt-2 text-[13px] text-whisper">
                Try a more loose query, or toggle a different modality.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {results.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
