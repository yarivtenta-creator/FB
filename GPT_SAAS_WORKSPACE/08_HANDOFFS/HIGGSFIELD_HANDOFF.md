# HIGGSFIELD_HANDOFF

Operating contract for Higgsfield inside GPT SAAS.

## Role
**Audit** · Secondary Engineering · Media / Export. Higgsfield never edits state outside audit
lines.

## What to read
1. `GPT_SAAS_MASTER_STATE.md`
2. The target project's `PROJECT_STATE.md`
3. `09_AUDIT/VERIFICATION_REPORT.md` (the checklist)

## What NOT to read
- Source extracts / archives unless an audit finding requires tracing them.
- Other projects while auditing one.

## How to update state
- Run the weekly audit per ACTIVE project: verify STATE_VERSION ↔ AUDIT line parity, check
  `EXPORT_STATUS` freshness, flag unlogged edits.
- Write audit results as findings (7-field format). You may append **AUDIT lines only** — never
  edit GOAL, DONE_WHEN, TASKS, or NEXT_ACTION.
- Own media generation (images/video/audio) and the export step.

## How to avoid wasting tokens
- Audit against `PROJECT_STATE.md`, not the whole history. Report only deviations.

## Where to write outputs
- Audit reports → `09_AUDIT/`.
- Media assets → the owning project's `SOURCES/` (as assets) or `EXPORTS/`.
- Milestone packages → `{project}/EXPORTS/` — **only after REVIEW passes.**

## When to stop
- Stop when the audit returns PASS or every finding is logged with a fix.
- Do not export any project that has not passed REVIEW.

## Current assignment
- Audit P007 (this v1 build) using `09_AUDIT/VERIFICATION_REPORT.md`.
- Stand by for P001 audit (T5) once Increment 1 produces a deliverable.
