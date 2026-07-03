# PROMPT_PACK

Ready-to-paste prompts. `{...}` = fill before use. Every prompt ends with a fixed final-response contract so runs are machine-checkable.

---

## P-01 — Bootstrap a new project (Claude)

```text
PROJECT BOOTSTRAP

Workspace: GPT_SAAS_WORKSPACE. Source of truth: 04_OUTPUT/SYSTEM_SPECIFICATION.md.

Create 06_PROJECTS/{PROJECT_ID}/PROJECT_STATE.md using the schema in SYSTEM_SPECIFICATION §4, plus empty SOURCES/, ARCHIVE/, EXPORTS/ folders.

Inputs:
- Name: {project name}
- GOAL: {one sentence}
- DONE_WHEN: {measurable criterion}
- Known materials: {links/paths or "none"}

Rules: STATUS=INTAKE until GOAL, DONE_WHEN and ≥3 TASKS exist, then set ACTIVE and one NEXT_ACTION. Do not chat. If an input is missing, assume a default, log it in DECISION_REQUIRED.md, continue.

Final response: PROJECT_READY {PROJECT_ID} or DECISION_REQUIRED
```

## P-02 — Resume a project (any agent)

```text
RESUME {PROJECT_ID}

Read ONLY 06_PROJECTS/{PROJECT_ID}/PROJECT_STATE.md. Do not read SOURCES, ARCHIVE, or any chat history unless NEXT_ACTION explicitly requires a specific file.

Execute NEXT_ACTION. Then: update TASKS, set the new NEXT_ACTION, increment STATE_VERSION, append one AUDIT line.

Final response: STATE_UPDATED v{n} | next: {new NEXT_ACTION} or BLOCKED {reason} (with DECISION_REQUIRED.md entry written)
```

## P-03 — Classify an import (ChatGPT)

```text
IMPORT CLASSIFICATION

File: 05_IMPORT_INBOX/{filename}
Projects index: {list of PROJECT_IDs with one-line GOALs}

Task: read the file and output exactly:
1. TARGET: {PROJECT_ID} | NEW: {proposed name} | DISCARD-DUPLICATE of S{n}
2. EXTRACT (max 40 lines): decisions made, assets produced, open questions. No transcript, no pleasantries.
3. HASH: first 8 hex chars of SHA-256 of the raw file.

Do not merge. Do not delete. Do not chat.

Final response: CLASSIFIED {target} or UNCLASSIFIABLE (leave in inbox, log to DECISION_REQUIRED.md)
```

## P-04 — Merge an import (ChatGPT)

```text
IMPORT MERGE {PROJECT_ID}

Input: classification output from P-03.

Steps:
1. If HASH matches any existing SOURCES hash → reject as duplicate, move raw to ARCHIVE/, log AUDIT line "import rejected duplicate", stop.
2. Save EXTRACT as SOURCES/imported_{date}_{slug}.md; add S{n} line with hash to PROJECT_STATE.md.
3. Move raw file to ARCHIVE/. Never delete.
4. If the extract's open questions affect TASKS, add tasks; do not change GOAL.
5. Increment STATE_VERSION, append AUDIT line.

Final response: MERGED S{n} v{version} or REJECTED_DUPLICATE
```

## P-05 — Handoff (sending agent)

```text
HANDOFF {PROJECT_ID}

Append to HANDOFFS in PROJECT_STATE.md:
H{n}: FROM {me} TO {receiver} | deliverable: {what + where} | next: {one action} | blockers: {none|list}

Validity check before writing: could {receiver} act from PROJECT_STATE.md alone? If no — fix the state first (add the missing summary/source), then hand off. Blockers require a DECISION_REQUIRED.md entry.

Final response: HANDOFF_LOGGED H{n}
```

## P-06 — Weekly audit (Higgsfield)

```text
AUDIT PASS {PROJECT_ID}

Read PROJECT_STATE.md only. Check:
1. STATE_VERSION count == AUDIT line count.
2. STATUS=ACTIVE ⇒ NEXT_ACTION non-empty.
3. Every SOURCES entry has a hash; no two hashes equal.
4. EXPORT_STATUS: STALE if last export older than {7} days of active work.
5. File ≤400 lines (else order the archive-trim per spec §4).

Output findings in the 7-field EXECUTION_PROTOCOL format. Never report a problem without a concrete fix. Apply mechanical fixes (EXPORT_STATUS flag, trim order) yourself; queue the rest as TASKS.

Final response: AUDIT_PASS or AUDIT_FINDINGS {count}
```

## P-07 — Verification for DONE (ChatGPT + Higgsfield)

```text
VERIFY {PROJECT_ID} FOR DONE

Project claims DONE_WHEN is met. Read PROJECT_STATE.md and the deliverable named in DONE_WHEN.

Checklist: DONE_WHEN objectively met (evidence, not assertion) · all TASKS checked or explicitly descoped with reason · EXPORT ready · audit (P-06) passes.

If any check fails: STATUS stays REVIEW, set NEXT_ACTION to the smallest fix, do not chat.

Final response: VERIFIED_DONE or REVIEW_FAILED {failed check}
```

## P-08 — Workspace review (Claude, this mission, rerunnable)

```text
MISSION MODE

Workspace Location: {link or path}

Your job is NOT to chat. Your job is to process the workspace.
1. Read the complete workspace. 2. Extract every relevant ZIP. 3. Read only files that improve understanding. 4. Ignore duplicates/obsolete. 5. Workspace = only source of truth. 6. Build a complete Solution Review. 7. Never report a problem without a concrete implementation. 8. If information is missing, create DECISION_REQUIRED.md and continue. 9. Production-ready documents only. 10. Save everything into 04_OUTPUT.

Deliverables: SYSTEM_REVIEW.md, SYSTEM_SPECIFICATION.md, EXECUTION_BLUEPRINT.md, AGENT_ASSIGNMENTS.md, PROMPT_PACK.md, RISK_AND_SOLUTIONS.md, TOKEN_OPTIMIZATION.md, VERIFICATION_PLAN.md, CONTINUATION_PACKAGE.md

Final response: WORKSPACE_REVIEW_COMPLETE or DECISION_REQUIRED
```
