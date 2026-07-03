# Architecture — Project Operating System

> This file is the durable design record. It does not depend on Claude's memory.
> Goal: turn AI work from chat-first into **project-first** — projects are the
> primary object; chats become archived implementation history.

## Compiler-first, not engine-first

The system is **adapter-agnostic**. Every source (Claude, ChatGPT, Drive,
GitHub, Higgsfield, local files) is just an **adapter** that normalizes into the
one canonical record in `SCHEMA.md`. The **Project Compiler consumes only that
canonical shape** — it never depends on Claude's (or anyone's) data structure.
Claude is Adapter #1 of many; the architecture assumes many adapters will exist.

## Build order (compiler-first)

```
1  CANONICAL SCHEMA     source-independent record + project memory      [SCHEMA.md]
2  PROJECT COMPILER     renders memory from canonical records only      [built]
3  MARKDOWN CONVERTER   _RAW docs -> 03_CONVERTED_MD/, sets converted_md [next]
4  ADAPTERS             Claude, ChatGPT(built), Drive, GitHub, Higgsfield, files(built)
5  ONE-TIME DEEP AUDIT  classify / merge duplicates / route (-> UNCLASSIFIED if unsure)  [proven]
6  PUBLISH              compile ALL -> canonical Project Memory
7  ENGINE CACHES        only if needed, derived from the canonical memory
```

Reserved buckets `UNASSIGNED` (pre-audit) and `UNCLASSIFIED` (audited but
uncertain) are never real projects — uncertain data is never forced into one.

## Phase 0 — Ingestion pipeline

Deterministic ETL run by **scripts, not the LLM**. The LLM is used only in the
Audit (Phase 1) for judgment. Stages:

```
SOURCES ─▶ EXTRACT ─▶ _RAW/ (immutable copy)
              └─▶ NORMALIZE ─▶ one canonical record per item
                       └─▶ INDEX ─▶ _INDEX/master_index.ndjson  (+ .md card)
                              └─▶ CONVERT ─▶ 03_CONVERTED_MD/ (pandoc/markitdown; skip if absent)
Everything lands as project=UNASSIGNED, status=NEEDS_REVIEW until the Audit routes it.
```

Ingestion never guesses a project and never merges ideas — it captures truth.

### Source adapters (uniform interface: Extract → Normalize → records[])

| Adapter | Input | Runs on | Notes |
|---------|-------|---------|-------|
| files | ZIP/PDF/HTML/MD/DOC/CSV/img/video | local | ZIP by manifest; media = metadata only | ✓ built |
| chatgpt | ChatGPT `conversations.json` | local | Cleanest structured export | ✓ built |
| claude-export | Claude Privacy export JSON | local | Partial (no uploaded files) | ✓ built |
| claude-code | `~/.claude/**/*.jsonl` | local | Versioned format — parse defensively | ✓ built |
| gdrive | Drive metadata JSON (API/MCP shape) | local | Metadata/links, not bulk download | ✓ built |
| github | repos JSON or `-Owner` + token | local | Repo IS the export; index, don't copy blobs | ✓ built |
| higgsfield | generations JSON (prompt = purpose) | local | AI media; URL ref, metadata only | ✓ built |

Every adapter reads its provider-shaped input and emits the **same** canonical
record. Connector sources (gdrive/github/higgsfield) store an external URL as
`raw_path` (metadata only); file/conversation sources copy originals to `_RAW`.

### Canonical index record (`_INDEX/master_index.ndjson`, append-only, one JSON/line)

```json
{"id":"...","ingested_at":"...","type":"zip","source":"files",
 "project":"UNASSIGNED","title":"...","date_added":"YYYY-MM-DD",
 "sha256":"...","bytes":0,"ext":".zip","contains":"...","purpose":null,
 "status":"NEEDS_REVIEW","raw_path":"_RAW/...","original_path":"...",
 "converted_md":null,"related_sessions":[],"related_files":[],
 "source_ref":"local","needs_review_reason":"unassigned project"}
```

Each item also gets a small Markdown **card** so the same data is browsable
without a tool. Per-project `ASSET_INDEX.md` / `PROJECT_INDEX.md` are **rendered
from** this index — the NDJSON is the source of truth for assets.

### Safety
- `_RAW/` is write-once; originals are **copied, never moved or modified**.
- Index is **append-only**; conversions write **new** files beside originals.
- Every item hashed (SHA-256) → exact-duplicate detection is deterministic.
- Near-duplicate **ideas** are merged only in the Audit, always `NEEDS_REVIEW`.
- Every action logged to `_logs/actions.log`.

## Folder layout (ingestion additions)

```
GPT-Memory/
  _RAW/<source>/<date>/...      immutable originals
  _INDEX/
    master_index.ndjson         every item, structured
    assets/<id>.md              one card per file/asset
    conversations/<id>.md       one card per conversation
  _STAGING/                     ingested, awaiting audit (project=UNASSIGNED)
  _SKILLS/SKILLS_LIBRARY.md     master skills catalog
  Projects/<Name>/...           audit routes items here
  _logs/actions.log
```

## Token minimization (the reason this exists)

Tiered memory — a tiny hot set is always in context; the large cold archive is
touched only on demand.

| Tier | Files | ~Size | Read when |
|------|-------|-------|-----------|
| Hot (current truth) | STATE, PROJECT_INDEX, SOURCE_OF_TRUTH, SKILLS_AVAILABLE | 2–5k tok/project | every request |
| Warm (lookup) | ASSET_INDEX / master_index.ndjson | queried, not read whole | on retrieval |
| Cold (archive) | full conversations, 01_SESSIONS, _RAW | millions of tok | only if hot+warm insufficient |

Mechanisms:
1. **Summarize once, read forever** — each conversation → ~150-token card at
   ingest; normal work reads the card, not the transcript.
2. **Retrieval returns a pointer, not a payload** — a grep/jq over the index
   returns one line (path + description), never the file or surrounding chats.
3. **Deterministic scanning** — hashing/listing/indexing cost zero LLM tokens.
4. **Current-state-only working memory** — the AI answers from STATE.md; the
   hundreds of superseded conversations never enter context.

Accuracy while small: STATE is **regenerated** from append-only sources (index +
decisions + latest session), never hand-drifted; claims link to their cold source.

## Known limitations
- The cloud container can't see the user's local machine — local adapters are
  PowerShell scripts the user runs on Windows.
- Claude export is partial; Claude Code `.jsonl` format is versioned/undocumented.
- Doc→MD needs Pandoc or MarkItDown installed; fall back to "conversion unavailable".
- Images/video are metadata-only; no faithful Markdown conversion exists.
- Idea-merging needs human-confirmed judgment (Audit), not a pure script.
