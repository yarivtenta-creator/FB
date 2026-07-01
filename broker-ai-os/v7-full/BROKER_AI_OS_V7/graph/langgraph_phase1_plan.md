# LangGraph Phase 1 — Planning Stub

**Status:** stub / proposal-only. No broker calls, no order calls, no execution.

## Linear graph (Phase 1)

```
Request
  -> Intake          (normalize the incoming ask)
  -> Classification  (signal? question? config change?)
  -> Routing         (which specialist agent / board)
  -> Review (HUMAN)  (mandatory node before ANY execution edge)
```

The graph only *proposes*. It cannot import or call `placeOrder`. Any future
execution edge must pass through the Manual Approval Layer as a mandatory node.

## Phase 2 (future, not built here)
- Persistence: SQLite/Postgres checkpointer, agent memory.
- HITL via interrupt()/resume (reuse the pattern from the LangGraph/Next.js project).

## Phase 3 (future, not built here)
- Supervisor over specialist agents, approval node mandatory before execution.
