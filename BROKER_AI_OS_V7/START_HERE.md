# BROKER_AI_OS_V7 — Quick Start

## Port: 6060

## Required Environment Variables
```
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets   # default
ALPACA_DATA_URL=https://data.alpaca.markets         # default
ALPACA_PAPER=true                                   # default
PORT=6060                                           # default
NODE_ENV=production
```

Copy `.env.example` to `.env` and fill in your Alpaca paper keys.

## Start Server
```bash
cp .env.example .env
# edit .env with your keys
npm start
# or: PORT=6060 node server.js
```

## Verify Running
```bash
curl http://localhost:6060/health
curl http://localhost:6060/api/alpaca/status
```

## Key Endpoints
- `GET /health` — basic health check
- `GET /api/health` — API health check
- `GET /api/status` — full system status
- `GET /api/alpaca/status` — Alpaca connector status
- `GET /api/alpaca/test` — test Alpaca connection (keys required)
- `GET /api/alpaca/account` — read-only account status (keys required)
- `GET /api/alpaca/market/:symbol` — latest quote (keys required)
- `GET /api/alpaca/mock/:symbol` — mock quote (no keys needed)

## Safety
This system is READ-ONLY. No order placement, no live trading, no position modification.
