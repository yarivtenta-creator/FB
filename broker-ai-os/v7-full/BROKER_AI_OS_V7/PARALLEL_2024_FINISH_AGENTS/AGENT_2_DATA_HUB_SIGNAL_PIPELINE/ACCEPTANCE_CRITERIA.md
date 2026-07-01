# AGENT 2 — ACCEPTANCE CRITERIA

1. `hub.health()` includes `data_mode`, `source`, `freshness`, `registered_providers`, `active_providers`.
2. In mock mode `health().data_mode === 'mock'` and `freshness` documents "mock (static fixtures)".
3. `hub.getSignals()` returns normalized signals (`kind:'signal'`, `mock:true`) from registered adapters only.
4. `scoring.rankSignals()` is sorted by `score` desc, each item has `factors{confidence,source_quality,trend_alignment,confirmations}`.
5. Disabled providers (registry `enabled:false`) do not contribute live-eligible quotes when `DATA_MODE=live`.
6. No direct adapter `require` inside `signal_scoring`.
7. `node --check` passes on both files.
</content>
