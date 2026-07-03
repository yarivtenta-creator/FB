# Project Memory Automation (Windows)

Turns messy AI project work into clean project folders, Markdown memory files,
asset indexes, and (in later phases) a project dashboard.

> **Status: Phase 1 of 8 is built and tested** — the **Save Session** workflow,
> the per-project folder scaffold, traffic-light status, backups, and logging.
> Phases 2–8 (deep audit, asset indexing, Markdown conversion, multi-project
> dashboard, search, extended safety) are scoped but not yet implemented.

---

## What Phase 1 does

When you run **Save Session** it:

1. Selects the project (or creates a new one).
2. Captures a session summary.
3. Writes a timestamped snapshot: `01_SESSIONS/SESSION_YYYY-MM-DD_HH-MM.md`.
4. Updates the living memory files: `STATE.md`, `TODO.md`, `DECISIONS.md`,
   `CHANGELOG.md`, `ASSET_INDEX.md`, `SESSION_LOG.md`, `SKILLS_USED.md`.
5. Stamps a **traffic-light status**:
   - 🟢 **Green** = saved
   - 🟡 **Yellow** = pending changes
   - 🔴 **Red / Blocked** = unsaved / blocked

**Ownership:** Save-Session emits a **SessionDelta** (+ asset records) only. The
**Compiler owns every generated file** — STATE, TODO, SOURCE_OF_TRUTH,
ASSET_INDEX, PROJECT_INDEX, DECISIONS, CHANGELOG, SESSION_LOG, SKILLS_USED,
snapshots. Save-Session auto-invokes the Compiler after each save. See
`docs/SCHEMA.md`.

### Safety (baked in from day one)

- **Never deletes** an original file.
- **Backs up** every file to `_backups/` *before* overwriting it.
- **Logs every action** to `GPT-Memory/_logs/actions.log`.
- Unknown asset states are marked **`NEEDS_REVIEW`** rather than guessed.

---

## Mandatory project rules

See **`PROJECT_RULES.md`** for the full, file-based rules (they don't rely on
Claude's memory). In short:

**Every project must contain these 8 files** — `New-Project.ps1` creates and
verifies them:

`STATE.md` · `TODO.md` · `DECISIONS.md` · `CHANGELOG.md` · `SOURCE_OF_TRUTH.md`
· `ASSET_INDEX.md` · `SKILLS_AVAILABLE.md` · `SKILLS_USED.md`

**Before answering any request, run the 5-step protocol:**

```powershell
.\scripts\Get-ProjectContext.ps1 -Project "Vinyl Lab" -Query "deploy"
```

It prints: (1) project, (2) available skills + the master Skills Library,
(3) similar prior work, (4) current state — so you (5) answer already informed.
**Never skip the Skills Library** (`GPT-Memory/_SKILLS/SKILLS_LIBRARY.md`).

---

## Requirements

- Windows with **PowerShell** (Windows PowerShell 5.1 that ships with Windows,
  or PowerShell 7+). No other install needed for Phase 1.

---

## Quick start

### Option A — the "Save Session" button

Double-click **`Save-Session.cmd`** in the repo root. It launches the workflow
interactively: pick/enter a project, type your summary, done.

### Option B — from PowerShell

```powershell
# Interactive (prompts for project + summary):
.\scripts\Save-Session.ps1

# One-liner with everything supplied:
.\scripts\Save-Session.ps1 -Project "Vinyl Lab" `
    -Summary "Audited the final website ZIP; confirmed source of truth." `
    -Todo "Deploy to hosting","Verify homepage image" `
    -Decision "Use vinyl_lab_FINAL_READY.zip as source of truth|Newest audited build" `
    -Change "Marked vinyl_lab_FINAL_READY.zip as source of truth" `
    -Asset "vinyl_lab_FINAL_READY.zip|website files, CSS, JS|final audit|D:\Downloads\vinyl_lab_FINAL_READY.zip" `
    -NextAction "Deploy to hosting" `
    -Status Green
```

### Mark a project pending or blocked

```powershell
.\scripts\Save-Session.ps1 -Project "Vinyl Lab" -Summary "Mid-work; more to do" -Status Yellow

.\scripts\Save-Session.ps1 -Project "Skill Safety" -Summary "Cannot proceed" `
    -Status Blocked -BlockedReason "Waiting on upload API spec from vendor"
```

### Create a project scaffold without saving a session

```powershell
.\scripts\New-Project.ps1 -Project "New Idea"
```

### Ingest assets (Phase 0) and retrieve them

```powershell
# Import a folder or file — copies originals to _RAW, indexes each, writes cards.
# Nothing is moved or overwritten; exact duplicates are skipped by SHA-256.
.\scripts\import\Import-Files.ps1 -Path "D:\Downloads" -Include zip,pdf,png

# Import a ChatGPT or Claude export (auto-detects format). Full transcripts go to
# the cold archive; each conversation gets a compact card + extractive preview.
.\scripts\import\Import-Conversations.ps1 -Path "D:\exports\conversations.json"

# More adapters (each normalizes its provider input to the same canonical record):
.\scripts\import\Import-ClaudeCode.ps1 -Path "$env:USERPROFILE\.claude\projects"  # session .jsonl
.\scripts\import\Import-GDrive.ps1     -Path drive_files.json    # Drive metadata (API/MCP shape)
.\scripts\import\Import-GitHub.ps1     -Owner myuser             # or -Path repos.json
.\scripts\import\Import-Higgsfield.ps1 -Path higgsfield.json     # AI generations (prompt=purpose)

# Retrieve WITHOUT reading any conversation history (the token-saving lookup):
.\scripts\import\Search-Index.ps1 -Query "final website" -Type archive
.\scripts\import\Search-Index.ps1 -Query "homepage" -Type image
```

Imported items land as `project = UNASSIGNED`, `status = NEEDS_REVIEW` until the
one-time Deep Audit routes them to a project. See `docs/ARCHITECTURE.md` for the
full ingestion design and `docs/INGESTION_DEMO.md` for real output.

### Compile project memory (adapter-agnostic)

The Project Compiler renders each project's `PROJECT_INDEX.md` + `ASSET_INDEX.md`
from the canonical index — it knows nothing about any specific source.

```powershell
# Route an item to a project (append-only decision). Uncertain -> UNCLASSIFIED.
.\scripts\import\Set-ItemProject.ps1 -Id fe78b9858761 -Project "Vinyl Lab" -Confident

# Render every project + the UNASSIGNED/UNCLASSIFIED buckets from the index.
.\scripts\Compile-ProjectMemory.ps1 -Project ALL

# Convert readable docs in _RAW to Markdown under 03_CONVERTED_MD (records
# converted_md in the index). Uses Pandoc/MarkItDown if present, else native
# conversion; unconvertible files (e.g. PDF without a tool) are logged, skipped.
.\scripts\Convert-Documents.ps1 -Project ALL
```

The canonical schema and the compiler-first build order are in `docs/SCHEMA.md`.

---

## Where files live (memory root)

By default everything is created under **`GPT-Memory\`** next to this repo.
Point it anywhere by setting an environment variable **or** passing `-Root`:

```powershell
# Per-run:
.\scripts\Save-Session.ps1 -Project "Vinyl Lab" -Root "D:\GPT Memory"

# Or set once for the session (also honored by Save-Session.cmd):
$env:GPT_MEMORY_ROOT = "D:\GPT Memory"
```

---

## Command reference — `Save-Session.ps1`

| Parameter | Meaning |
|-----------|---------|
| `-Project <name>` | Project to save into. Omit to be prompted / pick from a list. |
| `-Summary <text>` | Session summary. Omit to type it interactively. |
| `-SummaryFile <path>` | Read the summary from a file instead. |
| `-Todo <a>,<b>` | New TODO items appended to `TODO.md` and the snapshot. |
| `-Decision "what\|why"` | Decision + rationale appended to `DECISIONS.md`. |
| `-Change <text>` | Entry added to `CHANGELOG.md` (grouped by date). |
| `-Asset "name\|contains\|used for\|path"` | Row appended to `ASSET_INDEX.md` (status `NEEDS_REVIEW`). |
| `-SkillUsed <a>,<b>` | Skills/modules used this session, logged to `SKILLS_USED.md`. |
| `-NextAction <text>` | The single most important next step. |
| `-Status Green\|Yellow\|Red\|Blocked` | Resulting traffic-light status (default `Green`). |
| `-BlockedReason <text>` | Why it's blocked (used with `Red`/`Blocked`). |
| `-Root <path>` | Memory root override. |
| `-NonInteractive` | Never prompt (requires `-Project`); for automation. |

---

## Folder structure (created per project)

```
GPT-Memory/
  Projects/
    <ProjectName>/
      00_CURRENT/
        STATE.md   TODO.md   DECISIONS.md   CHANGELOG.md
        SOURCE_OF_TRUTH.md   STATUS.txt
      01_SESSIONS/        # SESSION_YYYY-MM-DD_HH-MM.md snapshots
      02_ASSETS/          # (Phase 4)
      03_CONVERTED_MD/    # (Phase 5)
      04_IDEAS/  05_DONE/  06_BLOCKED/  07_CANCELLED/  08_ARCHIVE/
      _backups/           # automatic pre-change backups
      ASSET_INDEX.md
      SKILLS_AVAILABLE.md   SKILLS_USED.md
      PROJECT_DASHBOARD.md
  _SKILLS/
    SKILLS_LIBRARY.md     # master cross-project skills catalog
  _logs/
    actions.log           # every action, appended
```

The full folder tree is created now so it's ready for later phases; the files
driven by later phases start as placeholders and are filled in then.

---

## Repository layout

```
scripts/
  Save-Session.ps1        # the Save Session workflow (main entry point)
  New-Project.ps1         # idempotent scaffolding + mandatory-file verification
  Get-ProjectContext.ps1  # runs the 5-step pre-answer protocol (read-only)
  Compile-ProjectMemory.ps1 # generic compiler: canonical records -> project memory
  Convert-Documents.ps1   # Markdown converter: _RAW docs -> 03_CONVERTED_MD (Pandoc/MarkItDown/native)
  common.ps1              # shared helpers: backup-before-write, logging, status
  templates/              # starter Markdown for every memory file
  import/                 # ingestion adapters + index
    common-ingest.ps1        #   hashing, raw-copy, append-index/overlay/deltas, cards
    Import-Files.ps1         #   files adapter: ZIP/PDF/img/video/HTML/MD/DOC/CSV/text
    Import-Conversations.ps1 #   ChatGPT + Claude export adapter (transcripts + cards)
    Import-ClaudeCode.ps1    #   Claude Code session .jsonl adapter
    Import-GDrive.ps1        #   Google Drive metadata adapter
    Import-GitHub.ps1        #   GitHub repositories adapter
    Import-Higgsfield.ps1    #   Higgsfield AI-generations adapter
    Set-ItemProject.ps1      #   assign an item to a project / UNCLASSIFIED (overlay)
    Search-Index.ps1         #   retrieval: answer "where is X?" from the index
docs/
  SCHEMA.md              # canonical Project Memory schema (the adapter contract)
  ARCHITECTURE.md        # compiler-first design + token model
  INGESTION_DEMO.md      # real ingestion/retrieval output
Save-Session.cmd         # double-clickable launcher for Save-Session.ps1
PROJECT_RULES.md         # mandatory rules (8 files + 5-step protocol)
GPT-Memory/
  _SKILLS/SKILLS_LIBRARY.md  # master skills catalog
  _RAW/ _INDEX/ _STAGING/    # ingestion output (runtime; gitignored)
  Projects/Vinyl Lab/        # tested sample project
README.md
```

---

## Try the included sample

A ready-made **`Vinyl Lab`** sample project is committed under
`GPT-Memory/Projects/Vinyl Lab/` so you can see exactly what a saved session
produces before running anything.

---

## Roadmap (not yet built)

Compiler-first order (see `docs/SCHEMA.md`):

| Step | Deliverable | Status |
|------|-------------|--------|
| 1 | Canonical Project Memory schema (adapter contract) | **defined** |
| 2 | Generic Project Compiler (records → project memory) | **built & tested** |
| 3 | Doc→Markdown converter (Pandoc / MarkItDown / native fallback) | **built & tested** |
| 4 | Adapters — files ✓, conversations ✓, claude-code ✓, gdrive ✓, github ✓, higgsfield ✓ | **built & tested** |
| 5 | One-time Deep Audit — classify / merge duplicates / route (→ UNCLASSIFIED if unsure) | next |
| 6 | Publish canonical Project Memory (compile ALL) | ready |
| 7 | Engine-specific caches (only if needed) | later |
| — | Save Session → **SessionDelta only**; Compiler owns all generated files | **built & tested** |
| later | Folder generator, dashboard, project-oriented sidebar | UI deferred |

The Project Compiler never depends on any single engine's data structure —
Claude is Adapter #1 of many. Foundation is built and tested before any UI.
