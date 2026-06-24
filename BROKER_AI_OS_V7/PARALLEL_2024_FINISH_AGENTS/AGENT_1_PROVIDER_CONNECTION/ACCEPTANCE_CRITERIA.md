# AGENT 1 — ACCEPTANCE CRITERIA

1. `config.DATA_MODE === 'mock'` with no env set; `=== 'live'` only when `DATA_MODE=live`.
2. `.env.example` exists with placeholder keys and **no real values**; `.gitignore` ignores `.env`.
3. `provider_registry.list()` returns each provider with `id`, `links.{website,docs,apiKeys,setupGuide}`, and `configured` (boolean derived from env presence only).
4. `provider_registry.test(id)` returns `{ ok, id, mode, reachable, note }` and performs **no** live call when `DATA_MODE=mock`.
5. Alpaca adapter exposes ONLY read-only methods; a source scan for order/execute methods returns zero.
6. No key value is ever returned or logged (grep for the env names returns only `process.env.X` reads guarded by presence checks).
7. `node --check` passes on every modified JS file.
</content>
