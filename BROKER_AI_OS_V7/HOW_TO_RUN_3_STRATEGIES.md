# Broker AI OS v5 — 3 Accounts · 3 Strategies · Pause/Run · Paper Only

One system on port 6700. Three Alpaca PAPER accounts, each running its own strategy,
all on one dashboard. Paper-only, read-only data, no real money, no broker execution.

## 1. Put your three paper keys in .env
Copy `.env.example` to `.env`, set DATA_MODE=live, and fill the three key pairs:

    DATA_MODE=live
    ALPACA_DATA_BASE_URL=https://data.alpaca.markets

    ALPACA_A_KEY_ID=<account 1 key>      ALPACA_A_SECRET=<account 1 secret>   STRATEGY_A=conservative
    ALPACA_B_KEY_ID=<account 2 key>      ALPACA_B_SECRET=<account 2 secret>   STRATEGY_B=balanced
    ALPACA_C_KEY_ID=<account 3 key>      ALPACA_C_SECRET=<account 3 secret>   STRATEGY_C=aggressive

(Quick CMD way — fill keys first:)
    cd "C:\Users\Local PC\Desktop\BROKER_AI_OS_V5" && (echo PORT_V5=6700& echo DATA_MODE=live& echo ALPACA_DATA_BASE_URL=https://data.alpaca.markets& echo ALPACA_A_KEY_ID=K1& echo ALPACA_A_SECRET=S1& echo STRATEGY_A=conservative& echo ALPACA_B_KEY_ID=K2& echo ALPACA_B_SECRET=S2& echo STRATEGY_B=balanced& echo ALPACA_C_KEY_ID=K3& echo ALPACA_C_SECRET=S3& echo STRATEGY_C=aggressive)> .env

## 2. Start
Double-click START_BROKER_AI_OS_V5.bat → open http://localhost:6700 → login admin / ChangeMe-Admin-2026

## 3. The Strategy Engine panel (top of dashboard)
- Shows all 3 accounts, their strategy, whether keys are configured, and open/total paper trades.
- Big button toggles **Run / Pause**.

## The strategies
| Account | Strategy     | Min score | Sides            | Max open | Meaning |
|--------|--------------|-----------|------------------|----------|---------|
| A      | conservative | 0.72      | long only        | 2        | Most secure — only the strongest signals |
| B      | balanced     | 0.62      | long + short     | 4        | Medium confidence, both directions |
| C      | aggressive   | 0.50      | long+short+neutral | 8      | Takes more, including weaker signals |

(To tune these later, edit `strategy_engine/index.js` → STRATEGIES.)

## Pause / Run (survives shutdown)
- Press **Pause** → strategies stop opening NEW paper trades, but keep reading live data + scoring.
- Close the computer. Next day, start the system → it stays **paused** (remembered on disk).
- Press **Run** → it resumes opening qualifying paper trades.
- Default on a fresh install: **PAUSED** (you press Run to begin).

## Safety (unchanged)
- Everything is paper:true / executed:false. No broker client, no order path, no real money.
- Alpaca keys are read-only market-data keys; the adapter only contacts the data host.
- Change the default admin password before any non-local use (auth/generate_users.js).
