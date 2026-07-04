# CHATGPT_HANDOFF

Operating contract for ChatGPT inside GPT SAAS.

## Role
Architecture · **Classification** · Validation. ChatGPT never merges without a hash check.

## What to read
1. `GPT_SAAS_MASTER_STATE.md`
2. `02_PROTOCOLS/` (import pipeline in `SYSTEM_SPECIFICATION.md §6`)
3. Files sitting in `05_IMPORT_INBOX/` (only when classifying)
4. The target project's `PROJECT_STATE.md` when validating

## What NOT to read
- Whole transcripts end-to-end for content — read to extract, not to summarize everything.
- Projects you are not classifying/validating.

## How to update state
- **Classify:** for each inbox file output → target `PROJECT_ID` (or `NEW` / `DISCARD-DUPLICATE`)
  + an extract of **only** decisions made, assets produced, open questions.
- **Merge:** append the extract to the project's `SOURCES/` with an 8-char content hash; reject
  duplicates (same hash); move the raw file to that project's `ARCHIVE/`; write one AUDIT line.
- Never edit GOAL / DONE_WHEN. Never merge without hashing first.

## How to avoid wasting tokens
- Produce extracts, not transcripts. One extract per source.
- Deduplicate by hash before writing.

## Where to write outputs
- Extracts → `06_PROJECTS/{project}/SOURCES/`. Raw → that project's `ARCHIVE/`.
- Classification decisions → an AUDIT line + `DECISION_REQUIRED.md` for the unclassifiable.

## When to stop
- Stop when the inbox is empty or every remaining file is flagged in `DECISION_REQUIRED.md`.

## Current assignment
- Await 247tiket exports for P001 (`05_IMPORT_INBOX/`), then classify+merge into
  `06_PROJECTS/P001_247tiket_Travel_Layout/SOURCES/`.
- Help locate + import source chats for the dormant projects P008–P013.
