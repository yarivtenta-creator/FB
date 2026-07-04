# P001 — NEXT_ACTION

**ONE action. One owner.** (Mirror of `PROJECT_STATE.md → NEXT_ACTION`.)

> Operator drops the current 247tiket / Travel Layout working materials (repo, files, or links)
> into `05_IMPORT_INBOX/` marked **CURRENT** (T1). Claude then starts the increment-1 build
> plan (T3).

## If the operator is not available right now

Default fallback (no blocking): Claude fetches `claude/tenta-launch-setup-l4h420` and the two
HTML-build candidate branches, inventories their files into `FILE_INVENTORY.md`, and merges the
real Travel Layout source into `SOURCES/` — completing Increment 0 of the FINISH_PLAN without
waiting.

Owner: Operator (primary) / Claude (fallback).
Blocker: KP-1 (materials), KP-2 (DONE_WHEN confirmation) — both logged with defaults.
