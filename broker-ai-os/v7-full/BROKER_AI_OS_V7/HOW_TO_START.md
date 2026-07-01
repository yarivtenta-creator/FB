# BROKER_AI_OS_V7 — How to Start

## Port: 6060
## URL: http://localhost:6060

---

## Windows (double-click)

**START_BROKER_AI_OS_V7.bat** — starts the server and opens the browser

**STOP_BROKER_AI_OS_V7.bat** — stops the server

---

## Mac / Linux (terminal)

```bash
cd BROKER_AI_OS_V7
npm install          # first time only
PORT=6060 node server.js
```

Then open: http://localhost:6060

---

## Login

| User | Password | Role |
|------|----------|------|
| admin | ChangeMe-Admin-2026 | Full access |
| operator | ChangeMe-Operator-2026 | Operator |
| viewer | ChangeMe-Viewer-2026 | Read-only |

---

## Add Alpaca Keys

1. Copy `.env.example` to `.env`
2. Fill in your Alpaca paper account keys
3. Restart the server

---

## Notes

- Port is **6060** — not 6700, not 3023
- No live trading, no order placement
- Alpaca is read-only (market data + account status only)
