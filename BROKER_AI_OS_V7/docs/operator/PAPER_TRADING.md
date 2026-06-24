# Operator Guide — Paper Trading (simulation only)

Everything here is a **local simulation**. Every record is `paper:true` and `executed:false`.
No broker, no orders, no execution — ever.

## The flow
```
Signal → Governance proposal (pending) → Human APPROVE (opens a permission gate)
       → Paper CANDIDATE (paper:true, executed:false) → SIMULATE → local paper trade
```

## Approve a governance order (opens the gate, places nothing)
- Dashboard card **9** (Governance / Approval Queue), or:
  `POST /api/gov/orders/:id/approve`
- Result: `execution_allowed:true`, but `executed:false`. Nothing is sent to a market.

## See paper candidates (from approved orders)
- Dashboard card **10** (Paper Status) → Candidates, or:
  `GET /api/data/paper/candidates`

## Simulate a candidate into a paper trade
- `POST /api/data/paper/candidates/:id/simulate`
- Opens a paper trade priced from the Data Hub. Response includes `paper:true, executed:false`.

## Direct paper trades (manual)
- Open:  `POST /api/data/paper/open`   body `{ "symbol":"AAPL", "side":"long", "qty":1 }`
- Close: `POST /api/data/paper/close`  body `{ "id": <tradeId> }`
- Stats: `GET  /api/data/paper/stats`  (always carries `paper:true`)

## Guarantee
There is no code path that turns a paper trade into a real order. The bridge has no broker client.
</content>
