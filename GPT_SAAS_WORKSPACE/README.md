# GPT SAAS v1 — Project Operating System

A local-first project operating system. It replaces scattered chats with structured project
folders, Markdown state files, a registry, a dashboard, and recovery/finish workflows. The
system is the shared source of truth for Claude, ChatGPT, Higgsfield, and future co-workers.

**State lives in files, not in chat.**

## Start here

1. Open `dashboard.html` in a browser for the live view.
2. Read `00_CORE/00_READ_FIRST.md` (the entry contract).
3. See `GPT_SAAS_MASTER_STATE.md` (workspace source of truth) and `PROJECT_REGISTRY.md`.

## Layout

```
00_CORE/         entry contract      05_IMPORT_INBOX/ drop zone
01_SPEC/         spec + vision       06_PROJECTS/     one folder per project
02_PROTOCOLS/    how work is done    07_ARCHIVE/      retired material
03_TEMPLATES/    project/state tmpl  08_HANDOFFS/     platform sync files
04_OUTPUT/       deliverables        09_AUDIT/        verification + audit
```

## Key workflows

- **Recovery** (`02_PROTOCOLS/RECOVERY_PROTOCOL.md`) — turn a scattered project into one folder
  with a single source of truth.
- **Finish** (`02_PROTOCOLS/FINISH_PROTOCOL.md`) — drive a project to a verified DONE. No final
  package before verification passes.

## Status

GPT SAAS **v1 is verified** — see `09_AUDIT/VERIFICATION_REPORT.md`. Pilot project **P001 —
247tiket / Travel Layout** is ACTIVE. Next steps in `TOMORROW_PLAN.md`.
