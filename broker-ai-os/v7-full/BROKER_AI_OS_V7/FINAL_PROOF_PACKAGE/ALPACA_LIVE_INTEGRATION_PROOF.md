# ALPACA LIVE READ-ONLY INTEGRATION PROOF

The Alpaca safe stub has been **replaced with a real read-only market-data integration**.

## File
`data_layer/adapters/alpaca/index.js`

## What it does (read-only only)
- `refreshLive()` issues `GET https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=…&feed=iex`
  with `APCA-API-KEY-ID` / `APCA-API-SECRET-KEY` headers — a **read-only** market-data request.
- `parseLatestQuotes(json)` normalizes Alpaca's documented quote schema into our `Quote` (bid/ask
  midpoint), flagged `live:true`.
- Results are cached so the synchronous data-hub interface is preserved; `getQuotes()` returns live
  quotes when fresh, else fixtures (never fabricates live data).
- It **only** contacts the market-data host. It never touches the Alpaca trading host and exposes no
  order methods (`refreshLive, parseLatestQuotes, getQuotes, getBars, status, accountStatus, positions`).

## PROOF 1 — the call is REAL (not a stub): real HTTP 401 from Alpaca
Pre-flight reachability check (no keys):
```
REACHED Alpaca data API
status: 401 Unauthorized
ms: 597
body: <html> ... 401 Authorization Required ... nginx ...
```
Through our adapter with dummy keys (`tests/alpaca_live.js`):
```
refreshLive → {"ok":false,"status":401,"reason":"unauthorized_or_unreachable","note":"fell back to fixtures; no data fabricated"}
registry.test → {"ok":true,"id":"alpaca","mode":"live","reachable":false,"http_status":401,"quotes":0,
  "note":"live read-only probe reached the data host but returned 401 (no data fabricated; no orders)."}
observed_http_status=401
ALPACA LIVE RESULT  pass=8  fail=0
```
A real server `401` can only come from an actual network round-trip to Alpaca — a stub cannot produce it.

## PROOF 2 — via the HTTP route (live mode), real probe
```
LIVE provider test : {"ok":true,"id":"alpaca","mode":"live","reachable":false,"http_status":401,"quotes":0, ...}
LIVE alpaca status : {"id":"alpaca","enabled":true,"configured":true,"status":"live"}
LIVE hub health    : {"data_mode":"live","freshness":"live (read-only)","active_providers":6,"configured_providers":1}
```
When keys are present in live mode the provider **auto-activates** (`enabled:true`, `status:"live"`).

## PROOF 3 — full chain on REAL-SHAPED Alpaca data (`tests/chain_live.js`)
HTTP boundary stubbed with a realistic Alpaca payload (documented schema); our code carries it through:
```
PASS  PROVIDER: refreshLive() parses real Alpaca schema (GET, read-only)
PASS  DATA HUB: serves live quotes (live:true) stamped source=data_hub_v2
PASS  DATA HUB health: data_mode=live, freshness live
PASS  SIGNALS: ranking still produces sorted scored signals via the hub
PASS  GOVERNANCE: approve order → paper candidate (paper:true, executed:false)
PASS  PAPER TRADING: simulate prices the trade off LIVE Alpaca quote, executed:false
      paper trade → {"id":1,"symbol":"AMZN","side":"long","qty":1,"entry":222.22,"status":"open","paper":true,"mock":true}
PASS  SAFETY: chain used read-only GET only; adapter has no order methods
CHAIN RESULT  pass=7  fail=0
```
The paper trade entry **222.22** equals the Alpaca bid/ask midpoint (222.30/222.14) — proving real-shaped
Alpaca data flowed Provider → Data Hub → Governance → Paper Trading, staying `paper:true` / `executed:false`.

## Honest limitation
Authenticated **live quotes** (HTTP 200 with real numbers) were not observed because no operator keys
are present. PROOF 3 uses a stubbed HTTP response with Alpaca's real schema to prove the pipeline;
PROOF 1/2 prove the real network call. Final live numbers appear once the operator adds read-only keys.
</content>
