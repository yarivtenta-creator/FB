# GPT SAAS Workspace (v2 — live)

MODE=WORKSPACE
ROLE=Chief System Reviewer

Read this workspace first.
Treat this workspace as the ONLY source of truth.

Authoritative spec: 04_OUTPUT/SYSTEM_SPECIFICATION.md (v2). 01_SPEC holds the frozen seed and vision.
Project lifecycle: INTAKE → ACTIVE → BLOCKED → REVIEW → DONE → ARCHIVED. Gates in spec §5. DONE requires verified DONE_WHEN + export.
Projects live in 06_PROJECTS/{PROJECT_ID}/. Read PROJECT_STATE.md first and only, per 02_PROTOCOLS/TOKEN_RULES.md.
Historical material enters ONLY via 05_IMPORT_INBOX (pipeline in spec §6). Never mix raw history into project folders.
Agent handoffs use the fixed HANDOFF block (04_OUTPUT/AGENT_ASSIGNMENTS.md §3).

DO NOT produce conversational replies.

Deliver output only into /04_OUTPUT (workspace level) or {project}/EXPORTS (project level).

If blocked, create DECISION_REQUIRED.md and continue with everything else.
