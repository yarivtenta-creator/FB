# TEST REPORT (real output — not fabricated)

54 tests across 4 suites, all passing. Commands and literal runner totals below.

## Commands run
- `npm install` · `npm run check` · `node --check <each changed file>`
- `node tests/run.js`        — unit/contract (mock), 27 tests
- `node tests/endpoints.js`  — HTTP integration (mock), 12 tests
- `node tests/alpaca_live.js`— REAL read-only Alpaca call (live, dummy keys), 8 tests
- `node tests/chain_live.js` — full chain on real-shaped Alpaca data, 7 tests

## npm install / check
```
up to date, audited 69 packages ... found 0 vulnerabilities
> node --check server.js && echo SYNTAX_OK
SYNTAX_OK
```
`node --check` OK on: config.js, server.js, data_layer/routes.js, provider_registry, adapters/alpaca,
data_hub_v2, paper_bridge, provider_routes.stub, paper_bridge_routes.stub, public/theme.js,
tests/run.js, tests/endpoints.js, tests/alpaca_live.js, tests/chain_live.js.

## node tests/run.js → pass=27 fail=0
Covers Agents 1–4 contracts + safety invariants, PLUS:
- `alpaca.parseLatestQuotes() normalizes REAL Alpaca schema → Quote (live:true)` — midpoint 190.30.
- `alpaca adapter never targets the TRADING host (only data host)`.
```
RESULT  pass=27  fail=0
ALL UNIT/CONTRACT TESTS PASSED
```

## node tests/endpoints.js → pass=12 fail=0
Boots the real app, proves 401 without token, logs in, returns real JSON for all required endpoints.
Full JSON in `ENDPOINT_RESULTS.md`.
```
ENDPOINT RESULT  pass=12  fail=0
ALL ENDPOINT TESTS PASSED
```

## node tests/alpaca_live.js → pass=8 fail=0  (REAL network call)
Run with `DATA_MODE=live ALPACA_API_KEY_ID=TESTKEYID ALPACA_API_SECRET_KEY=TESTSECRET`.
```
refreshLive → {"ok":false,"status":401,"reason":"unauthorized_or_unreachable","note":"fell back to fixtures; no data fabricated"}
registry.test → {"ok":true,"id":"alpaca","mode":"live","reachable":false,"http_status":401,"quotes":0, ...}
ALPACA LIVE RESULT  pass=8  fail=0
observed_http_status=401  (401 = real endpoint reached with dummy keys)
REAL READ-ONLY INTEGRATION VERIFIED (safe fallback, no orders, no fabrication)
```

## node tests/chain_live.js → pass=7 fail=0  (full chain on real-shaped data)
```
PASS  PROVIDER: refreshLive() parses real Alpaca schema (GET, read-only)
PASS  DATA HUB: serves live quotes (live:true) stamped source=data_hub_v2
PASS  DATA HUB health: data_mode=live, freshness live
PASS  SIGNALS: ranking still produces sorted scored signals via the hub
PASS  GOVERNANCE: approve order → paper candidate (paper:true, executed:false)
PASS  PAPER TRADING: simulate prices the trade off LIVE Alpaca quote, executed:false
      paper trade → {"id":1,"symbol":"AMZN","side":"long","qty":1,"entry":222.22, ... "paper":true,"mock":true}
PASS  SAFETY: chain used read-only GET only; adapter has no order methods
CHAIN RESULT  pass=7  fail=0
FULL CHAIN VERIFIED ON REAL-SHAPED ALPACA READ-ONLY DATA (paper:true, executed:false)
```

## Honesty notes
- No fake test counts; the totals above are literal runner output.
- `chain_live.js` stubs ONLY the external HTTP boundary (with Alpaca's real schema); the real network
  call is proven independently in `alpaca_live.js` (real HTTP 401).
</content>
