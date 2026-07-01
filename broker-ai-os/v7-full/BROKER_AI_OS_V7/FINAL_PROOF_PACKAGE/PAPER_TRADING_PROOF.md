# PAPER TRADING PROOF

## Files
- Bridge: `data_layer/paper_bridge/index.js`
- Simulator: `data_layer/paper_trading/index.js`
- Routes: `data_layer/paper_bridge_routes.stub.js` (merged into `data_layer/routes.js`)

## Governance → paper bridge (approval creates a paper candidate ONLY)
Real flow proven by `tests/run.js` + `tests/endpoints.js`:
1. `governance.decide(201,'approve')` → `{ok:true, executed:false, order.execution_allowed:true}`
   (unit test `governance.decide(approve) opens gate without executing` = PASS). Approval opens a
   permission gate; it places nothing.
2. `GET /api/data/paper/candidates` (real output):
```json
[{"id":201,"from_order":201,"symbol":"AMZN","side":"long","qty":1,"status":"candidate",
  "paper":true,"executed":false,"note":"Paper candidate derived from an approved governance gate. No order placed."}]
```
Every candidate carries `paper:true` and `executed:false`.

## Simulated paper trade (no real order)
`bridge.simulate(201)` opens a local paper trade priced from the hub. Unit test
`bridge.simulate(approvedOrder) → paper trade, executed:false` (PASS). Return shape includes
`paper:true, executed:false`, and `trade.paper:true`.

## Open/closed trades + stats work (simulated only)
`GET /api/data/paper/stats` (real output):
```json
{"closed":0,"open":2,"win_rate":0,"total_pl":0,"avg_gain":0,"avg_loss":0,"paper":true}
```
`paper_trading.openTrade()` / `closeTrade()` compute P/L locally; every record is `paper:true, mock:true`.
Unit test `paper_trading.openTrade() flags paper:true` (PASS).

## Hard guarantees (proven)
- `paper:true` on every candidate, trade, and stats payload.
- `executed:false` on every candidate and simulate result.
- `paper_bridge exposes NO order/execute methods` (PASS) — there is no broker client; the bridge
  cannot place a real order. Safety scan call-pattern = NO MATCHES.
</content>
