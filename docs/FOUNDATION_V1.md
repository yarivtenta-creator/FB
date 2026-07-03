# Foundation v1 — FROZEN

The foundation of the Project Operating System is complete, proven end-to-end,
and frozen. No architecture changes belong in v1 — only the layers below, all
built and validated.

## What v1 contains

| Layer | Component | Status |
|-------|-----------|--------|
| 1 | Canonical schema (`docs/SCHEMA.md`) — source-independent record + project memory | ✅ |
| 2 | Generic Project Compiler — renders memory from canonical records only | ✅ |
| 3 | Markdown converter — `_RAW` docs → `03_CONVERTED_MD` (Pandoc/MarkItDown/native fallback) | ✅ |
| — | Ownership model — Save-Session emits **SessionDeltas only**; Compiler owns all generated files | ✅ |
| 4 | Adapters — files, conversations (ChatGPT/Claude), claude-code, gdrive, github, higgsfield | ✅ |
| 5 | One-time Deep Audit — classify / cluster / merge → module / route → UNCLASSIFIED | ✅ |
| 6 | Publish — compile ALL, verify every project, measure hot-tier, validation report | ✅ |

## Invariants (must hold in v1 and beyond)

- **Adapters and Save-Session only feed** canonical records / SessionDeltas.
- **The Compiler owns every generated file** (STATE, TODO, SOURCE_OF_TRUTH,
  ASSET_INDEX, PROJECT_INDEX, DECISIONS, CHANGELOG, SESSION_LOG, SKILLS_USED,
  snapshots) — all carry a "do not hand-edit" banner.
- **Append-only** master index; decisions live in overlays
  (`assignments.ndjson`, `enrichments.ndjson`, `modules.ndjson`, `session_deltas.ndjson`).
- **Originals are never modified or deleted**; every write is backed up; every action logged.
- **Uncertain data is never forced** into a project — it goes to UNCLASSIFIED.
- **No raw history is active memory** — archived duplicates are cold history only.

## Publish validation (this build)

See `docs/PUBLISH_VALIDATION.md`. Summary: 2 projects, 13 records, 1 module
(4 duplicates merged), 4 archived, 1 UNCLASSIFIED, 1 UNASSIGNED — **all projects
verified PASS**. Hot-tier is small and loaded every turn instead of raw history.

## Reproduce the full pipeline

```powershell
# ingest (any adapter) -> audit -> publish
.\scripts\import\Import-Conversations.ps1 -Path exports\conversations.json
.\scripts\Invoke-DeepAudit.ps1 -Project "Skill Safety" -ModuleName "Skill Safety Check" -Apply
.\scripts\Approve-AuditItem.ps1 -Id <queued-id>
.\scripts\Publish-Memory.ps1
```

## Next (post-v1)

The **Project Control Center (UI)** may now begin. It renders — never authors —
the canonical Project Memory produced by this foundation.
