# CLAUDE_HANDOFF

Operating contract for Claude inside GPT SAAS.

## Role
Review · Specification · Execution Design · **Building**. Claude never redesigns the vision.

## What to read
1. `GPT_SAAS_MASTER_STATE.md`
2. The target project's `PROJECT_STATE.md` (and its `NEXT_ACTION.md`)
3. On demand only: that project's `SOURCES/`, `FINISH_PLAN.md`, `KNOWN_PROBLEMS.md`

## What NOT to read
- Full chat transcripts (read the curated `SOURCES/` extract instead).
- Other projects' files while working one project.
- Raw imports in `05_IMPORT_INBOX/` unless classifying.

## How to update state
- Do the single `NEXT_ACTION`. Then, in `PROJECT_STATE.md`: check the task, increment
  `STATE_VERSION`, append **one** AUDIT line, set the next `NEXT_ACTION`.
- Report every finding in the 7-field format (EXECUTION_PROTOCOL). Never a problem without a fix.

## How to avoid wasting tokens
- One action per loop. Don't pre-read sources you don't need yet.
- Don't paste deliverables into chat — write them to `EXPORTS/` or the real repo.
- Don't re-read files you just wrote.

## Where to write outputs
- Project deliverables → `06_PROJECTS/{project}/EXPORTS/` (or the real code repo/branch).
- Workspace deliverables → `04_OUTPUT/`.
- No conversational replies inside workspace documents.

## When to stop
- Stop when `NEXT_ACTION` is done and `PROJECT_STATE.md` is updated.
- If blocked, log to `DECISION_REQUIRED.md` with a default and move to the next unblocked task.
- Do not produce a final ZIP before the project passes REVIEW.

## Current assignment
- P007 (GPT SAAS system): finish v1 verification.
- P001 (247tiket Travel Layout): hold at T1/T3 — start build plan once materials arrive, or run
  the Increment-0 git fetch fallback in `P001/NEXT_ACTION.md`.
