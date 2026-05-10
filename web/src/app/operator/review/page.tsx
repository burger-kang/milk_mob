"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { REVIEW_QUEUE } from "@/lib/videos";
import { mobBySlug, MOBS } from "@/lib/mobs";
import { cn, formatDuration, relativeTime } from "@/lib/utils";

type Decision = { id: string; verdict: "approve" | "reject"; mob?: string; at: number };

export default function ReviewQueue() {
  const [active, setActive] = useState(REVIEW_QUEUE[0].id);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const queue = useMemo(
    () => REVIEW_QUEUE.filter((r) => !decisions.find((d) => d.id === r.id)),
    [decisions],
  );
  const item = REVIEW_QUEUE.find((r) => r.id === active) ?? queue[0];

  const decide = (verdict: "approve" | "reject", mob?: string) => {
    if (!item) return;
    setDecisions((d) => [...d, { id: item.id, verdict, mob, at: Date.now() }]);
    const remaining = queue.filter((q) => q.id !== item.id);
    if (remaining[0]) setActive(remaining[0].id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Operator</div>
          <h1 className="mt-2 font-display text-[40px] sm:text-[52px] leading-[0.98] text-balance">
            Review queue
          </h1>
          <p className="mt-2 text-[14px] text-whisper max-w-[58ch] text-pretty">
            Submissions Pegasus flagged below the auto-approve threshold or
            with a brand-safety concern. Each carries the model&apos;s reasoning
            inline — your call is logged and feeds future tuning.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <Stat label="In queue" value={queue.length.toString()} />
          <Stat label="Decided today" value={decisions.length.toString()} />
          <Stat label="Median time" value="38s" />
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="rounded-xl ring-edge bg-paper-2/40 overflow-hidden h-fit">
          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-whisper-2 border-b border-edge bg-paper">
            Pending · {queue.length}
          </div>
          <ul>
            {queue.length === 0 && (
              <li className="px-4 py-8 text-[13px] text-whisper-2 text-center italic">
                Inbox zero. Nice.
              </li>
            )}
            {queue.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setActive(r.id)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-3 py-3 border-b border-edge last:border-b-0 transition-colors",
                    item?.id === r.id ? "bg-paper" : "hover:bg-paper-2/80",
                  )}
                >
                  <span className={cn("w-1 self-stretch rounded-full",
                    r.validation.brandSafetyFlags.length > 0 ? "bg-honey" : "bg-mood")}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-whisper">{r.user.handle}</div>
                    <div className="text-[13px] truncate">{r.caption}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-whisper-2">
                      <span>conf {r.validation.confidence.toFixed(2)}</span>
                      <span>·</span>
                      <span>{formatDuration(r.durationSec)}</span>
                      <span>·</span>
                      <span>{relativeTime(r.uploadedAt)}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <AnimatePresence mode="wait">
            {item ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid lg:grid-cols-[1.2fr_1fr] gap-6"
              >
                <div>
                  <div className="rounded-xl ring-edge bg-ink overflow-hidden aspect-video relative grain">
                    <video
                      key={item.id}
                      src={item.videoUrl}
                      controls
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium">{item.user.name}</div>
                      <div className="text-[12px] text-whisper">{item.user.handle} · {relativeTime(item.uploadedAt)}</div>
                    </div>
                    <span className="ml-auto text-[11px] uppercase tracking-[0.14em] text-honey">In review</span>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-pretty">{item.caption}</p>
                  <div className="mt-3 rounded-md bg-cream ring-edge p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-1">
                      Why this is in review
                    </div>
                    <p className="text-[13px] leading-snug">{item.reasonForReview}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl ring-edge bg-paper-2/40 p-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Pegasus reasoning</div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-display text-[26px] tabular-nums">{item.validation.confidence.toFixed(2)}</span>
                      <div className="flex-1 h-1.5 bg-paper rounded-full overflow-hidden">
                        <div className="h-full bg-honey" style={{ width: `${item.validation.confidence * 100}%` }} />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-honey">borderline</span>
                    </div>
                    {item.validation.primarySignals.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-1">primary_signals[]</div>
                        <ul className="space-y-1">
                          {item.validation.primarySignals.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12.5px]">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-leaf shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.validation.brandSafetyFlags.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-1">brand_safety_flags[]</div>
                        <ul className="space-y-1">
                          {item.validation.brandSafetyFlags.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12.5px]">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-honey shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.validation.rejectionReasons.length > 0 && (
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-1">rejection_reasons[]</div>
                        <ul className="space-y-1">
                          {item.validation.rejectionReasons.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12.5px]">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl ring-edge p-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Your call</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-whisper">Approve into</span>
                        <select
                          className="flex-1 h-9 px-2 rounded-md ring-edge bg-paper text-[13px]"
                          defaultValue=""
                          id="mob-select"
                        >
                          <option value="" disabled>Choose a mob…</option>
                          {MOBS.map((m) => (
                            <option key={m.slug} value={m.slug}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const sel = document.getElementById("mob-select") as HTMLSelectElement | null;
                          decide("approve", sel?.value || undefined);
                        }}
                        className="h-10 px-4 rounded-md bg-leaf text-paper text-[13px] font-medium hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decide("reject")}
                        className="h-10 px-4 rounded-md ring-edge text-[13px] font-medium hover:bg-paper-2"
                      >
                        Reject
                      </button>
                      <button className="h-10 px-4 rounded-md text-[12.5px] text-whisper hover:text-ink">
                        Skip for now
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl ring-edge bg-cream p-4 text-[12.5px] text-ink-2">
                    <div className="font-medium mb-1">Why these decisions matter</div>
                    Operator overrides feed the next-iteration validation tune.
                    Pegasus structured responses are auditable; your label moves the needle.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl ring-edge bg-cream p-12 text-center"
              >
                <div className="font-display text-[40px]">All clear.</div>
                <p className="mt-2 text-[14px] text-whisper">
                  Decisions logged: {decisions.length}.{" "}
                  <Link href="/upload" className="underline">Drop another to test</Link>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {decisions.length > 0 && (
            <div className="mt-8 rounded-xl ring-edge p-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-whisper-2 mb-2">Recent decisions</div>
              <ul className="divide-y divide-edge">
                {decisions.slice().reverse().map((d) => {
                  const r = REVIEW_QUEUE.find((q) => q.id === d.id)!;
                  const m = d.mob ? mobBySlug(d.mob) : null;
                  return (
                    <li key={d.id} className="py-2 flex items-center gap-3 text-[12.5px]">
                      <span className={cn("w-1.5 h-1.5 rounded-full",
                        d.verdict === "approve" ? "bg-leaf" : "bg-mood")}
                      />
                      <span className="flex-1 truncate">{r.user.handle} — {r.caption}</span>
                      <span className="text-whisper">
                        {d.verdict === "approve"
                          ? `→ ${m?.name ?? "approved"}`
                          : "rejected"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[28px] leading-none">{value}</div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-whisper-2 mt-1">{label}</div>
    </div>
  );
}
