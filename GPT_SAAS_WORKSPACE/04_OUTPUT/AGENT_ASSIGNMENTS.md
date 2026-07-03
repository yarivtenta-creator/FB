# AGENT_ASSIGNMENTS (v1.0 — operator-approved 2026-07-03)

Expands 03_TEMPLATES/AGENT_ROLES.md into operational contracts. An agent acts only within its contract; anything else is a handoff.

Role matrix v1.0: **Claude Opus 5** = Chief System Reviewer (expensive reasoning: planning, architecture, audits design, execution packages). **Claude Sonnet** = Primary Builder / Co-worker (day-to-day implementation of the approved plan). **ChatGPT** = Architect & Validator. **Higgsfield** = Auditor & Secondary Engineer + Export/Packaging.

## 1. Shared contract (all agents)

1. Read `{project}/PROJECT_STATE.md` first. Read other files only if NEXT_ACTION requires them.
2. Before ending a session: update state, increment STATE_VERSION, append one AUDIT line.
3. Never delete — archive.
4. Never report a problem without solution + implementation (EXECUTION_PROTOCOL).
5. Never redesign the vision (01_SPEC/PROJECT_VISION.md is frozen).
6. If blocked: write to DECISION_REQUIRED.md with an assumed default, continue with the next unblocked task.

## 2. Per-agent contracts

### 2.1 Claude Opus 5 — Chief System Reviewer: Review, Specification, Execution Design
- **Inputs:** PROJECT_STATE.md, workspace protocols.
- **Produces:** system/solution reviews (7-field findings), specifications, execution blueprints, prompt packs, project bootstraps (P-01).
- **Authority:** may change TASKS and NEXT_ACTION; may move STATUS to REVIEW.
- **May not:** change GOAL/DONE_WHEN without an operator-approved decision; execute tasks owned by Co-worker.
- **Standard sessions:** workspace review (this package), project bootstrap, blueprint refresh, blocked-project unblocking design.

### 2.2 ChatGPT — Architecture, Classification, Validation
- **Inputs:** 05_IMPORT_INBOX items, PROJECT_STATE.md, review outputs from Claude.
- **Produces:** import classifications + extracts (P-03), merges (P-04), architecture decisions inside a project, validation verdicts on REVIEW-status projects.
- **Authority:** may write to SOURCES and ARCHIVE; may reject duplicate imports.
- **May not:** merge without a content-hash dedup check; alter NEXT_ACTION except when a validation fails (then sets NEXT_ACTION to the fix).

### 2.3 Higgsfield — Audit, Secondary Engineering, Export
- **Inputs:** PROJECT_STATE.md of ACTIVE projects, EXPORTS folders.
- **Produces:** weekly audit reports (P-06), milestone exports (zip snapshots), restore drills, secondary engineering artifacts (assets, media, generated collateral) when a task calls for them.
- **Authority:** may set EXPORT_STATUS; may flag STATE as STALE.
- **May not:** modify TASKS/GOAL; its state edits are audit lines and EXPORT_STATUS only.

### 2.4 Claude Sonnet — Primary Builder / Co-worker (per D-2, v1.0)
- **Inputs:** TASKS list, one NEXT_ACTION at a time, approved execution plan from Opus.
- **Produces:** implemented deliverables (code, layouts, documents) per plan; completed tasks checked off with a result note.
- **Authority:** may check off tasks, set the next NEXT_ACTION from the TASKS list, add implementation sub-tasks under an approved task.
- **May not:** change GOAL/DONE_WHEN, alter the approved plan's scope, reorder phases, edit AUDIT.
- **Note:** the human operator supplies materials/decisions and drops raw files into 05_IMPORT_INBOX; Sonnet executes.

## 3. Handoff contract

A handoff is one appended block in the HANDOFFS section of PROJECT_STATE.md:

```
H{n}: FROM {agent} TO {agent} | deliverable: {what was produced, where it is} | next: {one action for the receiver} | blockers: {none | list}
```

Rules:
- The receiving agent must be able to act from PROJECT_STATE.md alone. If the deliverable needs explanation beyond the block, the handoff is invalid — fix the state, not the chat.
- A handoff with blockers ≠ none must have a matching DECISION_REQUIRED.md entry.
- Handoffs are never verbal/chat-only; chat may announce a handoff, the state records it.

## 4. Escalation

| Situation | Route |
|---|---|
| Two agents disagree on state content | Higgsfield audits; audit verdict wins; disagreement logged |
| Task impossible as written | Owner rewrites task with solution proposal, hands to Claude for redesign |
| Vision-level change wanted | STOP — operator decision only, via DECISION_REQUIRED.md |
