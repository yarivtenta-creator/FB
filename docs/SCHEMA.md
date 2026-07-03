# Canonical Project Memory schema

> The source-independent contract at the center of the system. **Compiler-first,
> not Claude-first.** Claude is only Adapter #1 of many. Nothing here depends on
> any single engine's data structure.

## Separation of concerns (the core rule)

| Role | Owns | Never does |
|------|------|-----------|
| **Adapters** (Claude, ChatGPT, Drive, GitHub, Higgsfield, files, …) | Extract from a source → normalize → **emit canonical records** | Never write project memory; never classify |
| **Audit** (one-time, LLM-assisted + human) | Emit **assignment decisions** to the overlay | Never edit the immutable master index |
| **Compiler** | Read canonical records + overlay → **render Project Memory** | Never reads a source or an adapter's raw format |

The Project Compiler consumes **only** the canonical record shape below. Any new
adapter that emits this shape works with zero compiler changes.

## 1. Canonical record (adapter output contract)

One JSON object per item, appended to `_INDEX/master_index.ndjson` (immutable).

| Field | Type | Meaning |
|-------|------|---------|
| `id` | string | Stable id (first 12 hex of `sha256`) |
| `type` | string | archive, image, video, pdf, html, markdown, document, csv, text, data, audio, **conversation**, other |
| `source` | string | Adapter label: files, chatgpt, claude, gdrive, github, higgsfield, … |
| `project` | string | Assigned project, or reserved bucket (default `UNASSIGNED`) |
| `title` | string | Human title / filename |
| `date_added` | date | yyyy-MM-dd |
| `sha256` | string | Content hash (dedup) |
| `bytes` | int | Size |
| `ext` | string | File extension (or `.md` for conversations) |
| `contains` | string | Short deterministic description (ZIP manifest, message count, …) |
| `purpose` | string/null | Extractive preview / use — never guessed |
| `status` | string | NEEDS_REVIEW, CLASSIFIED, INDEXED, … |
| `raw_path` | string | Cold-archive location under `_RAW/` (repo-relative) |
| `original_path` | string | Where it came from |
| `converted_md` | string/null | Markdown conversion path (set by the converter) |
| `related_sessions` | array | Session snapshot ids |
| `related_files` | array | Related item ids |
| `source_ref` | string | Export format / source system ref |
| `needs_review_reason` | string | Why it still needs review |

**Adapter rules:** fill every field it can; unknown project → `UNASSIGNED`;
never fabricate `purpose`; copy originals to `_RAW` (never move/overwrite);
dedup by `sha256`.

## 2. Assignment overlay (audit decisions)

Append-only `_INDEX/assignments.ndjson`; last write per `id` wins at compile
time. Keeps the master index immutable.

```json
{"id":"...","project":"Vinyl Lab","status":"CLASSIFIED",
 "reason":"final website zip","decided_by":"audit","decided_at":"..."}
```

### Module record (Deep Audit output) — `_INDEX/modules.ndjson`

The audit collapses a duplicate-idea cluster into ONE canonical module; the raw
discussions are archived (status=ARCHIVED), never active. Last write per id wins.

```json
{"id":"mod_...","name":"Skill Safety Check","project":"Skill Safety",
 "status":"Not Built|Partial|Built|Cancelled","aliases":[...],"members":[ids],
 "relevant_files":[...],"decision":"keep consolidated state; archive duplicates"}
```

## 3. Reserved buckets (never real projects)

| Bucket | Meaning | Folder |
|--------|---------|--------|
| `UNASSIGNED` | Ingested, not yet audited | `_STAGING/` |
| `UNCLASSIFIED` | Audited but couldn't be confidently assigned — **awaits review** | `_UNCLASSIFIED/` |

**Uncertain data is never forced into a project.** If classification isn't
confident, it goes to `UNCLASSIFIED` and stays there until reviewed.

## 4. Canonical Project Memory (what a project *is*)

A project is a named workspace. **Ownership model (accepted):**

```
_RAW / adapter output / session delta  ->  canonical records  ->  assignment overlay
                                                                      -> PROJECT COMPILER -> generated files
```

Adapters and Save-Session **feed** canonical records / session deltas. The
Compiler **owns all generated project outputs** — nothing else writes them.

| Class | Files | Owner |
|-------|-------|-------|
| **Fed** (append-only inputs) | canonical records (`master_index.ndjson`), assignment/enrichment overlays, **SessionDeltas** (`session_deltas.ndjson`) | adapters / Save-Session |
| **Generated** (compiler-owned, do not hand-edit) | STATE, TODO, SOURCE_OF_TRUTH, ASSET_INDEX, PROJECT_INDEX, DECISIONS, CHANGELOG, SESSION_LOG, SKILLS_USED, session snapshots, STATUS.txt | **Compiler** |

**Migration complete.** Save-Session no longer writes any generated file. It
appends one **SessionDelta** and feeds asset records, then invokes the Compiler,
which regenerates every file above. Each generated file carries a "generated —
do not hand-edit" banner.

### SessionDelta (Save-Session output contract)

Append-only `_INDEX/session_deltas.ndjson`, one per save:

```json
{"project":"Vinyl Lab","ts":"...","date":"...","snapshot":"SESSION_....md",
 "summary":"...","todos_added":[...],"todos_done":[...],
 "decision":{"text":"...","rationale":"..."},"change":"...","next_action":"...",
 "status":"GREEN","blocked_reason":"","skills_used":[...],
 "source_of_truth":[{"item":"...","path":"...","note":"..."}],"assets":["<id>"]}
```

The Compiler derives current truth from deltas: STATE = latest; TODO =
Σ todos_added − todos_done; DECISIONS/CHANGELOG/SESSION_LOG/SKILLS_USED = the
full ledger; snapshots = one page per delta.

Later, per the product vision, a project also carries identity metadata
(icon, color, status, progress) — rendered from the same canonical records.

## 5. Build order (compiler-first)

1. **Canonical schema** (this file).
2. **Generic Project Compiler** — `Compile-ProjectMemory.ps1` (done).
3. **Markdown converter** — `_RAW` docs → `03_CONVERTED_MD/`, sets `converted_md`.
4. **Adapters** — Claude, ChatGPT (done), Drive, GitHub, Higgsfield, files (done).
5. **One-time Deep Audit** — classify / merge duplicates / route (→ UNCLASSIFIED when unsure).
6. **Publish** the canonical Project Memory (compile ALL).
7. **Engine-specific caches** — only if needed, derived from the canonical memory.
