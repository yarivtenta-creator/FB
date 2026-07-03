# TOKEN_OPTIMIZATION

Operationalizes 02_PROTOCOLS/TOKEN_RULES.md ("read only state files, avoid rereading history, state = source of truth") into enforceable numbers.

## 1. Reading-order contract (every session, every agent)

1. `{project}/PROJECT_STATE.md` — always, first, whole file.
2. Nothing else by default.
3. A SOURCES file — only if NEXT_ACTION names it.
4. ARCHIVE — never, except during an explicit audit or restore drill.
5. Chat history — never. If context is missing from state, that is a state bug: fix the state (add the summary), don't reread the chat.

## 2. Size budgets

| Artifact | Cap | Enforcement |
|---|---|---|
| PROJECT_STATE.md | 400 lines | P-06 check 5 orders trim to ARCHIVE/STATE_HISTORY.md |
| Import EXTRACT | 40 lines | P-03 output contract |
| NEXT_ACTION | 1 line | Schema |
| Handoff block | 1 line | Schema |
| AUDIT line | 1 line | Schema |
| Resume-session mandatory read | ≤ ~5K tokens (≈ the 400-line state file) | V-07 |

## 3. Write rules that save future reads

- Summarize at the boundary: whoever produced long content writes the 40-line extract; the next reader never pays for the long version.
- Done tasks stay as one checked line each — the result note replaces any need to reread how it was done.
- AUDIT/HANDOFFS keep the last 20 lines in state; older lines live in ARCHIVE/STATE_HISTORY.md (still preserved, never in the hot path).
- One NEXT_ACTION, not a plan dump: plans live in EXECUTION_BLUEPRINT-style docs, referenced by name, not inlined.

## 4. Import economics

- Raw historical chats are classified once (P-03), producing a ≤40-line extract; the raw file then moves to ARCHIVE and is never read again.
- Duplicate detection by content hash costs nothing at read time and prevents the same history being paid for twice.
- Batch cap of 5 imports per session keeps classification sessions inside a predictable budget.

## 5. Anti-patterns (prohibited)

| Anti-pattern | Correct move |
|---|---|
| Pasting a whole chat into the project "for context" | Run P-03/P-04, keep the extract |
| Rereading SOURCES "to be safe" | Trust state; if state is insufficient, fix state |
| Re-explaining a project in chat at handoff | Handoff block + P-02 resume |
| Keeping full history in PROJECT_STATE.md | Trim rule to STATE_HISTORY.md |
| Regenerating deliverables that already exist in 04_OUTPUT | Read the deliverable list first |

## 6. Measurement

The weekly audit (P-06) reports per project: state-file line count, inbox backlog, and whether any session in the week read ARCHIVE outside an audit. Trend must be flat or down; a rising state-file count triggers the trim rule before the cap is hit.
