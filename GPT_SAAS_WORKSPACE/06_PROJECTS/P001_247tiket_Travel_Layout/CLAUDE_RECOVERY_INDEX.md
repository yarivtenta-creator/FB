# P001 — CLAUDE_RECOVERY_INDEX

Claude-side sources for 247tiket / Travel Layout. Built from `git ls-remote --heads origin`
on `yarivtenta-creator/FB` plus known Claude project/worker context.

## Git branches (candidate sources — to fetch and confirm)

| Branch | Likely relevance | Action |
|--------|------------------|--------|
| `claude/tenta-launch-setup-l4h420` | "Tenta" launch setup — likely 247tiket/travel launch | Fetch, inventory |
| `claude/html-website-merge-package-dh4fio` | HTML site merge package — possible travel layout assets | Fetch, inventory |
| `claude/build-index-homepage-6psau0` | Homepage/index build — possible layout | Fetch, inventory |
| `main` / `claude/ai-growth-platform-landing-vo6noa` | AI Business Growth landing (P002, not P001) | Exclude from P001 |

> Branch→project mapping is inferred from names and must be confirmed by fetching each branch
> and inspecting its files. Log confirmations in `FILE_INVENTORY.md`.

## Claude projects / chats / code workers

- Claude project(s) related to 247tiket / travel booking layout — **PENDING_IMPORT** (export
  the relevant chats into `05_IMPORT_INBOX/` marked with project P001).
- Claude Code workers: this workspace build session (`claude/gpt-saas-v1-build-x1pq5x`).

## Local paths

- TBD — operator to provide any local Travel Layout folders (T1).

## How to use this index

Only fetch a branch/chat when `NEXT_ACTION` requires it (TOKEN_PROTOCOL). Start with
`claude/tenta-launch-setup-l4h420` as the most likely current source.
