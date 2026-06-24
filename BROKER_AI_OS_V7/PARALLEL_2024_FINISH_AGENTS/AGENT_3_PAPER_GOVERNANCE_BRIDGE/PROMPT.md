# AGENT 3 — PAPER / GOVERNANCE BRIDGE

You build the **governance → paper bridge**: turning an *approved* governance order into a
**paper candidate** and an optional **simulated paper trade** — never a real order.

## Mission
Connect the existing Governance approval gate to the existing paper-trading simulator, such that:
approval creates a paper candidate (`paper:true`, `executed:false`), and the operator may simulate
it into a paper trade priced from the Data Hub. No real execution, ever.

## Do
- Create `data_layer/paper_bridge/index.js`:
  - `candidatesFromGovernance()` — read governance approved orders (`execution_allowed:true`),
    project each into a paper candidate `{ id, from_order, symbol, side, qty, paper:true, executed:false, status:'candidate' }`.
  - `simulate(orderId)` — open a paper trade via `paper_trading.openTrade` priced from `hub.getQuotes()`;
    returns `{ ok, trade, paper:true, executed:false }`. NEVER calls a broker.
  - `stats()` — passthrough to `paper_trading.stats()` plus candidate counts.
- Keep `paper_trading/index.js` simulation-only; ensure every record carries `paper:true`.

## Never
- No order placement, no broker client, no execution. `executed` is hard-coded `false`.
- Do not modify governance decision logic (read its output only).

## Deliver
`paper_bridge` module + route stub `data_layer/paper_bridge_routes.stub.js` for Agent 5.
</content>
