# P001 — KNOWN_PROBLEMS

Each problem is written **with its fix** (EXECUTION_PROTOCOL 7-field format). A problem without
a solution is not recorded here — it is escalated in `DECISION_REQUIRED.md`.

## KP-1 — Current working materials not in the workspace

- WHAT: The actual current Travel Layout files/repo/links are not in the workspace.
- WHERE: `06_PROJECTS/P001_247tiket_Travel_Layout/SOURCES/` (empty)
- WHY: Material still lives in chats and git branches; never consolidated.
- IMPACT: HIGH — the build cannot start (T3) until real materials are present.
- FIX: Operator drops current materials into `05_IMPORT_INBOX/` marked CURRENT; classify+merge.
- HOW: T1 → import pipeline → SOURCES updated with hashes.
- STATUS: LOGGED-WITH-DEFAULT (default: proceed from git candidate branches if operator delays)

## KP-2 — DONE_WHEN is an assumed default

- WHAT: Completion criterion is assumed, not confirmed by the operator.
- WHERE: `PROJECT_STATE.md` → DONE_WHEN
- WHY: Operator has not answered D-5.
- IMPACT: MEDIUM — risk of building to the wrong finish line.
- FIX: Operator confirms/corrects GOAL + DONE_WHEN (D-5).
- HOW: T2 → mark D-5 ANSWERED in DECISION_REQUIRED.md.
- STATUS: LOGGED-WITH-DEFAULT (default accepted: production-ready + audit-passed + exported)

## KP-3 — Candidate git branches unverified

- WHAT: Branch→project mapping (tenta/html/index) is inferred from names, not confirmed.
- WHERE: `CLAUDE_RECOVERY_INDEX.md`, `FILE_INVENTORY.md`
- WHY: Branches not yet fetched and inspected.
- IMPACT: MEDIUM — could recover from the wrong branch and waste effort.
- FIX: Fetch each candidate branch, inspect files, confirm which is the real Travel Layout.
- HOW: `git fetch origin <branch>` → inventory → update FILE_INVENTORY with real files+hashes.
- STATUS: LOGGED-WITH-DEFAULT (default: start with tenta-launch-setup as most likely)

## KP-4 — No export yet (this is correct, not a bug)

- WHAT: EXPORTS/ is empty; no ZIP produced.
- WHERE: `EXPORTS/`
- WHY: System rule — no final package before REVIEW passes.
- IMPACT: NONE — intended behavior.
- FIX: Produce the milestone package only after verification (FINISH_PROTOCOL step 7).
- HOW: reach REVIEW → pass checklist → export.
- STATUS: FIXED (by design; documented so it is not mistaken for missing work)
