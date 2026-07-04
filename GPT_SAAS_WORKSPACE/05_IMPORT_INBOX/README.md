# 05_IMPORT_INBOX — Drop Zone

Drop raw historical material here: ChatGPT/Claude chat exports, docs, zips, screenshots,
links. **Files here are never edited.**

## How to drop

- Name the file with a hint of the project, e.g. `247tiket-thread-2026-06.md`, or add a
  one-line header naming the target project.
- Mark current working materials with `CURRENT` in the filename or first line.

## What happens next (import pipeline)

1. **Classify** → each file is tagged with a target `PROJECT_ID` (or `NEW` / `DISCARD-DUPLICATE`)
   and an extract is produced (decisions, assets, open questions only).
2. **Merge** → the extract is appended to the project's `SOURCES/` with a content hash;
   duplicates rejected; the raw file moves to that project's `ARCHIVE/`; one AUDIT line written.

Unclassifiable items stay here and are flagged in `DECISION_REQUIRED.md`. Nothing is deleted.

_Currently empty — awaiting first operator drop (see P001 T1)._
