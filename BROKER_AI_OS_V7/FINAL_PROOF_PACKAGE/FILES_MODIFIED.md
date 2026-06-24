# FILES MODIFIED

All modifications are additive and inside `WORLD_BASE_CLEAN`. None weaken the safety contract.

| Path | What changed | Why it is safe |
|------|--------------|----------------|
| `config.js` | Added `DATA_MODE` (default `mock`, allowed `mock`/`live`) + `VALID_DATA_MODES`. | Controls the DATA path only; unknown values fall back to `mock`. No execution flag added; `LIVE_ENDPOINT_ENABLED` still false. |
| `server.js` | Added one line: `app.use('/docs', express.static(...))` to serve operator guides. | Read-only static markdown. No new logic, no new privileged route. |
| `data_layer/routes.js` | Merged Agent 1 + Agent 3 route stubs (provider status/test; paper candidates/simulate/bridge stats). | All read-only or paper-simulation; mounted behind existing `requireAuth`. No order endpoints. |
| `data_layer/provider_registry/index.js` | Added `id`, `links` (website/docs/apiKeys/setupGuide), `configured` (env-presence only), `summary.data_mode`, and read-only `test(id)`. | `configured` reads only env *presence*, never values; `test()` performs no network call in mock mode and never an order. |
| `data_layer/adapters/alpaca/index.js` | Made read-only methods explicit; added env-presence + `DATA_MODE` gating; live path is a safe fixture fallback. | Exposes only quotes/bars/status/positions. No order/execute methods. Key values never read/logged. |
| `data_layer/data_hub_v2/index.js` | Added `data_mode`/`source`/`freshness` to `health()`; stamped records with `source`+`data_mode`; gated disabled providers in live mode. | Hub stays the single source of truth; mock mode unchanged; no network. |
| `public/index.html` | Added theme attribute + light/dark palettes + toggle; Provider Setup Center card; Data Hub panel; Ranked Signals; Paper Status (candidates/trades/stats). | No key-capturing input; only POST is the read-only provider test. |

## Live-integration step (Alpaca real read-only)
| Path | What changed | Why it is safe |
|------|--------------|----------------|
| `data_layer/adapters/alpaca/index.js` | Replaced the safe stub with a REAL read-only fetch (`refreshLive`, `parseLatestQuotes`) + in-memory cache; `getQuotes()` serves cached live quotes in live mode. | GET-only to the market-data host; never the trading host; no order methods; no key logging; falls back to fixtures on failure (no fabrication). |
| `data_layer/provider_registry/index.js` | `test()` is now async and performs a REAL read-only probe for Alpaca; `enabled`/`status` are dynamic (live+configured → enabled/`live`). | Probe is read-only; auto-enable only happens with keys present in live mode (mock default unchanged). |
| `data_layer/provider_routes.stub.js` | `POST /providers/:id/test` now awaits the async probe. | Still read-only; no order path. |
| `tests/run.js` | Async runner; added Alpaca schema-parsing + trading-host guard tests. | Test-only. |

## NOT modified (intentionally)
- `data_layer/paper_trading/index.js` — already flags every record `paper:true`; no change needed.
- `data_layer/signal_scoring/index.js` — already sources only from `hub.getSignals()`; verified by test.
- `governance/*` — read its public API only; decision logic untouched.
- `3023`, `2025`, `/home/user/FB`, staging — untouched.
</content>
