# GPT SAAS — MASTER STATE

MODE: SYSTEM (local-first project operating system)
VERSION: v1.0
UPDATED: 2026-07-03 by Claude (Chief System Reviewer)
SOURCE_OF_TRUTH: `GPT_SAAS_WORKSPACE/` (git repo `yarivtenta-creator/FB`, branch `claude/gpt-saas-v1-build-x1pq5x`) + Drive mirror `GPT_SAAS_WORKSPACE/`

---

## WHAT THIS IS

GPT SAAS is a private, local-first **project operating system**. It replaces scattered
chats with structured project folders, Markdown state files, a registry, a dashboard, and
recovery/finish workflows. The system state lives in **files, not in chat**.

It is the shared source of truth for every executor: **Claude, ChatGPT, Higgsfield,** and
future co-workers. Any agent acts by reading a project's `PROJECT_STATE.md` — nothing else
is required to start work.

## CORE PRINCIPLES (binding)

1. One project = one folder.
2. One project = one state (`PROJECT_STATE.md` is the single source of truth).
3. Preserve all future work — nothing is deleted, only archived.
4. Historical imports enrich existing projects; they never overwrite them.
5. Focus on **finishing** projects, not accumulating chats.
6. Missing information never halts work: log it to `DECISION_REQUIRED.md` with an assumed
   default and continue.
7. No final ZIP / package is produced until the owning project passes verification.

## SYSTEM LAYOUT

```
GPT_SAAS_WORKSPACE/
├── GPT_SAAS_MASTER_STATE.md   ← this file (workspace-level source of truth)
├── PROJECT_REGISTRY.md        ← every real coding/build project + status
├── dashboard.html             ← open in a browser; live view of the system
├── 00_CORE/                   ← entry contract (read first)
├── 01_SPEC/                   ← system specification + vision
├── 02_PROTOCOLS/              ← execution, output, token, recovery, finish rules
├── 03_TEMPLATES/              ← project template, state template, agent roles
├── 04_OUTPUT/                 ← generated deliverables only
├── 05_IMPORT_INBOX/           ← drop zone for historical chats / files
├── 06_PROJECTS/               ← one subfolder per project
│   └── P001_247tiket_Travel_Layout/
│       ├── PROJECT_STATE.md   ← the only mandatory read
│       ├── SOURCES.md / SOURCES/
│       ├── FILE_INVENTORY.md
│       ├── KNOWN_PROBLEMS.md
│       ├── FINISH_PLAN.md
│       ├── NEXT_ACTION.md
│       ├── CLAUDE_RECOVERY_INDEX.md
│       ├── ARCHIVE/           ← raw imports, superseded docs
│       └── EXPORTS/           ← milestone snapshots (only after verification)
├── 07_ARCHIVE/                ← retired projects, old workspace zips
├── 08_HANDOFFS/              ← platform sync files (Claude / ChatGPT / Higgsfield)
└── 09_AUDIT/                  ← verification + audit reports
```

`PROJECT_ID` format for deliverables: `P{NNN}_{Name}` (e.g. `P001_247tiket_Travel_Layout`).

## SYSTEM STATE

| Component            | Status | Location |
|---------------------|--------|----------|
| Dashboard            | READY  | `dashboard.html` |
| Workspace tree       | READY  | `GPT_SAAS_WORKSPACE/` |
| Project registry     | READY  | `PROJECT_REGISTRY.md` |
| Project folders      | READY  | `06_PROJECTS/` |
| Markdown state files | READY  | `06_PROJECTS/*/PROJECT_STATE.md` |
| Import inbox         | READY  | `05_IMPORT_INBOX/` |
| Recovery workflow    | READY  | `02_PROTOCOLS/RECOVERY_PROTOCOL.md` |
| Finish-project mode  | READY  | `02_PROTOCOLS/FINISH_PROTOCOL.md` |
| Platform sync files  | READY  | `08_HANDOFFS/` + top-level `*_HANDOFF.md` |
| Audit / verification | READY  | `09_AUDIT/VERIFICATION_REPORT.md` |
| P001 pilot project   | ACTIVE | `06_PROJECTS/P001_247tiket_Travel_Layout/` |

## ACTIVE PROJECTS SUMMARY

See `PROJECT_REGISTRY.md` for the full list. Pilot in progress:

- **P001 — 247tiket / Travel Layout** — STATUS: ACTIVE — highest priority. Next action:
  operator drops current Travel Layout materials into `05_IMPORT_INBOX/` marked `CURRENT`,
  then the builder starts the increment-1 build plan.

## GLOBAL NEXT ACTION

Verify GPT SAAS v1 (see `09_AUDIT/VERIFICATION_REPORT.md`), then execute P001's
`NEXT_ACTION.md`. Do **not** finish any website until GPT SAAS v1 is verified.

## AUDIT

- 1 | 2026-07-03 | Claude | GPT SAAS v1 built: dashboard, workspace, registry, protocols, P001, handoffs, verification | v0→v1
