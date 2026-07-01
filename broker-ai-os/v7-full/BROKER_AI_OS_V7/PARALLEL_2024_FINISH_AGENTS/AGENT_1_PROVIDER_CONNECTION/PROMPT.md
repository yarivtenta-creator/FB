# AGENT 1 — PROVIDER CONNECTION

You build the **Provider Setup Center data layer** and the **read-only Alpaca adapter**.

## Mission
Make it possible for an operator to *manually* connect providers later, starting with Alpaca,
without ever shipping a key and without ever enabling execution.

## Do
- Add `DATA_MODE` to `config.js` (default `mock`; allowed `mock` | `live`). Live = read-only only.
- Create `.env.example` (placeholders only) and `.gitignore` (ignore real `.env`, `node_modules`, `logs/`, paper state).
- Extend `data_layer/provider_registry/index.js` with, per provider: `id`, `links` (website, docs, apiKeys, setupGuide), `configured` (derived from env *presence only* — never the value), and a `test(id)` read-only connectivity check.
- Harden `data_layer/adapters/alpaca/index.js`: explicit **read-only** methods only (quotes, bars, accountStatus, positions). Add an env-gated read-only data path that is a NO-OP unless `DATA_MODE=live` AND a key is present; even then it only *reads*.

## Never
- No `placeOrder/submitOrder/cancelOrder/closePosition/replaceOrder/transfer/execute` — these methods must not exist anywhere you touch.
- Never print, log, or return a key value. `configured:true/false` is the only signal allowed.
- Do not edit `server.js` directly — declare your routes in `OUTPUT_REQUIRED.md` for Agent 5 to mount.

## Deliver
A self-contained provider router stub `data_layer/provider_routes.stub.js` exporting the two new
endpoints (`/providers/:id/status`, `/providers/:id/test`) for Agent 5 to merge into `routes.js`.
</content>
