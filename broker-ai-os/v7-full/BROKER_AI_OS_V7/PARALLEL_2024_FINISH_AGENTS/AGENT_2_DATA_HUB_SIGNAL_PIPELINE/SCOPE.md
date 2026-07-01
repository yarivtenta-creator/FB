# AGENT 2 — SCOPE

## In scope
- `data_layer/data_hub_v2/index.js` (routing, mode/source/freshness, enabled-gating)
- `data_layer/signal_scoring/index.js` (ranking from hub only)

## Out of scope
- Provider registry shape (consume Agent 1's contract)
- `.env` / config flag definition (Agent 1 owns `config.DATA_MODE`; you only read it)
- Paper bridge / paper trading (Agent 3)
- UI (Agent 4), routes mounting (Agent 5)

## Source-of-truth invariant
`scoring.rankSignals()` MUST call `hub.getSignals()`; it must never `require` an adapter directly.
</content>
