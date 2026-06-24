# Alpaca Connection Report — BROKER_AI_OS_V7

## Status: READ-ONLY adapter operational

## What Was Done
- Verified `connectors/alpaca/alpaca_config.js` — loads keys from env, always sets isReadOnly=true
- Verified `connectors/alpaca/alpaca_provider.js` — GET-only calls, no order functions exist
- Verified `connectors/alpaca/alpaca_routes.js` — blocks POST/PUT/DELETE/PATCH with 405
- Verified server.js mounts routes at `/api/alpaca`
- All files were already correctly structured; no changes needed

## Required Environment Variables
```
ALPACA_API_KEY=PK...
ALPACA_SECRET_KEY=...
ALPACA_BASE_URL=https://paper-api.alpaca.markets
ALPACA_DATA_URL=https://data.alpaca.markets
ALPACA_PAPER=true
```

## What Working Looks Like
```
GET /api/alpaca/status → 200, {"system":"BROKER_AI_OS_V7","read_only":true,"configured":true,...}
GET /api/alpaca/test   → 200, {"ok":true,"mode":"live","is_open":...}
GET /api/alpaca/account → 200, {"ok":true,"status":"ACTIVE",...}
GET /api/alpaca/market/AAPL → 200, {"ok":true,"symbol":"AAPL","price":...}
```

## Without Keys (current state)
```
GET /api/alpaca/status → 200, configured:false, missingKeys listed
GET /api/alpaca/test   → 503, {"code":"KEYS_REQUIRED",...}
```
