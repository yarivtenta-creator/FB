# AGENT 2 — OUTPUT REQUIRED (handoff)

## Contracts published
- `hub.getQuotes()` → price source for Agent 3 paper bridge (`{symbol, price, provider, source}`).
- `hub.getSignals()` → signal source for Agent 3 candidates and Agent 4 display.
- `hub.health()` → adds `data_mode`, `source`, `freshness` for Agent 4 Data Hub panel.
- `scoring.rankSignals({trend})` → ranked list for `/api/data/signals/ranked`.

## Routes (already exist in routes.js — no new mount needed)
- `GET /hub/health`, `GET /signals`, `GET /signals/ranked`, `GET /quotes`.

## Evidence to hand Agent 5
- `node --check` for both files; a sample `health()` JSON dump showing the new fields.
</content>
