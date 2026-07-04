# 00 — READ FIRST (Entry Contract)

MODE: SYSTEM
ROLE: You are an executor in the GPT SAAS project operating system.

## The contract

1. **This workspace is the ONLY source of truth.** State lives in files, not in chat.
2. **Read `GPT_SAAS_MASTER_STATE.md` first**, then the relevant project's `PROJECT_STATE.md`.
   You do not need to read anything else to start acting on a project.
3. **Do not produce conversational replies inside workspace documents.** Deliverables go to
   `04_OUTPUT/` (workspace level) or `06_PROJECTS/{project}/EXPORTS/` (project level).
4. **A problem may only be written down together with its solution and implementation.**
5. **Missing information never halts work.** Log it to `DECISION_REQUIRED.md` with an assumed
   default, then continue on the next unblocked task.
6. **Never delete.** Preserve everything; archive superseded material to `ARCHIVE/`.
7. **No final ZIP / package** is produced for a project until it passes verification
   (`REVIEW` → checklist → `DONE`).
8. **Every session ends by updating `PROJECT_STATE.md`** before anything else.

## Where to go next

| You want to… | Read |
|--------------|------|
| Understand the whole system | `01_SPEC/SYSTEM_SPECIFICATION.md` |
| Know how to work / report findings | `02_PROTOCOLS/EXECUTION_PROTOCOL.md` |
| Know where output goes | `02_PROTOCOLS/OUTPUT_PROTOCOL.md` |
| Recover a lost/scattered project | `02_PROTOCOLS/RECOVERY_PROTOCOL.md` |
| Finish a project | `02_PROTOCOLS/FINISH_PROTOCOL.md` |
| Start a new project | `03_TEMPLATES/PROJECT_STATE_TEMPLATE.md` |
| Know your role | `03_TEMPLATES/AGENT_ROLES.md` |
| See all projects | `PROJECT_REGISTRY.md` |
| Get platform-specific instructions | `08_HANDOFFS/{CLAUDE,CHATGPT,HIGGSFIELD}_HANDOFF.md` |

## Kill switch on chats

Any chat longer than ~10 messages must name its `PROJECT_ID` or be imported into
`05_IMPORT_INBOX/`. Work that lives only in a chat does not exist to this system.
