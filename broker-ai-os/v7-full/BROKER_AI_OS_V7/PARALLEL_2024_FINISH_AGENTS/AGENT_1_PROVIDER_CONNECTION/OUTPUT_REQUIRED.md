# AGENT 1 — OUTPUT REQUIRED (handoff to Agent 5)

## Routes to mount (Agent 5 merges into `data_layer/routes.js`)
- `GET  /providers/:id/status`  → `registry.get(id)` (404-shape if unknown)
- `POST /providers/:id/test`    → `registry.test(id)` (read-only; never live in mock)

## Contracts published for downstream agents
- `config.DATA_MODE` : `'mock' | 'live'`
- `provider_registry.list()[i]` shape: `{ id, name, category, status, enabled, configured, links:{website,docs,apiKeys,setupGuide}, last_update, health }`
- `provider_registry.test(id)` shape: `{ ok, id, mode, reachable, note }`
- Alpaca adapter read-only surface: `{ PROVIDER, status, getQuotes, getBars, accountStatus, positions }`

## Evidence to hand Agent 5
- `node --check` output for each modified file.
- grep proof that no order/execute methods exist in the alpaca adapter.
</content>
