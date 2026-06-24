# AGENT 2 — DATA HUB & SIGNAL PIPELINE

You own **Data Hub v2 as the single source of truth** and the **signal generation/ranking** path.

## Mission
Guarantee that all data flows Provider → Adapter → Data Hub v2, and that signals are produced and
ranked **only** from the hub — never from providers directly, never from disabled providers.

## Do
- In `data_hub_v2/index.js`: add `data_mode` (from `config.DATA_MODE`), `source`, and `freshness`
  fields to `health()` and stamp routed records with `source`/`provider`. Skip adapters whose
  registry entry is `enabled:false` when aggregating live-eligible data.
- Keep `getSignals()` aggregating only registered adapters via the hub.
- In `signal_scoring/index.js`: keep ranking sourced from `hub.getSignals()` only; expose the
  factor breakdown. Ensure ranked output is sorted and deterministic for tests.

## Never
- No network calls in mock mode. No direct provider access from scoring.
- No execution, no orders, no paper logic (that is Agent 3).

## Deliver
Hub + scoring with mode/source/freshness fields and a documented contract for Agent 3 (price source)
and Agent 4 (display fields).
</content>
