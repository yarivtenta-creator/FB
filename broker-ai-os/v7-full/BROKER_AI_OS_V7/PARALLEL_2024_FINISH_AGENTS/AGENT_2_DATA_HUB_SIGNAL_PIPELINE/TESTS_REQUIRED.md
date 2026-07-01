# AGENT 2 — TESTS REQUIRED

- `hub.health()` has keys: `data_mode`, `source`, `freshness`, `registered_providers`, `active_providers`, `symbol_coverage`.
- `hub.getSignals().length > 0` and every record `.kind === 'signal'` and `.mock === true`.
- `hub.getQuotes()` every record `.kind === 'quote'` and has `.provider`.
- `scoring.rankSignals()` is non-increasing by `.score`.
- `scoring.rankSignals()[0].factors` has the four factor keys.
</content>
