# Test Report — BROKER_AI_OS_V7

## Test Command
```bash
node tests/v7_audit_test.js
```

## Test File
`tests/v7_audit_test.js`

## Results: 9 passed, 0 failed

```
PASS: GET /health returns 200
PASS: GET /health returns ok
PASS: GET /api/health returns 200
PASS: GET /api/alpaca/status returns 200
PASS: GET /api/alpaca/status returns system name
PASS: GET /api/alpaca/status shows read_only=true
PASS: GET /api/alpaca/test without keys returns 503
PASS: GET /api/alpaca/test returns KEYS_REQUIRED
PASS: No order endpoint exposed (should be 404)

Results: 9 passed, 0 failed
```

## Endpoint Proof Table

| Endpoint | Method | Status | Result |
|----------|--------|--------|--------|
| /health | GET | 200 | `{"status":"ok","system":"BROKER_AI_OS_V7","port":6060}` |
| /api/health | GET | 200 | `{"status":"ok","system":"BROKER_AI_OS_V7","port":6060}` |
| /api/status | GET | 200 | `{"live_trading":false,"read_only":true,"live_endpoint_enabled":false}` |
| /api/providers | GET | 200 | JSON array of providers |
| /api/data/providers | GET | 200 | JSON array of providers |
| /api/alpaca/status | GET | 200 | `{"provider":"alpaca","read_only":true,"configured":false}` |
| /api/alpaca/test | GET | 503 | `{"code":"KEYS_REQUIRED","missingKeys":["ALPACA_API_KEY","ALPACA_SECRET_KEY"]}` |
| /api/alpaca/account | GET | 503 | `{"code":"KEYS_REQUIRED"}` |
| /api/alpaca/market/AAPL | GET | 503 | `{"code":"KEYS_REQUIRED","mock":{"symbol":"AAPL","price":189.5}}` |
| /api/alpaca/mock/AAPL | GET | 200 | `{"symbol":"AAPL","price":189.5,"source":"mock"}` |
| /api/alpaca/orders | GET | 404 | Not Found (endpoint does not exist) |
| POST /api/alpaca/status | POST | 405 | `{"error":"METHOD_NOT_ALLOWED"}` |
| /api/data/hub/health | GET | 401 | Unauthorized (auth required) |
| /api/data/signals | GET | 401 | Unauthorized (auth required) |
| /api/data/paper/stats | GET | 401 | Unauthorized (auth required) |
| / | GET | 200 | Frontend HTML loads |

## Note on Auth-Gated Endpoints
Endpoints under /api/data/* and /api/gov/* require JWT authentication.
They correctly return 401 without a valid token. This is expected behavior.
