# ENDPOINT RESULTS (real captured output)

Captured by `node tests/endpoints.js`, which boots the real app on an ephemeral port, proves the
401 guard, logs in as `admin`, and calls each endpoint with the session token. All endpoints are
behind `requireAuth` (mounted as `app.use('/api/data', requireAuth, require('./data_layer/routes'))`).

## Boot line (app start proof)
```
[boot] INTEGRATED mode=manual auto_resume=false live=false
```

## Auth behavior
- **Unauthenticated** `GET /api/data/hub/health` → **401** `{"error":"unauthorized"}`
- **Login** `POST /api/auth/login` (admin) → **200**, `ok=true`, token issued.

## Required endpoints (authenticated, status 200)

### GET /api/data/hub/health
```json
{"data_mode":"mock","source":"data_hub_v2","freshness":"mock (static fixtures)","registered_providers":7,"active_providers":5,"configured_providers":0,"symbol_coverage":14,"symbols":["AAPL","MSFT","NVDA","TSLA","META","AMZN","ES","NQ","YM","RTY","CL","GC","SI","ZN"],"data_freshness":"mock (static fixtures)","health":"ok","schema_version":"1.0.0","note":"Data Hub v2 is the single source of truth. Agents must consume via the hub, never providers directly. No live execution exists."}
```

### GET /api/data/providers  (truncated to first entries)
```json
[{"kind":"provider_status","name":"Alpaca","category":"equities","status":"not_configured","enabled":false,"last_update":null,"health":"mock","id":"alpaca","configured":false,"links":{"website":"https://alpaca.markets","apiKeys":"https://app.alpaca.markets/paper/dashboard/overview","docs":"https://docs.alpaca.markets/docs/getting-started","setupGuide":"/docs/operator/CONNECT_ALPACA.md"}},{"kind":"provider_status","name":"T4 / Plus500","category":"futures","status":"mock","enabled":false,...}]
```

### GET /api/data/signals  (truncated)
```json
[{"kind":"signal","provider":"congress_mock","id":"c1","symbol":"NVDA","direction":"long","confidence":0.6,"rationale":"Disclosed purchase (mock)","ts":"2026-06-04T02:56:15.155Z","mock":true,"source":"data_hub_v2","data_mode":"mock"}, ...]
```

### GET /api/data/signals/ranked  (truncated)
```json
[{"kind":"signal","provider":"13f_mock","id":"f1","symbol":"GOOGL","direction":"long","confidence":0.65,"ts":"...","mock":true,"source":"data_hub_v2","data_mode":"mock","score":0.7725,"factors":{"confidence":0.65,"source_quality":0.9,"trend_alignment":1,"confirmations":1}}, ...]
```

### GET /api/data/paper/stats
```json
{"closed":0,"open":2,"win_rate":0,"total_pl":0,"avg_gain":0,"avg_loss":0,"paper":true}
```

### GET /api/data/providers/alpaca/status  (provider status endpoint)
```json
{"kind":"provider_status","name":"Alpaca","category":"equities","status":"not_configured","enabled":false,"last_update":null,"health":"mock","id":"alpaca","configured":false,"links":{"website":"https://alpaca.markets","apiKeys":"https://app.alpaca.markets/paper/dashboard/overview","docs":"https://docs.alpaca.markets/docs/getting-started","setupGuide":"/docs/operator/CONNECT_ALPACA.md"}}
```

### POST /api/data/providers/alpaca/test  (provider test endpoint, read-only)
```json
{"ok":true,"id":"alpaca","mode":"mock","reachable":false,"note":"mock mode — no network call performed. Provider probe is simulated only."}
```

### GET /api/data/paper/candidates  (governance→paper bridge)
```json
[{"id":201,"from_order":201,"from_signal":null,"symbol":"AMZN","side":"long","qty":1,"status":"candidate","paper":true,"executed":false,"note":"Paper candidate derived from an approved governance gate. No order placed."}]
```

## Result
```
ENDPOINT RESULT  pass=12  fail=0
ALL ENDPOINT TESTS PASSED
```

## Authentication note
If you call these endpoints from a browser/curl WITHOUT a valid `x-auth-token`, the expected
result is **HTTP 401 `{"error":"unauthorized"}`** (proven above). Authenticate via
`POST /api/auth/login` first, then send the returned token in the `x-auth-token` header.
</content>
