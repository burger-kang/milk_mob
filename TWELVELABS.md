# TwelveLabs Reference

Working knowledge baseline as of 2026-05-09. Source: docs.twelvelabs.io, twelvelabs.io/product, AWS Bedrock model docs. Update when behaviors or versions change.

## Models

### Marengo 3.0 — multimodal retrieval + embeddings
- Replaces Marengo 2.7 (sunset 2026-03-30; auto-reindex completed).
- Powers `/search` and the `/embed` family.
- Modalities ingested per video: **visual**, **audio** (non-speech sounds, music, ambient), **transcription** (spoken words).
- Cross-modal: any-to-any — query text against visual+audio, query images against video, etc.
- 36+ query languages. Audio processing up to 4 hours. Enhanced sports recognition (soccer, basketball, baseball, ice hockey, American football).

### Pegasus 1.5 — generative video-to-text
- Replaces Pegasus 1.2 for general use; 1.2 still available where 1.5 isn't (regional Bedrock).
- Powers `/analyze` (open-ended text, summaries, structured JSON, video segmentation).
- Accepts video as URL, uploaded asset, or base64. **No pre-indexing required** for analyze.
- Duration: 4 sec – 2 hours. File size: up to 2 GB. Resolution: 360×360 to 5184×2160. Aspect ratio 1:1–1:2.4 or 2.4:1–1:1.
- Token budget up to 65,536 for responses.
- Sync support added 2026-05-06; async always available. Video segmentation requires async.
- Structured prompts can include up to 4 reference images.

## Core Concepts

- **Index** — collection of videos processed under a chosen `model_options` config (`visual`, `audio`). Determines what modalities are queryable later.
- **Task** — async job for upload/indexing or async embedding/analysis. Poll for completion.
- **Video** — the asset inside an index, queryable by clip-level timestamps.
- **Search** — query an index by text, image (up to 10 images), or both. Returns `SearchItem`s with `start`/`end` timestamps, `video_id`, `thumbnail_url`, `transcription`, `rank` (lower = more relevant).
- **Embed** — multimodal vector representations. v2 endpoint. Sync (`/embed-v2`) for text/image/short audio-video <10min; async (`/embed-v2/tasks`) for audio/video up to 4 hours. **Async embeddings retained for 7 days only — re-run if needed.**
- **Analyze** — Pegasus prompt → text or structured JSON. Streaming via `analyze_stream()`.

## Endpoints (v1.3 era — current)

- `POST /tasks` — upload a video for indexing (Marengo).
- `POST /search` — modality-aware search across an index. Params: `index_id`, `search_options=["visual","audio","transcription"]`, `query_text`, `query_media_type="image"`, `query_media_urls[]`, `group_by` (`video`|`clip`), `operator` (`or`|`and`), `page_limit` (≤50), `filter` (JSON-string metadata filter).
- `POST /analyze` — Pegasus analysis. Supports `prompt`, `temperature`, `stream`, and `response_format` for structured JSON.
- `POST /embed-v2` — sync embeddings for text/image/short audio-video.
- `POST /embed-v2/tasks` — async embedding tasks for long media.

**Removed (pre–Feb 15, 2026):** `/gist`, `/summarize` — fold these into `/analyze` with a custom schema.

## Structured Responses (Pegasus 1.5)

`response_format` accepts JSON Schema Draft 2020-12. Supported types: `string`, `integer`, `number`, `boolean`, `array`, `object`. Constraints `pattern`, `minimum`, `maximum`, `minItems` honored. `$defs`/`$ref` allowed for nesting.

The schema **takes precedence over the prompt** — keep them aligned. Check `finish_reason` for truncation.

Useful for our demo:
- Campaign-relevance gate: `{ is_campaign_relevant: bool, confidence: number, reasons: string[] }`
- Mob taxonomy classification: `{ mob: enum, secondary_signals: string[], setting: string }`
- Highlight extraction: `{ best_moments: [{ start_sec, end_sec, why }] }`

## SDKs

- **Python**: `pip install twelvelabs` (≥1.2.1 for multi-image search/embed). Entry point: `from twelvelabs import TwelveLabs; client = TwelveLabs(api_key=...)`. Resources: `client.indexes`, `client.tasks`, `client.search`, `client.embed`. API key falls back to `TWELVE_LABS_API_KEY` env var. Default request timeout 600s; override via `request_options={"timeout_in_seconds": N}`.
- **Node.js**: official SDK `@twelvelabs/sdk` (parallel surface).

### Python search example

```python
from twelvelabs import TwelveLabs

client = TwelveLabs()  # picks up TWELVE_LABS_API_KEY

results = client.search.query(
    index_id=INDEX_ID,
    search_options=["visual", "audio"],
    query_text="person drinking milk doing something creative",
    operator="or",
    group_by="video",
    page_limit=20,
)

for item in results:
    print(item.video_id, item.start, item.end, item.rank)
```

## Plans, Limits, Operational Notes

- **Free plan**: as of 2026-05-07, a single shared 10-hour limit across indexing and video analysis. Index data retained 90 days only.
- **Developer plan**: three tiers, auto-upgrade based on monthly spend.
- **Enterprise plan**: negotiated.
- **Rate limits**: enhanced multi-dimensional system live since 2026-01-12 — measures request count, video duration, and token usage independently. Separate limits per modality (video/audio/image/text). Tier scales with spend.
- **API keys**: configurable expiration (3/6/12 months, custom date, or never).
- **Deletion safeguards** (since 2026-04-26): referenced asset deletion denied by default.

## AWS Bedrock Availability

Marengo 3.0 and Pegasus 1.2 / 1.5 are first-class Bedrock models. Pegasus 1.2 has global cross-region inference across 23 regions plus all EU regions; Pegasus 1.5 availability is expanding. Direct API access remains available alongside Bedrock — choose based on customer's existing AWS posture (relevant when iteration 2 starts).

## Likely Pitfalls for the Demo

- 7-day async embedding retention — if we cluster offline, persist vectors immediately to our own store.
- `/gist` / `/summarize` are gone — anything older showing those calls is stale.
- Sync search exists but image queries and very long videos still favor async paths.
- Free-tier 10-hour cap is shared across indexing + analyze — a small clip library with re-runs can burn it.
- Pegasus structured responses: schema overrides prompt. If the schema is too narrow, the model can't escape — design schemas to capture the failure case (e.g. include `is_campaign_relevant` rather than assuming true).
