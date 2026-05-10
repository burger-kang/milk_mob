"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Node = {
  id: string;
  label: string;
  service: string;
  group: "edge" | "ingest" | "core" | "ai" | "storage";
  blurb: string;
  detail: string;
  workload: string;
};

const NODES: Node[] = [
  {
    id: "user",
    label: "Participant",
    service: "Mobile / Web client",
    group: "edge",
    blurb: "Drops a clip tagged with the campaign hashtag.",
    detail: "TLS to CloudFront. The clip never leaves the customer's AWS account from this point on.",
    workload: "Outbound HTTPS",
  },
  {
    id: "cf",
    label: "CloudFront + Cognito",
    service: "Edge + auth",
    group: "edge",
    blurb: "Edge delivery and identity. Static assets cached, sessions issued.",
    detail: "Cognito issues a participant identity. CloudFront fronts both the app shell and HLS streaming for playback. Brand-partnership marketing teams can plug their existing IdP via SAML.",
    workload: "App + media delivery",
  },
  {
    id: "apigw",
    label: "API Gateway",
    service: "REST / WebSocket",
    group: "ingest",
    blurb: "Single entrypoint for upload, validate, search, and operator endpoints.",
    detail: "Per-endpoint auth (Cognito), per-user rate limits, request/response logging. WebSocket subroute streams Pegasus partial responses to the client during validation.",
    workload: "Routing & policy",
  },
  {
    id: "lambda-ingest",
    label: "Ingest Lambda",
    service: "Compute",
    group: "ingest",
    blurb: "Receives the upload, persists raw bytes to S3, kicks off the indexing task.",
    detail: "Issues pre-signed S3 PUT, writes a Video row in DynamoDB with status=indexing, calls the TwelveLabs indexing API to register the asset against the Marengo index.",
    workload: "Upload acceptance + bookkeeping",
  },
  {
    id: "s3",
    label: "S3",
    service: "Object storage",
    group: "storage",
    blurb: "The video bytes. Encrypted at rest, lifecycle-policied.",
    detail: "Source-of-truth for original assets. Lifecycle moves cold submissions to Glacier after the campaign closes. KMS-encrypted bucket; versioning on for audit.",
    workload: "Raw video + thumbnails",
  },
  {
    id: "events",
    label: "EventBridge",
    service: "Event bus",
    group: "core",
    blurb: "Glue between async stages — index ready, embedding ready, validation done.",
    detail: "Decoupled async orchestration. Replayable. Lets us add new consumers (e.g., the IG/TikTok ingestion lane) without touching the existing pipeline.",
    workload: "Stage transitions",
  },
  {
    id: "lambda-validate",
    label: "Validate Lambda",
    service: "Compute",
    group: "ai",
    blurb: "Calls Pegasus 1.5 with the campaign-relevance schema, streams partial response to the client.",
    detail: "Invokes Bedrock with response_format set to a JSON Schema; streams primary_signals, brand_safety_flags, rejection_reasons as they arrive over the WebSocket. Writes the verdict to DynamoDB and emits an EventBridge event for downstream consumers.",
    workload: "Pegasus structured analyze",
  },
  {
    id: "lambda-classify",
    label: "Classify Lambda",
    service: "Compute",
    group: "ai",
    blurb: "Second Pegasus call to assign the video to a mob in the curated taxonomy.",
    detail: "Same Pegasus 1.5 model, different schema — returns mob (enum), vibe_tags (string[]), confidence. Writes the MobAssignment record. Triggers embedding task for similarity later.",
    workload: "Pegasus mob taxonomy",
  },
  {
    id: "bedrock",
    label: "Bedrock",
    service: "Marengo 3.0 + Pegasus 1.5",
    group: "ai",
    blurb: "Where the models actually run. Cross-region inference enabled.",
    detail: "Customer's account invokes Marengo for indexing/search/embeddings and Pegasus for analyze. Cross-region inference spreads load and survives regional events. No data leaves AWS.",
    workload: "All TwelveLabs model traffic",
  },
  {
    id: "embed",
    label: "Embed Lambda",
    service: "Compute",
    group: "ai",
    blurb: "Persists Marengo embeddings the moment the async task completes.",
    detail: "TwelveLabs retains async embedding results for 7 days; this Lambda drains them on completion and writes vectors into pgvector / OpenSearch so similarity search has no external dependency.",
    workload: "Embedding persistence",
  },
  {
    id: "vectors",
    label: "OpenSearch",
    service: "k-NN vector index",
    group: "storage",
    blurb: "Where in-mob similarity actually happens.",
    detail: "Stores Marengo video embeddings with mob and submission metadata. Powers the 'more like this in your mob' affordance on /v/[id]. OpenSearch was chosen over RDS+pgvector for hot-path scaling — but pgvector is a viable simpler alternative for early-stage campaigns.",
    workload: "Vector search",
  },
  {
    id: "ddb",
    label: "DynamoDB",
    service: "Application state",
    group: "storage",
    blurb: "Videos, validations, mob assignments, operator decisions.",
    detail: "Single-table design keyed by entity. Streams emit to EventBridge for downstream consumers. TTL on review-queue entries auto-archives stale items.",
    workload: "Hot transactional data",
  },
  {
    id: "search",
    label: "Search Lambda",
    service: "Compute",
    group: "core",
    blurb: "Free-text search across the campaign.",
    detail: "Calls Marengo /search with cross-modal options. Results paginated server-side, group_by=clip for /search and group_by=video for /me feeds.",
    workload: "Cross-modal retrieval",
  },
  {
    id: "operator",
    label: "Operator console",
    service: "Internal app",
    group: "edge",
    blurb: "Where marketing reviews borderline submissions.",
    detail: "Same web app, different IAM role. Operator decisions flow back into DynamoDB and feed the next-iteration validation tune.",
    workload: "Borderline review",
  },
];

const GROUP_STYLE: Record<Node["group"], string> = {
  edge: "bg-cream text-ink ring-edge",
  ingest: "bg-paper text-ink ring-edge-strong",
  core: "bg-paper text-ink ring-edge-strong",
  ai: "bg-ink text-paper",
  storage: "bg-paper-2 text-ink ring-edge",
};

const FLOWS: { from: string; to: string; label?: string }[] = [
  { from: "user", to: "cf" },
  { from: "cf", to: "apigw" },
  { from: "apigw", to: "lambda-ingest" },
  { from: "lambda-ingest", to: "s3", label: "raw video" },
  { from: "lambda-ingest", to: "ddb", label: "video row" },
  { from: "lambda-ingest", to: "events", label: "indexed" },
  { from: "events", to: "lambda-validate" },
  { from: "events", to: "lambda-classify" },
  { from: "events", to: "embed" },
  { from: "lambda-validate", to: "bedrock", label: "Pegasus" },
  { from: "lambda-classify", to: "bedrock", label: "Pegasus" },
  { from: "embed", to: "bedrock", label: "Marengo" },
  { from: "embed", to: "vectors" },
  { from: "lambda-validate", to: "ddb", label: "verdict" },
  { from: "lambda-classify", to: "ddb", label: "mob" },
  { from: "operator", to: "apigw" },
  { from: "apigw", to: "search" },
  { from: "search", to: "bedrock", label: "Marengo" },
  { from: "search", to: "vectors" },
];

export default function ArchitecturePage() {
  const [active, setActive] = useState<string>("bedrock");
  const node = NODES.find((n) => n.id === active)!;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-[11px] uppercase tracking-[0.18em] text-whisper-2">Architecture</div>
      <h1 className="mt-2 font-display text-[48px] sm:text-[68px] leading-[0.95] text-balance">
        TwelveLabs <span className="italic">on Bedrock,</span> in your account.
      </h1>
      <p className="mt-3 text-[15px] text-whisper text-pretty max-w-[64ch] leading-relaxed">
        Both Marengo 3.0 and Pegasus 1.5 are first-class on Amazon Bedrock with
        cross-region inference. Customer data and every model invocation stay
        inside the customer&apos;s AWS account — compliance, data residency, and
        existing AWS spend commitments all line up.
      </p>

      <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        {/* Diagram */}
        <div className="rounded-2xl ring-edge bg-paper-2/40 p-5 sm:p-7">
          <div className="grid grid-cols-12 gap-3">
            {/* Row 1 — edge */}
            <DiagramNode className="col-span-4" node={NODES[0]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[1]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[13]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 2 — gateway */}
            <DiagramNode className="col-span-12" node={NODES[2]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 3 — ingest + storage */}
            <DiagramNode className="col-span-4" node={NODES[3]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[4]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[11]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 4 — events */}
            <DiagramNode className="col-span-12" node={NODES[5]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 5 — AI lambdas */}
            <DiagramNode className="col-span-4" node={NODES[6]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[7]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-4" node={NODES[9]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 6 — Bedrock + storage */}
            <DiagramNode className="col-span-7" node={NODES[8]} active={active} setActive={setActive} />
            <DiagramNode className="col-span-5" node={NODES[10]} active={active} setActive={setActive} />

            <Connector />
            {/* Row 7 — search */}
            <DiagramNode className="col-span-12" node={NODES[12]} active={active} setActive={setActive} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-[11px] text-whisper-2">
            <div className="flex items-center gap-3">
              <Legend swatch="bg-ink" label="AI / Bedrock" />
              <Legend swatch="bg-paper-2 ring-edge" label="Storage" />
              <Legend swatch="bg-cream ring-edge" label="Edge" />
              <Legend swatch="bg-paper ring-edge-strong" label="Compute / Routing" />
            </div>
            <div>{FLOWS.length} flows · 1 region or many · 0 data egress</div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="lg:sticky lg:top-20 self-start space-y-4">
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={cn("rounded-2xl p-6", GROUP_STYLE[node.group])}
          >
            <div className="text-[11px] uppercase tracking-[0.16em] opacity-75">
              {node.service}
            </div>
            <div className="font-display text-[34px] leading-[0.95] mt-1">
              <span className="italic">{node.label}</span>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed opacity-95">{node.blurb}</p>
            <div className="mt-4 pt-4 border-t border-current/15">
              <div className="text-[10.5px] uppercase tracking-[0.16em] opacity-75 mb-1">Detail</div>
              <p className="text-[13px] leading-relaxed text-pretty opacity-95">{node.detail}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-current/15 flex items-center justify-between text-[11.5px]">
              <span className="opacity-75">Workload</span>
              <span className="font-medium">{node.workload}</span>
            </div>
          </motion.div>

          <div className="rounded-xl ring-edge p-5 bg-paper">
            <div className="text-[11px] uppercase tracking-[0.16em] text-whisper-2">Why Bedrock</div>
            <ul className="mt-3 space-y-2 text-[13px] leading-snug">
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Customer&apos;s data and every Marengo/Pegasus invocation stay inside the customer&apos;s AWS account.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Cross-region inference handles spike traffic and regional events without code changes.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Spend rolls up under existing AWS commitments — quota-relevant for the AWS account team.</li>
              <li className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mood shrink-0" />Same model behind the live demo. No second integration path.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DiagramNode({
  node,
  active,
  setActive,
  className,
}: {
  node: Node;
  active: string;
  setActive: (id: string) => void;
  className?: string;
}) {
  const isActive = active === node.id;
  return (
    <button
      onClick={() => setActive(node.id)}
      onMouseEnter={() => setActive(node.id)}
      className={cn(
        "relative text-left rounded-lg p-3 transition-all",
        GROUP_STYLE[node.group],
        isActive ? "shadow-lift -translate-y-0.5" : "hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10.5px] uppercase tracking-[0.16em] opacity-75">
          {node.service}
        </div>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-mood" />}
      </div>
      <div className="font-medium text-[13.5px] mt-0.5 leading-tight">
        {node.label}
      </div>
    </button>
  );
}

function Connector() {
  return (
    <div className="col-span-12 flex justify-center my-1">
      <div className="w-px h-3 bg-edge" />
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("w-2.5 h-2.5 rounded-sm", swatch)} />
      {label}
    </span>
  );
}
