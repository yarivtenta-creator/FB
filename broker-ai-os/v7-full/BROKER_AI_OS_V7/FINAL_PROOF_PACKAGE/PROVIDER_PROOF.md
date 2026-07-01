# PROVIDER PROOF

## Files
- Registry: `data_layer/provider_registry/index.js`
- Alpaca adapter: `data_layer/adapters/alpaca/index.js`
- Routes (read-only status + test): `data_layer/provider_routes.stub.js` (merged into `data_layer/routes.js`)
- Env template: `.env.example`

## Providers included (Provider Setup Center)
Alpaca (equities, first), T4/Plus500 (futures — **data/status only, no execution**), News,
Economic Calendar, Congress Trades, 13F Filings, Insider Trading, plus a reserved slot. (8 entries;
`registered_providers:7` adapters in the hub.)

## Provider model (per entry)
```json
{ "id","name","category","status","enabled","configured","links":{website,apiKeys,docs,setupGuide},"last_update","health" }
```
- `enabled:false` until manually wired & verified.
- `configured` is derived ONLY from env-var **presence** (never the value). All `configured:false`
  now because no keys are set — proven by `configured_providers:0` in hub health.

## Setup Center buttons (UI — `public/index.html`)
Per provider the card renders **Website / API Keys / Docs / Setup Guide** links (open in a new tab)
and a **Test** button. There is **no input that submits a key** — the dashboard test confirms it:
`index.html has NO password input / no key-capturing field` (PASS). Keys are entered on the provider
site and placed in the local `.env`; the app only reads presence.

## Provider connection layer (endpoints)
- `GET  /api/data/providers`            → full list (real JSON in ENDPOINT_RESULTS.md)
- `GET  /api/data/providers/:id/status` → single provider (proven for `alpaca`)
- `POST /api/data/providers/:id/test`   → read-only probe

### Missing-key behavior (proven)
- `DATA_MODE=mock`: `{"ok":true,"id":"alpaca","mode":"mock","reachable":false,"note":"mock mode — no network call performed..."}`
- `DATA_MODE=live` + no key: `{"ok":true,"id":"alpaca","mode":"live","reachable":false,"note":"live mode but provider not configured (no key present). No call performed."}`

### Test-connection behavior (UPDATED — real probe)
Read-only only. In mock mode it performs **no** network call. In live+configured it now performs a
**real read-only GET** to Alpaca and reports the genuine HTTP status:
```
{"ok":true,"id":"alpaca","mode":"live","reachable":false,"http_status":401,"quotes":0,
 "note":"live read-only probe reached the data host but returned 401 (no data fabricated; no orders)."}
```
With keys present in live mode the provider **auto-activates** (`enabled:true`, `status:"live"`,
`configured:true`). Never an order, never execution. Full evidence: `ALPACA_LIVE_INTEGRATION_PROOF.md`.

## Alpaca read-only adapter (see ALPACA section of DATA_HUB_PROOF + safety scan)
Read-only surface only: `{ PROVIDER, ENV_KEYS, status, getQuotes, getBars, accountStatus, positions }`.
No `placeOrder/submitOrder/cancelOrder/closePosition/replaceOrder/transfer/execute` — verified by the
call-pattern scan returning **NO MATCHES** and by unit test `alpaca adapter exposes NO order/execute methods` (PASS).
</content>
