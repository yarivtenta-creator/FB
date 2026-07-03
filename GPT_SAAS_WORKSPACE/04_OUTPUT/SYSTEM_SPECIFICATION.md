# SYSTEM_SPECIFICATION (v2)

Supersedes nothing; expands the frozen seed at 01_SPEC/SYSTEM_SPECIFICATION.md. The vision is unchanged: **GPT SAAS is a private project operating system. Replace chat-centric work with project-centric work.**

## 1. Core principles (from seed, binding)

1. One project = one folder.
2. One project = one state (a single PROJECT_STATE.md is the source of truth).
3. Preserve all future work — nothing is deleted, only archived.
4. Historical imports enrich existing projects.
5. Focus on finishing projects, not accumulating chats.

## 2. System layout

```
GPT_SAAS_WORKSPACE/
├── 00_CORE/            entry contract (read first)
├── 01_SPEC/            frozen seed spec + vision
├── 02_PROTOCOLS/       execution, output, token rules
├── 03_TEMPLATES/       project template, agent roles
├── 04_OUTPUT/          generated deliverables only
├── 05_IMPORT_INBOX/    drop zone for historical chats/files   [new]
├── 06_PROJECTS/        one subfolder per project              [new]
│   └── {PROJECT_ID}/
│       ├── PROJECT_STATE.md      the only mandatory read
│       ├── SOURCES/              curated extracts + assets
│       ├── ARCHIVE/              raw imports, superseded docs
│       └── EXPORTS/              milestone snapshots
└── 07_ARCHIVE/         retired projects, old workspace ZIPs   [new]
```

`PROJECT_ID` format: `P{NNN}-{kebab-name}`, e.g. `P001-landing-page`.

## 3. The one-state rule

- PROJECT_STATE.md is the only file an agent must read to act on a project.
- Everything else (SOURCES, ARCHIVE) is read on demand, only when NEXT_ACTION requires it.
- Every state edit increments `STATE_VERSION` and appends one AUDIT line.
- If PROJECT_STATE.md and any other file disagree, PROJECT_STATE.md wins; the discrepancy is logged in AUDIT.

## 4. PROJECT_STATE.md schema

Sections are fixed, in this order, all mandatory (empty allowed only where noted):

```markdown
# {PROJECT_ID} — {Project Name}

## PROJECT_STATE
STATUS: INTAKE | ACTIVE | BLOCKED | REVIEW | DONE | ARCHIVED
STATE_VERSION: {integer, starts at 1}
GOAL: {one sentence — what "finished" delivers}
DONE_WHEN: {measurable completion criterion}
UPDATED: {YYYY-MM-DD} by {agent}

## TASKS
- [ ] T{n}: {verb-first task} → accept: {criterion} → owner: {agent}
- [x] T{n}: ... (done tasks stay, checked)

## NEXT_ACTION
{Exactly ONE action, one line, assigned to one owner. Never empty while STATUS=ACTIVE.}

## SOURCES
- S{n}: {path or link} — {one-line description} — hash: {8-char content hash}

## AUDIT
- {seq} | {date} | {agent} | {action} | v{n}→v{n+1}

## HANDOFFS
- H{n}: FROM {agent} TO {agent} | deliverable: {what} | next: {action} | blockers: {none|list}

## EXPORT_STATUS
LAST_EXPORT: {date or NEVER}
EXPORT_TARGET: {Drive folder / git / zip}
STATE: CURRENT | STALE | EXPORTED
```

Size cap: 400 lines. Above cap → move oldest AUDIT/HANDOFF lines to `ARCHIVE/STATE_HISTORY.md`, keep last 20 of each.

## 5. Project lifecycle

| Status | Meaning | Exit gate |
|---|---|---|
| INTAKE | Folder created from template | GOAL + DONE_WHEN filled, ≥1 task |
| ACTIVE | Being worked | NEXT_ACTION always set |
| BLOCKED | Waiting on a decision | Blocker logged in DECISION_REQUIRED.md; auto-return to ACTIVE on answer |
| REVIEW | DONE_WHEN claimed met | Verification checklist (VERIFICATION_PLAN.md) passes |
| DONE | Verified finished | EXPORT_STATUS = EXPORTED |
| ARCHIVED | Moved to 07_ARCHIVE | Immutable |

Rule: a project may not sit in ACTIVE without a NEXT_ACTION. If no next action exists, it is either DONE-candidate (→ REVIEW) or BLOCKED.

## 6. Import pipeline (historical enrichment)

1. **Drop:** raw chat export / doc / zip lands in `05_IMPORT_INBOX/`. Never edited.
2. **Classify (ChatGPT role, prompt P-03):** output = target PROJECT_ID (or `NEW` or `DISCARD-DUPLICATE`), plus an extract containing only: decisions made, assets produced, open questions. Never the full transcript.
3. **Merge (prompt P-04):** extract appended to project `SOURCES/` with content hash; duplicates (same hash) rejected; raw file moved to project `ARCHIVE/`; one AUDIT line written.

Nothing in the inbox is deleted — classified items move to `ARCHIVE/`, unclassifiable items stay in inbox flagged in DECISION_REQUIRED.md.

## 7. Audit rules

- AUDIT section is append-only. Editing or deleting past lines is prohibited.
- Every STATE_VERSION increment = exactly one AUDIT line.
- Higgsfield runs the audit prompt (P-06) weekly per ACTIVE project: verifies version/line parity, checks EXPORT_STATUS freshness, flags unlogged edits.

## 8. Agent roles (binding, from 03_TEMPLATES/AGENT_ROLES.md)

| Agent | Owns | Never does |
|---|---|---|
| Claude | Review, Specification, Execution Design | Redesign the vision |
| ChatGPT | Architecture, Classification, Validation | Merge without hash check |
| Higgsfield | Audit, Secondary Engineering, Export | Edit state outside audit lines |
| Co-worker | Execution of TASKS | Change GOAL/DONE_WHEN |

Detailed contracts: AGENT_ASSIGNMENTS.md.

## 9. Output discipline

- Generated deliverables go to 04_OUTPUT (workspace level) or `{project}/EXPORTS/` (project level). Nowhere else.
- No conversational replies inside workspace documents.
- A problem may only be written down together with its solution and implementation (EXECUTION_PROTOCOL).
- Missing information never halts work: log to DECISION_REQUIRED.md with an assumed default, continue.
