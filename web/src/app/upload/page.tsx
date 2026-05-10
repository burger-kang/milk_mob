"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { MOBS, mobBySlug } from "@/lib/mobs";
import type { MobSlug, ValidationDecision } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "idle" | "uploading" | "indexing" | "validating" | "assigning" | "done";
type OutcomeKey = "approve" | "review" | "reject";

type Outcome = {
  decision: ValidationDecision;
  confidence: number;
  primarySignals: string[];
  rejectionReasons: string[];
  brandSafetyFlags: string[];
  mob: MobSlug | null;
  vibeTags: string[];
};

const OUTCOMES: Record<OutcomeKey, Outcome> = {
  approve: {
    decision: "auto_approve",
    confidence: 0.91,
    primarySignals: [
      "milk visible — gallon jug",
      "creative activity — choreographed pour",
      "audience present — laughter audio",
      "framing intent — homage to original campaign",
    ],
    rejectionReasons: [],
    brandSafetyFlags: [],
    mob: "kitchen",
    vibeTags: ["pour-over", "morning-light", "in-sync"],
  },
  review: {
    decision: "review",
    confidence: 0.54,
    primarySignals: ["milk product visible — carton"],
    rejectionReasons: [],
    brandSafetyFlags: ["no creative-activity signal — static framing"],
    mob: null,
    vibeTags: [],
  },
  reject: {
    decision: "auto_reject",
    confidence: 0.93,
    primarySignals: [],
    rejectionReasons: [
      "no milk product visible at any point in clip",
      "hashtag inconsistent with content",
      "primary activity unrelated to campaign brief",
    ],
    brandSafetyFlags: [],
    mob: null,
    vibeTags: [],
  },
};

type Sample = {
  id: string;
  name: string;
  handle: string;
  caption: string;
  durationSec: number;
  sizeMb: number;
  outcome: OutcomeKey;
  gradientClass: string;
  videoUrl: string;
  byline: string;
};

const SAMPLES: Sample[] = [
  {
    id: "mia",
    name: "Mia O.",
    handle: "@miacooks",
    caption: "9 a.m. choreography with my roommate. cereal does not survive.",
    durationSec: 14,
    sizeMb: 18.4,
    outcome: "approve",
    gradientClass: "grad-kitchen",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    byline: "Auto-approve · Kitchen Mob",
  },
  {
    id: "jake",
    name: "Jake T.",
    handle: "@jakebackyard",
    caption: "love this milk. been drinking it since college.",
    durationSec: 22,
    sizeMb: 24.8,
    outcome: "review",
    gradientClass: "grad-pet",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    byline: "Borderline · sent to operator review",
  },
  {
    id: "sam",
    name: "Sam K.",
    handle: "@hashtagsam",
    caption: "best skate park in the city. milk vibes only #milkmob",
    durationSec: 11,
    sizeMb: 16.2,
    outcome: "reject",
    gradientClass: "grad-skate",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    byline: "Auto-reject · off-brief",
  },
];

type Picked =
  | { kind: "sample"; sample: Sample }
  | { kind: "file"; file: File }
  | null;

export default function UploadPage() {
  const [picked, setPicked] = useState<Picked>(null);
  const [step, setStep] = useState<Step>("idle");
  const [streamedSignals, setStreamedSignals] = useState<string[]>([]);
  const [streamedFlags, setStreamedFlags] = useState<string[]>([]);
  const [streamedRejections, setStreamedRejections] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [hashtag, setHashtag] = useState("#milkmob");
  const [overrideOutcome, setOverrideOutcome] = useState<OutcomeKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const outcomeKey: OutcomeKey =
    overrideOutcome ?? (picked?.kind === "sample" ? picked.sample.outcome : "approve");

  const reset = () => {
    setPicked(null);
    setStep("idle");
    setStreamedSignals([]);
    setStreamedFlags([]);
    setStreamedRejections([]);
    setConfidence(0);
    setOverrideOutcome(null);
  };

  const startFlow = async () => {
    if (!picked) return;
    const outcome = OUTCOMES[outcomeKey];
    setStep("uploading");
    await wait(900);
    setStep("indexing");
    await wait(900);
    setStep("validating");

    for (let i = 0; i < outcome.primarySignals.length; i++) {
      await wait(380);
      setStreamedSignals((prev) => [...prev, outcome.primarySignals[i]]);
      setConfidence((c) => Math.min(outcome.confidence, c + outcome.confidence / (outcome.primarySignals.length + 1)));
    }
    for (let i = 0; i < outcome.brandSafetyFlags.length; i++) {
      await wait(380);
      setStreamedFlags((prev) => [...prev, outcome.brandSafetyFlags[i]]);
    }
    for (let i = 0; i < outcome.rejectionReasons.length; i++) {
      await wait(380);
      setStreamedRejections((prev) => [...prev, outcome.rejectionReasons[i]]);
      setConfidence((c) => Math.min(outcome.confidence, c + outcome.confidence / (outcome.rejectionReasons.length + 1)));
    }
    setConfidence(outcome.confidence);
    await wait(420);

    if (outcome.mob) {
      setStep("assigning");
      await wait(900);
    }
    setStep("done");
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    setPicked({ kind: "file", file: f });
    setStep("idle");
    setStreamedSignals([]);
    setStreamedFlags([]);
    setStreamedRejections([]);
    setConfidence(0);
  };

  const onSample = (s: Sample) => {
    setPicked({ kind: "sample", sample: s });
    setStep("idle");
    setStreamedSignals([]);
    setStreamedFlags([]);
    setStreamedRejections([]);
    setConfidence(0);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12">
        {/* Left — pick a clip + state */}
        <section>
          <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Drop a clip</div>
          <h1 className="mt-2 font-display text-[44px] sm:text-[56px] leading-[0.98] text-balance">
            Make it <span className="italic">good.</span> We&apos;ll do the rest.
          </h1>
          <p className="mt-3 text-[14.5px] text-whisper max-w-[52ch] text-pretty leading-relaxed">
            Drop your own clip — or test the flow with a sample below. Pegasus
            1.5 watches it, decides if it belongs in the campaign, and assigns
            it to a mob. Reasoning streams in live, on the right.
          </p>

          <div className="mt-5">
            <label className="text-[12px] text-whisper">Campaign hashtag</label>
            <div className="mt-1 flex items-center gap-2">
              {(["#milkmob", "#gotmilk", "#milkmoment"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHashtag(h)}
                  className={cn(
                    "h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors",
                    hashtag === h
                      ? "bg-ink text-paper"
                      : "ring-edge bg-paper-2/60 hover:bg-paper-2 text-ink",
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone / picked state */}
          <div className="mt-6 relative rounded-xl ring-edge-strong overflow-hidden">
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {!picked ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="w-full py-14 sm:py-20 px-6 flex flex-col items-center justify-center gap-3 text-center bg-paper-2/40 hover:bg-paper-2 transition-colors"
              >
                <div className="font-display text-[28px]">Drop a video here</div>
                <div className="text-[13px] text-whisper max-w-[42ch]">
                  Up to 60 seconds for the demo. Or pick a sample below
                  to test without finding a clip of your own.
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-whisper-2">
                  4s – 60s · MP4 / MOV / WEBM
                </div>
              </button>
            ) : picked.kind === "sample" ? (
              <div className="flex">
                <div className={cn("relative shrink-0 w-32 sm:w-40", picked.sample.gradientClass, "grain")}>
                  <video
                    src={picked.sample.videoUrl}
                    muted
                    playsInline
                    autoPlay
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] uppercase tracking-[0.14em] text-whisper-2">Sample</span>
                    {step === "idle" && (
                      <button onClick={reset} className="ml-auto text-[12px] text-whisper hover:text-ink">
                        Change
                      </button>
                    )}
                  </div>
                  <div className="font-display text-[22px] mt-0.5 leading-tight">{picked.sample.name}</div>
                  <p className="text-[13px] text-whisper-2 mt-0.5 truncate">{picked.sample.handle} · tagged {hashtag}</p>
                  <p className="text-[13px] mt-2 line-clamp-2 leading-snug">{picked.sample.caption}</p>
                  <div className="text-[11px] text-whisper-2 mt-2">
                    {picked.sample.sizeMb.toFixed(1)} MB · {picked.sample.durationSec}s
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded grad-kitchen ring-edge shrink-0 grain relative" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium truncate">{picked.file.name}</div>
                  <div className="text-[12px] text-whisper">
                    {(picked.file.size / (1024 * 1024)).toFixed(1)} MB · tagged {hashtag}
                  </div>
                </div>
                {step === "idle" && (
                  <button onClick={reset} className="text-[12px] text-whisper hover:text-ink">
                    Change
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              disabled={!picked || step !== "idle"}
              onClick={startFlow}
              className={cn(
                "h-12 px-5 rounded-md text-[14.5px] font-medium transition-colors inline-flex items-center gap-2",
                picked && step === "idle"
                  ? "bg-ink text-paper hover:bg-ink-2"
                  : "bg-paper-2 text-whisper-2 cursor-not-allowed",
              )}
            >
              {step === "idle" ? "Submit for validation" : "Validating…"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            {step !== "idle" && (
              <button
                onClick={reset}
                className="h-12 px-4 rounded-md ring-edge-strong text-[13px] font-medium hover:bg-paper-2"
              >
                Reset
              </button>
            )}
          </div>

          <ProgressTrack step={step} />

          {/* Sample clips */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">Or test the flow</div>
                <h3 className="font-display text-[24px] leading-tight mt-0.5">Pick a sample clip</h3>
              </div>
              <span className="text-[11.5px] text-whisper">Each runs a different beat of the demo.</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {SAMPLES.map((s) => (
                <SampleCard
                  key={s.id}
                  sample={s}
                  active={picked?.kind === "sample" && picked.sample.id === s.id}
                  onClick={() => onSample(s)}
                  disabled={step !== "idle"}
                />
              ))}
            </div>
          </div>

          {/* Discreet presenter override */}
          <details className="mt-7 group">
            <summary className="text-[11.5px] text-whisper-2 hover:text-ink cursor-pointer select-none inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-whisper-2 group-open:bg-mood" />
              Presenter override
            </summary>
            <div className="mt-3 rounded-md ring-edge p-3 text-[12.5px]">
              <p className="text-whisper text-[12px] mb-2 max-w-[60ch]">
                Force a specific outcome regardless of what was uploaded. Used during
                live demos when the presenter wants to walk through a particular beat.
                Resets when you reset the form.
              </p>
              <div className="flex items-center gap-1.5">
                {(["approve", "review", "reject"] as OutcomeKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setOverrideOutcome(k)}
                    disabled={step !== "idle"}
                    className={cn(
                      "h-8 px-3 rounded-md text-[12px] font-medium transition-colors capitalize",
                      overrideOutcome === k
                        ? "bg-mood text-paper"
                        : "ring-edge text-ink hover:bg-paper-2",
                      step !== "idle" && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {k}
                  </button>
                ))}
                {overrideOutcome && (
                  <button
                    onClick={() => setOverrideOutcome(null)}
                    className="h-8 px-3 text-[12px] text-whisper hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </details>
        </section>

        {/* Right — Pegasus reasoning panel */}
        <section className="lg:sticky lg:top-20 self-start">
          <div className="rounded-xl ring-edge bg-paper-2/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-edge flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full",
                  step === "validating" ? "bg-mood paper-pulse" :
                  step === "done" ? "bg-leaf" : "bg-whisper-2"
                )} />
                <span className="text-[12px] tracking-[0.16em] uppercase text-whisper">
                  Pegasus 1.5 · structured analyze
                </span>
              </div>
              <span className="text-[11px] font-mono text-whisper-2">/analyze · stream</span>
            </div>
            <div className="p-5 space-y-4 text-[13.5px]">
              <Field label="task" value={
                step === "idle" ? "—" :
                step === "uploading" ? "uploading clip → TwelveLabs" :
                step === "indexing" ? "creating Marengo index task" :
                step === "validating" ? "streaming Pegasus reasoning" :
                step === "assigning" ? "running mob-classification analyze" :
                "complete"
              } />
              <Field label="schema" value="campaign_relevance.v1" mono />
              <Field
                label="confidence"
                custom={
                  <div className="flex items-center gap-3">
                    <div className="font-mono tabular-nums text-[20px]">
                      {step === "idle" ? "—" : confidence.toFixed(2)}
                    </div>
                    {step !== "idle" && (
                      <div className="flex-1 h-1.5 rounded-full bg-paper-2 overflow-hidden">
                        <motion.div
                          animate={{ width: `${confidence * 100}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 22 }}
                          className={cn(
                            "h-full",
                            confidence >= 0.75 ? "bg-leaf" :
                            confidence >= 0.5 ? "bg-honey" : "bg-mood",
                          )}
                        />
                      </div>
                    )}
                  </div>
                }
              />

              <StreamingList label="primary_signals[]" items={streamedSignals} kind="signal" />
              {(streamedFlags.length > 0 || streamedRejections.length > 0) && (
                <StreamingList label="brand_safety_flags[]" items={streamedFlags} kind="flag" />
              )}
              {streamedRejections.length > 0 && (
                <StreamingList label="rejection_reasons[]" items={streamedRejections} kind="reject" />
              )}
            </div>

            <AnimatePresence>
              {step === "done" && <Outcome outcomeKey={outcomeKey} />}
            </AnimatePresence>
          </div>

          <div className="mt-3 text-[11px] text-whisper-2 leading-relaxed">
            Streaming structured response via Pegasus 1.5 <span className="font-mono">analyze_stream</span> — schema overrides prompt, partial state is rendered as it arrives.
          </div>
        </section>
      </div>
    </div>
  );
}

function SampleCard({
  sample,
  active,
  onClick,
  disabled,
}: {
  sample: Sample;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group text-left rounded-lg overflow-hidden transition-all",
        active ? "ring-2 ring-ink shadow-lift -translate-y-0.5" : "ring-edge hover:-translate-y-0.5",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div className={cn("relative aspect-video grain", sample.gradientClass)}>
        <video
          src={sample.videoUrl}
          muted
          playsInline
          loop
          preload="none"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
          )}
          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-3 text-paper">
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-paper/85 self-start bg-ink/30 backdrop-blur px-1.5 py-0.5 rounded">
            {sample.byline}
          </span>
          <div>
            <div className="font-display italic text-[20px] leading-none">{sample.name}</div>
            <div className="text-[11px] text-paper/85 mt-1">{sample.handle}</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-3 bg-paper">
        <p className="text-[12.5px] leading-snug line-clamp-2 text-pretty">{sample.caption}</p>
      </div>
    </button>
  );
}

function ProgressTrack({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "uploading", label: "Upload" },
    { id: "indexing", label: "Index" },
    { id: "validating", label: "Validate" },
    { id: "assigning", label: "Assign mob" },
    { id: "done", label: "Done" },
  ];
  const order = steps.map((s) => s.id);
  const idx = step === "idle" ? -1 : order.indexOf(step);
  return (
    <ol className="mt-7 grid grid-cols-5 gap-2">
      {steps.map((s, i) => {
        const active = i === idx;
        const past = i < idx || step === "done";
        return (
          <li key={s.id} className="text-[11.5px]">
            <div
              className={cn(
                "h-1 rounded-full mb-2 transition-colors",
                past ? "bg-ink" : active ? "bg-mood paper-pulse" : "bg-edge",
              )}
            />
            <div className={cn(
              past ? "text-ink" : active ? "text-ink" : "text-whisper-2",
              "uppercase tracking-[0.12em]"
            )}>
              {s.label}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, value, custom, mono }: { label: string; value?: string; custom?: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2 mb-1">{label}</div>
      {custom ?? (
        <div className={cn(mono && "font-mono", "text-ink")}>{value}</div>
      )}
    </div>
  );
}

function StreamingList({ label, items, kind }: { label: string; items: string[]; kind: "signal" | "flag" | "reject" }) {
  const dotColor = kind === "signal" ? "bg-leaf" : kind === "flag" ? "bg-honey" : "bg-mood";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2 mb-1.5">{label}</div>
      {items.length === 0 ? (
        <div className="text-[12.5px] text-whisper-2 italic">awaiting…</div>
      ) : (
        <ul className="space-y-1">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <motion.li
                key={`${label}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-2"
              >
                <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
                <span className="text-[13px] leading-snug">{it}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function Outcome({ outcomeKey }: { outcomeKey: OutcomeKey }) {
  const o = OUTCOMES[outcomeKey];
  if (o.decision === "auto_approve" && o.mob) {
    const mob = mobBySlug(o.mob)!;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-edge"
      >
        <div className={cn("p-5 relative grain", mob.gradientClass)}>
          <div className="text-[11px] uppercase tracking-[0.18em] text-paper/85">Verdict</div>
          <div className="font-display text-[34px] text-paper leading-none mt-1">
            <span className="italic">welcome to the</span> {mob.name.replace(" Mob", "")}.
          </div>
          <p className="mt-2 text-[13px] text-paper/90 max-w-[42ch]">{mob.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/me"
              className="h-10 px-4 rounded-md bg-paper text-ink hover:bg-paper-2 inline-flex items-center text-[13px] font-medium"
            >
              See your mob feed →
            </Link>
            <Link
              href={`/mobs/${mob.slug}`}
              className="h-10 px-3 inline-flex items-center text-[13px] text-paper/95 hover:text-paper"
            >
              About this mob
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
  if (o.decision === "review") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-edge p-5"
      >
        <div className="text-[11px] uppercase tracking-[0.18em] text-whisper">Verdict</div>
        <div className="font-display text-[26px] mt-1">A human will check this.</div>
        <p className="text-[13px] text-whisper-2 mt-2 max-w-[44ch]">
          Confidence below auto-approve. Sent to the operator review queue —
          a teammate will weigh the model&apos;s reasoning and decide.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/operator/review"
            className="h-10 px-4 rounded-md bg-ink text-paper hover:bg-ink-2 inline-flex items-center text-[13px] font-medium"
          >
            Open the review queue →
          </Link>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-edge p-5 bg-cream"
    >
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper">Verdict</div>
      <div className="font-display text-[26px] mt-1">
        Doesn&apos;t look like a milk moment <span className="italic">yet.</span>
      </div>
      <p className="text-[13px] text-whisper-2 mt-2 max-w-[44ch]">
        We didn&apos;t see a milk product or a creative activity tied to the brief.
        Try another clip — or tell us why we&apos;re wrong.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button className="h-10 px-4 rounded-md ring-edge-strong hover:bg-paper text-[13px] font-medium">
          Try another clip
        </button>
        <button className="h-10 px-3 text-[13px] text-whisper hover:text-ink">
          Appeal
        </button>
      </div>
    </motion.div>
  );
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
