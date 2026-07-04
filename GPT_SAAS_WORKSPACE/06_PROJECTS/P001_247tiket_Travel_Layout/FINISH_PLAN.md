# P001 — FINISH_PLAN

Ordered path from current state to a verified DONE. Each increment ends in a verifiable
artifact. No new scope during finish mode.

## Current position

- Recovery: ~70% (structure + source map known). Completion: ~45% (deliverable not assembled).
- Blocked on: current materials in workspace (KP-1) and confirmed DONE_WHEN (KP-2).

## Increments

### Increment 0 — Consolidate sources (recovery)
- Fetch candidate git branches (start `claude/tenta-launch-setup-l4h420`), inventory real files
  into `FILE_INVENTORY.md`, merge into `SOURCES/` with hashes.
- Operator drops current materials into `05_IMPORT_INBOX` (T1).
- **Verifiable:** `SOURCES/` contains the real Travel Layout files with hashes; inventory has
  no "to fetch" rows for the chosen base.

### Increment 1 — Assemble the base layout
- From consolidated sources, produce the working Travel Layout skeleton (pages, structure,
  nav) as a runnable artifact in `EXPORTS/increment-1/` (or the real repo branch).
- **Verifiable:** layout opens locally; core pages render.

### Increment 2 — Content + booking flow
- Fill copy, sections, and the booking/search flow per confirmed GOAL.
- **Verifiable:** primary user path works end to end (browse → select → CTA).

### Increment 3 — Polish + responsive + i18n (if in scope)
- Visual polish, responsive behavior, any required languages.
- **Verifiable:** passes a design/responsive check on mobile + desktop.

### Increment 4 — Review + audit
- Set STATUS: REVIEW; run verification checklist; Higgsfield audit pass (T5).
- **Verifiable:** all applicable checks PASS; findings (if any) carry fixes.

### Increment 5 — Export + DONE
- Produce the milestone package in `EXPORTS/`, set EXPORT_STATUS=EXPORTED, mark DONE.
- **Verifiable:** package exists; restore/open drill passes.

## Guardrails

- **Do not finish the website yet** unless GPT SAAS v1 is already verified (it is being verified
  in this build — see `09_AUDIT/VERIFICATION_REPORT.md`).
- No final ZIP before Increment 4 passes.
- One increment at a time; update PROJECT_STATE after each.
