# DATA HUB PROOF

## File
`data_layer/data_hub_v2/index.js`

## Provider → Adapter → Data Hub v2 (single source of truth)
- Adapters (`adapters/alpaca`, `t4`, `news`, `calendar`, `congress`, `insider`, `13f`) are registered
  in the hub via `registerProvider(...)`. `registered_providers:7` (proven in hub health).
- The hub aggregates through `getQuotes()/getNews()/getCalendar()/getSignals()` and `normalizeData()`.
- `normalizeData()` validates every record against `schemas` and **stamps** it with
  `source:'data_hub_v2'` and `data_mode`. Proven in `/api/data/signals` output:
  each record shows `"source":"data_hub_v2","data_mode":"mock"`.
- Consumers (scoring, paper bridge) call the **hub**, never adapters directly. Unit test
  `signal_scoring sources from hub only (no direct adapter require)` = PASS.

## Mode / source / freshness fields (proven via /api/data/hub/health)
```json
{"data_mode":"mock","source":"data_hub_v2","freshness":"mock (static fixtures)",
 "registered_providers":7,"active_providers":5,"configured_providers":0,"symbol_coverage":14, ...}
```

## DATA_MODE switch (mock default; live = read-only, gated)
Captured with `DATA_MODE=live node -e ...`:
```
registry.test(alpaca): {"ok":true,"id":"alpaca","mode":"live","reachable":false,
  "note":"live mode but provider not configured (no key present). No call performed."}
hub.health.data_mode: live | freshness: live (read-only)
```
So switching to live changes the *mode/freshness* but, with no key, performs **no** call and stays
safe. Disabled providers do not contribute live-eligible quotes (gating in `getQuotes()`).

## Alpaca read-only adapter (UPDATED — real integration)
`module.exports = { PROVIDER, ENV_KEYS, DATA_BASE, status, getQuotes, getBars, accountStatus, positions, refreshLive, parseLatestQuotes }`
- `_mode()` returns `'live'` only if `DATA_MODE==='live'` **and** both env keys are present; otherwise `'mock'`.
- Live path now performs a **real read-only GET** to `data.alpaca.markets` (`refreshLive`), caches the
  parsed quotes, and `getQuotes()` serves them (flagged `live:true`, stamped `source:data_hub_v2` by the hub).
- On unauthorized/unreachable → fixtures fallback; never fabricates live data; never calls an order API.
- No order/execute methods exist (call-pattern scan = NO MATCHES). See `ALPACA_LIVE_INTEGRATION_PROOF.md`.

## Live chain proof (real-shaped Alpaca data)
With live data present, `hub.getQuotes()` includes Alpaca live quotes (Alpaca auto-`enabled` once keys
are present in live mode), and a paper trade simulated from an approved governance order is priced at the
Alpaca bid/ask **midpoint 222.22** — full evidence in `ALPACA_LIVE_INTEGRATION_PROOF.md` (chain test).
</content>
