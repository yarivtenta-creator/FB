# BROKER AI OS v2 — HANDOFF PACKAGE

**Project root:** `C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN`
**Status:** ✅ FULL PAPER SYSTEM READY FOR MANUAL PROVIDER KEYS
**Port:** 2024 · **Mode:** manual · **Data:** mock by default (live = read-only) · **Execution:** none

Broker development is **complete and frozen**. This package is everything an operator needs to run,
connect, and verify the system without further development.

## Contents
- `RUNBOOK.md` — start, sign in, connect Alpaca, test, run paper trading, switch theme.
- `API_REFERENCE.md` — every endpoint, auth, and expected shape.
- `SAFETY_CONTRACT.md` — the guarantees and how they are enforced.
- `../FINAL_PROOF_PACKAGE/` — 13 evidence documents (tests, endpoints, safety, live integration).
- `../docs/operator/` — task-focused operator guides.
- `../BROKER_COMPLETION_SUMMARY.md` — one-page completion summary.

## One-minute start
```
cd "C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN"
npm install
node server.js                 # or START_BROKER_AI_OS_V2.bat
# open http://localhost:2024/login  → admin / ChangeMe-Admin-2026  (change it)
```

## To go live (read-only data) later
1. Copy `.env.example` → `.env`; set `DATA_MODE=live` + Alpaca **read-only** keys.
2. Restart. Alpaca auto-activates; click **Test** in the Provider Setup Center (expect `http_status:200`).
3. Everything stays paper-only: `paper:true`, `executed:false`. No orders are ever placed.

## What this system is NOT
No live trading, no order execution, no broker execution, no FIX, no T4/Plus500 execution. It is a
read-only-data + paper-simulation + human-approval console.
</content>
