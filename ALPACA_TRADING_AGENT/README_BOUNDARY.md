# ⚠️ BOUNDARY NOTICE — Read First

## This agent is SEPARATE from BROKER_AI_OS_V7. Deliberately.

| | BROKER_AI_OS_V7 | ALPACA_TRADING_AGENT (this folder) |
|---|---|---|
| Alpaca access | **READ-ONLY** (GET only) | **PLACES ORDERS** (paper account) |
| Order endpoints | None — audited, 404/405 enforced | Uses Alpaca MCP order tools |
| Trades | Simulated in internal ledger (`paper:true`, `executed:false`) | **Real paper orders on Alpaca** |
| Runs as | Express server on port 6060 | Claude prompt-driven agent (no server) |
| Safety model | No execution path exists in code | Prime directives + risk rules in prompt |

## Why they are not merged

BROKER_AI_OS_V7 was built and audited under a hard contract:
> "No live trading. No broker execution. No order placement. No Alpaca order
> endpoints. Alpaca must be read-only market data / account-status only."

Wiring this agent into V7 would **void that audit**. The V7 safety report, the
forbidden-code scans, and the 17-test suite all assert that no order path exists.
Keeping this agent standalone preserves that guarantee.

## What this agent actually does

- Reads market data via Alpaca MCP
- **Places BUY/SELL orders on your Alpaca PAPER account**
- Logs every action to `memory/ledger.json`
- Writes a lesson per closed trade to `memory/learnings.md`
- Strategy: MA20/MA50 crossover on 1h bars, long-only (v1)

Its own prime directive #1: *"PAPER TRADING ONLY. Never place orders on a
live/real-money account."* It also checks the account is a paper account and
stops if it isn't.

## Paper orders are still orders

Paper orders don't touch real money, but they are real API calls to Alpaca's
order endpoints. That is a different risk posture than V7's read-only model.
Decide deliberately before running it.

## To run this agent

Requires the Alpaca MCP server connected — see `SETUP.md`. It is **not**
connected in this repo by default. Nothing here executes until you set that up.

## To run BROKER_AI_OS_V7 instead (read-only, no orders)

```
cd BROKER_AI_OS_V7
PORT=6060 node server.js
```
