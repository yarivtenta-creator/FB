# AGENT 3 — SCOPE

## In scope
- `data_layer/paper_bridge/index.js` (new)
- `data_layer/paper_bridge_routes.stub.js` (new)
- `data_layer/paper_trading/index.js` (only to reinforce `paper:true`/simulation guarantees)

## Out of scope
- Governance internals (read `governance.listOrders()` output only)
- Hub internals (consume `hub.getQuotes()`)
- UI (Agent 4), final routes mount (Agent 5)

## Invariant
Every object returned by the bridge includes `paper:true` and `executed:false`.
</content>
