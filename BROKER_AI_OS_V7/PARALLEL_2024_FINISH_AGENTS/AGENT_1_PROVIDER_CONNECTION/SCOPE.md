# AGENT 1 — SCOPE

## In scope
- `config.js` — add `DATA_MODE` (default `mock`).
- `.env.example`, `.gitignore`.
- `data_layer/provider_registry/index.js` — links, ids, `configured` (env-presence), `test()`.
- `data_layer/adapters/alpaca/index.js` — explicit read-only methods + env-gated read-only fetch.
- `data_layer/provider_routes.stub.js` — new router stub for Agent 5.

## Out of scope
- Data Hub routing internals (Agent 2).
- Paper bridge (Agent 3).
- Dashboard UI (Agent 4).
- `server.js` mounting (Agent 5).

## Providers covered in the Setup Center
Alpaca (equities, **first**), T4/Plus500 (futures — data/status only, NO execution), News,
Economic Calendar, Congress Trades, 13F Filings, Insider Trading.
</content>
