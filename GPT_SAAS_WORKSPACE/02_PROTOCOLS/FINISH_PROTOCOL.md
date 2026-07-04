# FINISH_PROTOCOL (Finish-Project Mode)

Drive a project from ACTIVE to a verified DONE. This is the mode that makes GPT SAAS about
**finishing**, not accumulating.

## Entry condition

`PROJECT_STATE.md` exists, GOAL and DONE_WHEN are set, and the operator has said "finish this
project" (or the project is the current pilot).

## Steps

1. **Freeze scope.** Re-read GOAL and DONE_WHEN. No new scope during finish mode — new ideas
   go to a `BACKLOG` note, not the plan.
2. **Build the finish plan.** `FINISH_PLAN.md` = the ordered, minimal set of increments that
   each end in a verifiable deliverable, from current state to DONE_WHEN.
3. **Execute increments.** For each: build → write deliverable to `EXPORTS/` (or the real repo)
   → check off the task → increment STATE_VERSION → append AUDIT line → update NEXT_ACTION.
4. **Clear KNOWN_PROBLEMS.** Every open problem must reach STATUS: FIXED or be explicitly
   deferred with operator sign-off.
5. **Move to REVIEW.** When DONE_WHEN is claimed met, set STATUS: REVIEW.
6. **Verify.** Run the verification checklist (`09_AUDIT/VERIFICATION_REPORT.md` template).
   All applicable checks must PASS.
7. **Export.** Only now: produce the milestone package in `EXPORTS/`, set
   `EXPORT_STATUS.STATE = EXPORTED`, `LAST_EXPORT = {date}`.
8. **Mark DONE.** Set STATUS: DONE, write a retrospective AUDIT line, update the registry.

## Hard rules

- **No final ZIP before REVIEW passes.** (This is why P001 has no ZIP yet.)
- One increment at a time; each ends in a verifiable artifact.
- If an increment reveals a blocker, log it with a default and continue the next increment.
- Finishing the workspace system (P007) is a prerequisite before finishing any hosted website
  through this workflow.
