# AGENT 3 — OUTPUT REQUIRED (handoff)

## Routes to mount (Agent 5 merges into `data_layer/routes.js`)
- `GET  /paper/candidates`        → `paper_bridge.candidatesFromGovernance()`
- `POST /paper/candidates/:id/simulate` → `paper_bridge.simulate(id)`
- `GET  /paper/bridge/stats`      → `paper_bridge.stats()`

## Contracts published
- Candidate shape: `{ id, from_order, symbol, side, qty, paper:true, executed:false, status }`
- Simulate result: `{ ok, trade, paper:true, executed:false, note }`

## Evidence to hand Agent 5
- `node --check` output; a candidate dump and a simulate result dump showing `paper:true/executed:false`.
</content>
