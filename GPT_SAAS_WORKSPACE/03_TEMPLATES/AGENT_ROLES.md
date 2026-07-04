# AGENT_ROLES

| Agent | Owns | Never does |
|---|---|---|
| **Claude** | Review, Specification, Execution Design, Building | Redesign the vision |
| **ChatGPT** | Architecture, Classification, Validation | Merge without hash check |
| **Higgsfield** | Audit, Secondary Engineering, Media/Export | Edit state outside audit lines |
| **Co-worker** | Execution of TASKS | Change GOAL / DONE_WHEN |

Each agent's operating contract lives in its handoff file: `08_HANDOFFS/{AGENT}_HANDOFF.md`.
Every agent reads `00_CORE/00_READ_FIRST.md` before acting.
