# AGENT 3 — ACCEPTANCE CRITERIA

1. `paper_bridge.candidatesFromGovernance()` returns only candidates derived from approved orders, each with `paper:true`, `executed:false`, `status:'candidate'`.
2. `paper_bridge.simulate(orderId)` opens a paper trade (via `paper_trading`) priced from the hub and returns `paper:true`, `executed:false`.
3. No broker/order/execute symbol exists anywhere in `paper_bridge` (grep clean).
4. `paper_trading` records all carry `paper:true` (and `mock:true`).
5. Bridge degrades safely: unknown/again-approved order → `{ ok:false }`, never throws into a live path.
6. `node --check` passes on all touched/created files.
</content>
