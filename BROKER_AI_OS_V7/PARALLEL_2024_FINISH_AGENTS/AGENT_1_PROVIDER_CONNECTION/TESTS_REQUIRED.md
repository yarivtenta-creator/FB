# AGENT 1 — TESTS REQUIRED

Provided to Agent 5's runner (`tests/run.js`):

- `config.DATA_MODE` defaults to `mock`.
- `provider_registry.list()` every entry has `id` + `links` (4 urls) + `configured` boolean.
- `provider_registry.get('alpaca')` is not null and `enabled===false` by default.
- `provider_registry.test('alpaca')` returns `reachable:false` / `mode:'mock'` when DATA_MODE=mock and no key.
- alpaca adapter module export keys contain NONE of: `placeOrder, submitOrder, cancelOrder, closePosition, replaceOrder, transfer, execute`.
- alpaca `getQuotes()` returns normalized quotes (kind === 'quote', mock:true).
</content>
