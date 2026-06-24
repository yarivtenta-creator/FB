# AGENT 5 — TESTS REQUIRED

## Unit (`tests/run.js`)
Aggregate of Agents 1–4 TESTS_REQUIRED plus:
- safety: no module under `data_layer/` exports an order/execute method.
- safety: every paper/candidate object has `paper:true` and `executed:false`.

## Endpoint (`tests/endpoints.js`)
- 401 without token on a protected route.
- 200 + valid JSON for the 7 required endpoints with a valid token.
- paper stats payload contains `paper:true`.

## Safety scan (documented in proof)
grep the whole project (excluding node_modules) for:
`placeOrder, submitOrder, cancelOrder, closePosition, replaceOrder, transfer, execute, execution, FIX, Plus500, T4, secret, token, API key, .env`
and record exact findings + why each is safe.
</content>
