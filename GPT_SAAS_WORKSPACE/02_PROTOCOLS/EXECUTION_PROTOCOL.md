# EXECUTION_PROTOCOL

How every executor works inside GPT SAAS.

## The loop

1. Read `GPT_SAAS_MASTER_STATE.md`, then the target project's `PROJECT_STATE.md`.
2. Do exactly the one thing in `NEXT_ACTION`.
3. Write the deliverable to `04_OUTPUT/` or `{project}/EXPORTS/`.
4. Update `PROJECT_STATE.md`: check off the task, increment `STATE_VERSION`, append one AUDIT
   line, set the new `NEXT_ACTION`.
5. If blocked, log to `DECISION_REQUIRED.md` with an assumed default and move to the next
   unblocked task. Never stop the whole project on one blocker.

## Finding report format (7 fields — mandatory everywhere)

Every finding/problem reported anywhere uses this format. A problem is never written without
its solution:

```
1. WHAT   — the problem, one sentence
2. WHERE  — file / project / line
3. WHY    — root cause
4. IMPACT — what breaks if unfixed (severity)
5. FIX    — the concrete solution
6. HOW    — implementation steps
7. STATUS — FIXED | LOGGED-WITH-DEFAULT | NEEDS-DECISION
```

## Rules

- One `NEXT_ACTION` at a time, one owner.
- Every session ends by updating `PROJECT_STATE.md` before anything else.
- No conversational replies inside workspace documents.
- Never delete; archive instead.
- No final package until verification passes.
