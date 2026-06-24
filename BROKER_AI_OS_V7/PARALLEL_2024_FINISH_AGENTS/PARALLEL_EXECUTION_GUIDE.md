# PARALLEL EXECUTION GUIDE — Finish Broker AI OS v2 (port 2024)

**Canonical project (the ONLY place any agent may write):**
`C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN`

**Global mission:** Finish the 2024 build into a *paper-only, read-only-data* system that is ready
to receive **manually entered** provider keys later — with zero live trading, zero broker execution,
zero secrets in source.

---

## HARD SAFETY RULES (apply to ALL agents — non-negotiable)

1. No live trading. No real orders. No broker execution.
2. No T4 / Plus500 execution. No FIX routing.
3. Read-only market data only.
4. No API keys in UI, logs, or source. `.env.example` only; real `.env` is git-ignored.
5. `DATA_MODE=mock` by default. Live mode is opt-in via env and read-only even then.
6. Every paper artifact must carry `paper:true` and `executed:false`.
7. Do **NOT** touch `3023` / Garrrr.
8. Do **NOT** touch `2025` / BROKER_WORLD_SYSTEM.
9. Do **NOT** touch `/home/user/FB` or any staging folder.
10. Implement only inside `WORLD_BASE_CLEAN`.

Any agent that cannot satisfy a rule must STOP and report a blocker — never weaken the rule.

---

## AGENT ROSTER & RESPONSIBILITIES

| # | Agent | Owns | One-line responsibility |
|---|-------|------|--------------------------|
| 1 | PROVIDER_CONNECTION | provider registry, env, Alpaca adapter | Provider Setup Center data + `.env.example` + read-only Alpaca + provider status/test endpoints |
| 2 | DATA_HUB_SIGNAL_PIPELINE | data_hub_v2, scoring | Data Hub v2 = single source of truth; provider→adapter→hub routing; signals from hub only; DATA_MODE/source/freshness fields |
| 3 | PAPER_GOVERNANCE_BRIDGE | paper_bridge, paper_trading | Governance approval → paper candidate → simulated paper trade; `paper:true`, `executed:false` |
| 4 | DASHBOARD_THEME_INSTRUCTIONS | public/, docs | Dashboard UI, bright/dark theme, Provider Setup Center panel, paper status panels, operator guides |
| 5 | QA_SAFETY_INTEGRATION | tests/, FINAL_PROOF_PACKAGE | Merge, run tests, verify endpoints, safety scan, produce evidence package + final status |

---

## DEPENDENCY GRAPH (why this is only *partly* parallel)

```
            ┌──────────────┐
            │   AGENT 1    │  provider registry + env + alpaca adapter
            └──────┬───────┘
                   │ (registry shape, DATA_MODE)
            ┌──────▼───────┐
            │   AGENT 2    │  hub routing + signal pipeline (consumes registry)
            └──────┬───────┘
                   │ (hub getSignals, paper price source)
            ┌──────▼───────┐
            │   AGENT 3    │  governance → paper bridge (consumes hub + governance)
            └──────┬───────┘
                   │ (new endpoints exist)
            ┌──────▼───────┐
            │   AGENT 4    │  dashboard panels + guides (consumes all endpoints)
            └──────┬───────┘
                   │ (everything merged)
            ┌──────▼───────┐
            │   AGENT 5    │  QA / safety / integration / proof
            └──────────────┘
```

**Parallelizable now (no shared files):**
- Agent 1 (`provider_registry`, `adapters/alpaca`, `.env.example`, `.gitignore`)
- Agent 4 (`public/index.html` theme/CSS + `docs/` operator guides — UI shell can be built against the documented endpoint contract before wiring)

**Must wait for Agent 1:** Agent 2 (hub reads registry + DATA_MODE).
**Must wait for Agent 2:** Agent 3 (bridge reads hub signals + paper price source).
**Must wait for all:** Agent 5 (integration + proof).

## EXECUTION ORDER (waves)

- **Wave A (parallel):** Agent 1 + Agent 4 (UI shell & docs).
- **Wave B:** Agent 2.
- **Wave C:** Agent 3 + Agent 4 wiring finalization.
- **Wave D:** Agent 5 (gate).

## SHARED-FILE ARBITRATION

`server.js` is touched by Agents 1/2/3 (new route mounts). To avoid conflicts, **only Agent 5**
performs the final `server.js` route registration during merge, using the route list each agent
declares in its `OUTPUT_REQUIRED.md`. Agents 1–3 deliver self-contained routers; they do not edit
`server.js` directly.

`config.js` (DATA_MODE flag) is owned by **Agent 1** exclusively.

## FILE OWNERSHIP MAP (authoritative — prevents collisions)

| Path | Owner |
|------|-------|
| `config.js` | Agent 1 |
| `.env.example`, `.gitignore` | Agent 1 |
| `data_layer/provider_registry/index.js` | Agent 1 |
| `data_layer/adapters/alpaca/index.js` | Agent 1 |
| `data_layer/data_hub_v2/index.js` | Agent 2 |
| `data_layer/signal_scoring/index.js` | Agent 2 |
| `data_layer/paper_bridge/index.js` (new) | Agent 3 |
| `data_layer/paper_trading/index.js` | Agent 3 |
| `data_layer/routes.js` | Agent 5 (merge of route stubs declared by 1/2/3) |
| `public/index.html`, `public/theme.js` | Agent 4 |
| `docs/operator/*` | Agent 4 |
| `tests/*` | Agent 5 |
| `server.js` | Agent 5 (merge only) |
| `FINAL_PROOF_PACKAGE/*` | Agent 5 |

## DEFINITION OF DONE (whole package)

All of Agent 5's `ACCEPTANCE_CRITERIA.md` pass with captured evidence, final status is one of:
- `FULL PAPER SYSTEM READY FOR MANUAL PROVIDER KEYS`
- `PARTIALLY READY WITH DOCUMENTED BLOCKERS`
- `NOT READY`
</content>
</invoke>
