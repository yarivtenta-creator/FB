# P001_247tiket_Travel_Layout — 247tiket / Travel Layout

## PROJECT_STATE
STATUS: ACTIVE
STATE_VERSION: 2
GOAL: Finish the 247tiket Travel Layout as a production-ready deliverable (operator's highest-priority, self-contained project).
DONE_WHEN: Travel Layout approved by operator, passes Higgsfield audit, and is exported as a versioned package in EXPORTS/. (Assumed default — confirm via DECISION_REQUIRED D-5. No final package until audit passes.)
UPDATED: 2026-07-04 by Claude (Chief System Reviewer)

## TASKS
- [ ] T1: Provide current 247tiket/Travel Layout working materials (repo, files, or links) into 05_IMPORT_INBOX marked CURRENT → accept: materials classified into SOURCES with hashes → owner: Operator
- [ ] T2: Confirm or correct GOAL/DONE_WHEN (D-5) → accept: D-5 marked ANSWERED → owner: Operator
- [ ] T3: Produce build plan for increment 1 from the materials + execution package → accept: concrete build steps, each with acceptance criterion → owner: Claude (Primary Builder)
- [ ] T4: Execute increment 1 → accept: deliverable in project folder, state updated, AUDIT line written → owner: Claude
- [ ] T5: First audit pass → accept: AUDIT_PASS or findings-with-solutions → owner: Higgsfield
- [ ] T6: Import historical 247tiket chats → accept: extracts merged into SOURCES with hashes → owner: ChatGPT — status: PENDING_IMPORT (build first, import history later)

## NEXT_ACTION
Operator drops current Travel Layout materials into 05_IMPORT_INBOX marked CURRENT (T1); Claude then starts T3 build plan.

## SOURCES
- S1: Drive `GPT_SAAS_WORKSPACE_v1/…/P001-247tiket-travel-layout/` — existing project folder (STATE, SOURCES, ARCHIVE, EXPORTS) — hash: drive-ref
- S2: Git `yarivtenta-creator/FB` branches (tenta/travel/html builds) — candidate code sources, to fetch — hash: pending
- S3: PENDING_IMPORT — historical 247tiket chats (Claude + ChatGPT) — hash: n/a

## AUDIT
- 1 | 2026-07-03 | Claude (Chief System Reviewer) | project created from template v2; v1.0 decisions applied | v0→v1
- 2 | 2026-07-04 | Claude (Chief System Reviewer) | rebuilt in git local-first workspace; recovery indexes + finish plan + inventory + known problems added | v1→v2

## HANDOFFS
- H1: FROM Claude (Chief System Reviewer) TO Claude (Primary Builder) | deliverable: this project state + full recovery package | next: wait for T1 materials, then produce T3 build plan | blockers: T1 (operator materials) — logged as D-6

## EXPORT_STATUS
LAST_EXPORT: NEVER
EXPORT_TARGET: Drive {project}/EXPORTS + git mirror
STATE: CURRENT
