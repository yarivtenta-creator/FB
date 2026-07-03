# Project Template (v2 — full schema, per 04_OUTPUT/SYSTEM_SPECIFICATION.md §4)

Copy everything below into 06_PROJECTS/{PROJECT_ID}/PROJECT_STATE.md.
PROJECT_ID format: P{NNN}-{kebab-name}. Also create empty SOURCES/, ARCHIVE/, EXPORTS/ folders.
Size cap: 400 lines — above cap, move oldest AUDIT/HANDOFF lines to ARCHIVE/STATE_HISTORY.md (keep last 20 of each).

---

# {PROJECT_ID} — {Project Name}

## PROJECT_STATE
STATUS: INTAKE | ACTIVE | BLOCKED | REVIEW | DONE | ARCHIVED
STATE_VERSION: 1
GOAL: {one sentence — what "finished" delivers}
DONE_WHEN: {measurable completion criterion}
UPDATED: {YYYY-MM-DD} by {agent}

## TASKS
- [ ] T1: {verb-first task} → accept: {criterion} → owner: {agent}

## NEXT_ACTION
{Exactly ONE action, one line, one owner. Never empty while STATUS=ACTIVE.}

## SOURCES
- S1: {path or link} — {one-line description} — hash: {8-char content hash}

## AUDIT
- 1 | {date} | {agent} | project created | v0→v1

## HANDOFFS
- H1: FROM {agent} TO {agent} | deliverable: {what} | next: {action} | blockers: none

## EXPORT_STATUS
LAST_EXPORT: NEVER
EXPORT_TARGET: {Drive folder / git / zip}
STATE: CURRENT
