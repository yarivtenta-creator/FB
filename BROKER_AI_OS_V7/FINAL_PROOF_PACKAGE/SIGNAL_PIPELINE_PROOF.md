# SIGNAL PIPELINE PROOF

## Files
- Generation: `data_layer/data_hub_v2/index.js` (`getSignals()`)
- Ranking: `data_layer/signal_scoring/index.js` (`rankSignals()`)

## Signals generated from the Data Hub ONLY
- `signal_scoring` requires `../data_hub_v2` and calls `hub.getSignals()`. It does NOT require any
  adapter. Proven by unit test `signal_scoring sources from hub only (no direct adapter require)` (PASS),
  which greps the source for `require('../adapters...')` and asserts absence.
- `/api/data/signals` records all carry `"source":"data_hub_v2"` and `"mock":true`.

## Ranked signals work (proven via /api/data/signals/ranked)
```json
[{"provider":"13f_mock","symbol":"GOOGL","direction":"long","score":0.7725,
  "factors":{"confidence":0.65,"source_quality":0.9,"trend_alignment":1,"confirmations":1}},
 {"provider":"congress_mock","symbol":"NVDA","score":0.705, ...}, ...]
```
- Sorted non-increasing by `score` — unit test `scoring.rankSignals() is sorted non-increasing by score` (PASS).
- Factor breakdown present — unit test `...[0].factors has 4 factor keys` (PASS).

## Disabled providers are not used (live mode)
`data_hub_v2.getQuotes()` includes a provider's quotes only when `!live || registry.get(id).enabled`.
In `DATA_MODE=live`, providers with `enabled:false` (e.g. Alpaca by default) contribute no live data.
In mock mode all registered adapters supply fixtures (so the pipeline is demonstrable offline).

## No execution anywhere in the pipeline
Scoring is pure ranking. The call-pattern safety scan (`SAFETY_CONFIRMATION.md`) found no
order/execute/transfer calls in any pipeline file.
</content>
