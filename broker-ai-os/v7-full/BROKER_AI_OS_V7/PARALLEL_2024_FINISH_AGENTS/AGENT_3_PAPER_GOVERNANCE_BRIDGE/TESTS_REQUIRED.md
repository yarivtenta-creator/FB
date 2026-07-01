# AGENT 3 — TESTS REQUIRED

- `paper_bridge.candidatesFromGovernance()` returns an array; every item `paper===true && executed===false`.
- `paper_bridge.simulate(<approvedOrderId>)` → `ok:true`, `trade.paper===true`, `executed===false`.
- `paper_bridge.stats()` includes `paper:true` and candidate counts.
- `paper_trading.openTrade({symbol:'AAPL'})` → `trade.paper===true`.
- Module export of `paper_bridge` contains none of: `placeOrder, submitOrder, cancelOrder, closePosition, replaceOrder, transfer, execute`.
</content>
