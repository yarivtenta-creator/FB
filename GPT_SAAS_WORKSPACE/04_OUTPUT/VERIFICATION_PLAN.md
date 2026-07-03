# VERIFICATION_PLAN

Each check maps to a SYSTEM_REVIEW finding or risk. A check passes on evidence, not assertion. Run V-01..V-09 once during Phase 2–3 (pilot), then the marked subset on every project.

## One-time system checks (pilot phase)

### V-01 — State schema resumability (F-01)
**Test:** Give a second agent only `P001/PROJECT_STATE.md` via P-02. **Pass:** it states the correct NEXT_ACTION and executes it without asking anything. **Runner:** Operator with ChatGPT.

### V-02 — Lifecycle gates hold (F-02, R-06)
**Test:** Attempt to mark the pilot DONE while one TASK is unchecked and EXPORT_STATUS=NEVER. **Pass:** P-07 returns REVIEW_FAILED naming the failed check; DONE only after gates pass. **Runner:** ChatGPT + Higgsfield.

### V-03 — Import dedup (F-03)
**Test:** Import the same historical chat twice through P-03→P-04. **Pass:** first run → MERGED S{n}; second run → REJECTED_DUPLICATE, zero state change except the audit line. **Runner:** ChatGPT.

### V-04 — Handoff completeness (F-04)
**Test:** Claude hands the pilot to Co-worker via P-05. **Pass:** Co-worker completes the named action with zero clarification questions. **Runner:** Operator.

### V-05 — Single authoritative spec (F-05)
**Test:** Inspect workspace v2. **Pass:** 00_READ_FIRST.md points to exactly one spec path; OUTPUT_PROTOCOL lists 9 deliverables. **Runner:** Higgsfield.

### V-06 — Audit catches unlogged edits (F-06, R-01, R-05)
**Test:** Deliberately edit PROJECT_STATE.md (change a task) without incrementing STATE_VERSION or adding an AUDIT line; run P-06. **Pass:** audit reports version/line mismatch as a finding with a fix. **Runner:** Higgsfield.

### V-07 — Resume token budget (F-07, R-03)
**Test:** Measure the mandatory read of a P-02 resume on the pilot. **Pass:** only PROJECT_STATE.md read; file ≤400 lines. **Runner:** Operator (session inspection).

### V-08 — Restore drill (F-08, R-04)
**Test:** From the latest snapshot ZIP alone (no live Drive folder), rebuild a workspace and resume the pilot. **Pass:** P-02 works from the restored copy. **Runner:** Higgsfield + Co-worker.

### V-09 — Task dispatch loop (F-09)
**Test:** One task flows: written in TASKS → NEXT_ACTION → executed by Co-worker → checked with result note → new NEXT_ACTION set. **Pass:** whole loop visible in state diffs and AUDIT. **Runner:** Co-worker.

## Recurring checks (every project)

| When | Check |
|---|---|
| Weekly | P-06 audit: version parity, NEXT_ACTION present, hash uniqueness, export freshness, size cap, open-decision age |
| Before DONE | P-07: evidence for DONE_WHEN, tasks closed/descoped, export done |
| After each milestone export | Restore drill (spot-check, monthly at minimum) |

## Reporting

Audit and verification results are written as findings (7-field format) into the project's AUDIT/TASKS — never as chat. A failed check always produces a NEXT_ACTION, so verification can never stall a project without also pointing at the fix.
