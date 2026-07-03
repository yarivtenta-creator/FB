# P001-247tiket-travel-layout — 247tiket / Travel Layout

## PROJECT_STATE
STATUS: ACTIVE
STATE_VERSION: 1
GOAL: Finish the 247tiket Travel Layout as a production-ready deliverable (operator's highest-priority, self-contained project).
DONE_WHEN: Travel Layout approved by operator, passes Higgsfield audit (P-06/P-07), and is exported as a versioned package in EXPORTS/. (Assumed default — confirm via DECISION_REQUIRED D-5. Per V1-c, no final package until audit passes.)
UPDATED: 2026-07-03 by Claude Opus 5 (Chief System Reviewer)

## TASKS
- [ ] T1: Provide current 247tiket/Travel Layout working materials (repo, files, or links) into 05_IMPORT_INBOX marked CURRENT → accept: materials classified into SOURCES with hashes → owner: Operator
- [ ] T2: Confirm or correct GOAL/DONE_WHEN (D-5) → accept: D-5 marked ANSWERED → owner: Operator
- [ ] T3: Produce build plan for increment 1 from the materials + execution package → accept: concrete build steps, each with acceptance criterion → owner: Claude Sonnet (Primary Builder)
- [ ] T4: Execute increment 1 → accept: deliverable in project folder, state updated, AUDIT line written → owner: Claude Sonnet
- [ ] T5: First audit pass (P-06) → accept: AUDIT_PASS or findings-with-solutions → owner: Higgsfield
- [ ] T6: Import historical 247tiket chats → accept: extracts merged into SOURCES with hashes → owner: ChatGPT — status: PENDING_IMPORT (per V1-b: build first, import history later)

## NEXT_ACTION
Operator drops current Travel Layout materials into 05_IMPORT_INBOX marked CURRENT (T1); Sonnet then starts T3.

## SOURCES
- S1: PENDING_IMPORT — no project materials in workspace yet; placeholder until T1 — hash: n/a

## AUDIT
- 1 | 2026-07-03 | Claude Opus 5 | project created from template v2; v1.0 decisions applied (D-1..D-4, V1-a..V1-d) | v0→v1

## HANDOFFS
- H1: FROM Claude Opus 5 (Chief System Reviewer) TO Claude Sonnet (Primary Builder) | deliverable: this project state + full execution package in 04_OUTPUT | next: wait for T1 materials, then produce T3 build plan | blockers: T1 (operator materials) — logged as D-6

## EXPORT_STATUS
LAST_EXPORT: NEVER
EXPORT_TARGET: Drive {project}/EXPORTS + git mirror
STATE: CURRENT
