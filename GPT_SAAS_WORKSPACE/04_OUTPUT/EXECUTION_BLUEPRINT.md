# EXECUTION_BLUEPRINT

Goal: take GPT SAAS from workspace-v1 (documents) to an operating system-in-use (projects moving to DONE). Four phases. Each step has an owner and an exit criterion. No step requires information beyond DECISION_REQUIRED.md defaults.

## Phase 0 — Secure the substrate (day 0)

| # | Step | Owner | Exit criterion |
|---|---|---|---|
| 0.1 | Unzip GPT_SAAS_WORKSPACE_v1.zip into a live Drive folder `GPT_SAAS_WORKSPACE/` (stop working from the ZIP) | Co-worker | Folder tree matches SYSTEM_SPECIFICATION §2 |
| 0.2 | Create the new folders: 05_IMPORT_INBOX, 06_PROJECTS, 07_ARCHIVE | Co-worker | Folders exist, each with a 1-line README |
| 0.3 | Snapshot: keep v1.zip in 07_ARCHIVE; adopt versioned-zip rule (v2 after Phase 1) | Higgsfield | v1.zip in archive; rule noted in EXPORT_STATUS convention |
| 0.4 | Confirm git mirror (this branch) as second backup | Co-worker | Push verified |

## Phase 1 — Install the operating rules (day 0–1)

| # | Step | Owner | Exit criterion |
|---|---|---|---|
| 1.1 | Adopt PROJECT_STATE.md schema (SYSTEM_SPECIFICATION v2 §4) as the template — replace the name-only PROJECT_TEMPLATE.md | Claude | 03_TEMPLATES/PROJECT_TEMPLATE.md contains full schema |
| 1.2 | Adopt lifecycle + gates (§5) | Claude | Referenced from 00_READ_FIRST.md |
| 1.3 | Adopt handoff block + agent contracts (AGENT_ASSIGNMENTS.md) | Claude | Each agent prompt (PROMPT_PACK) embeds its contract |
| 1.4 | Update 02_PROTOCOLS/OUTPUT_PROTOCOL.md to the 9-file deliverable list (resolves F-05) | Claude | Protocol lists 9 files incl. SYSTEM_SPECIFICATION.md |
| 1.5 | Answer D-1..D-4 in DECISION_REQUIRED.md or accept defaults | Operator | Decisions marked ANSWERED or DEFAULT-ACCEPTED |

## Phase 2 — Pilot project + import pipeline (day 1–3)

| # | Step | Owner | Exit criterion |
|---|---|---|---|
| 2.1 | Create pilot project `P001` from template using prompt P-01 (default pilot per D-3: the FB landing-page project already in the git repo) | Claude | PROJECT_STATE.md valid, STATUS=ACTIVE, NEXT_ACTION set |
| 2.2 | Drop 2–3 real historical chats into 05_IMPORT_INBOX | Operator | Files present, untouched |
| 2.3 | Classify imports with P-03 | ChatGPT | Each file → PROJECT_ID / NEW / DISCARD-DUPLICATE + extract |
| 2.4 | Merge extracts with P-04 | ChatGPT | SOURCES updated with hashes; raws in ARCHIVE; AUDIT lines written |
| 2.5 | First audit pass with P-06 | Higgsfield | Audit report: PASS or findings-with-solutions |
| 2.6 | Execute pilot's first 3 TASKS | Co-worker | Tasks checked off, state versions incremented |

## Phase 3 — Prove a finish (day 3–7)

| # | Step | Owner | Exit criterion |
|---|---|---|---|
| 3.1 | Drive pilot to DONE_WHEN | Co-worker | REVIEW status reached |
| 3.2 | Run verification checklist V-01..V-09 (VERIFICATION_PLAN.md) | Higgsfield + ChatGPT | All applicable checks PASS |
| 3.3 | Export: milestone zip to EXPORTS/, EXPORT_STATUS=EXPORTED | Higgsfield | Restore drill passes (V-08) |
| 3.4 | Mark DONE; write retrospective line in AUDIT | Claude | First finished project exists |

## Phase 4 — Scale (week 2+)

| # | Step | Owner | Exit criterion |
|---|---|---|---|
| 4.1 | Migrate remaining active work into 06_PROJECTS (one folder each) | Operator + ChatGPT | No active work outside a project folder |
| 4.2 | Weekly audit cadence live | Higgsfield | 2 consecutive weekly reports |
| 4.3 | Snapshot workspace as v2.zip | Higgsfield | v2 in Drive + git |
| 4.4 | Kill switch on chats: any chat >10 messages must name its PROJECT_ID or be imported | All | Rule added to 00_READ_FIRST.md |

## Standing rules during all phases

- Every finding reported anywhere uses the EXECUTION_PROTOCOL 7-field format.
- Every session ends by updating PROJECT_STATE.md before anything else.
- Blockers go to DECISION_REQUIRED.md; work continues on the next unblocked task.
