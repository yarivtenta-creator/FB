# Strategy Engine — BROKER_AI_OS_V7

**12 strategies · 12 slots · paper simulation only · no order execution**

## How "Alpaca money" is used

Position sizing reads the **real equity** of your Alpaca **paper** account via a
read-only `GET /v2/account`. Each strategy risks a % of that equity per position.
The trades themselves are simulated in this system's ledger — Alpaca is never
sent an order. Every trade carries `paper:true` and `executed:false`.

If the equity read fails or no keys are set, sizing falls back to $100,000 and
`equity_source` reports `default` — never silently faked.

## The 12 Strategies

| Slot | Strategy | Tier | Min score | Risk/pos | Max open | Sides | Sources |
|------|----------|------|-----------|----------|----------|-------|---------|
| A | Conservative | low | 0.72 | 1.0% | 2 | long | 13F |
| B | Balanced | medium | 0.62 | 2.0% | 4 | long, short | any |
| C | Aggressive | high | 0.50 | 3.0% | 8 | long, short, neutral | any |
| D | Momentum | medium | 0.65 | 2.0% | 5 | long | any |
| E | Mean Reversion | medium | 0.58 | 1.5% | 5 | long, short | any |
| F | Insider Follow | medium | 0.55 | 2.0% | 6 | long, short | insider |
| G | Congress Follow | medium | 0.55 | 2.0% | 6 | long, short | congress |
| H | Institutional 13F | low | 0.60 | 1.5% | 8 | long | 13F |
| I | High Conviction | low | 0.75 | 4.0% | 3 | long, short | any |
| J | Diversified | low | 0.52 | 0.75% | 15 | long, short, neutral | any |
| K | Swing | medium | 0.63 | 2.5% | 6 | long, short | any |
| L | Contrarian | high | 0.55 | 2.0% | 5 | short, neutral | any |

## Endpoints (all require `x-auth-token`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/strategy/status` | All slots, equity basis, open counts |
| GET | `/api/strategy/strategies` | Full strategy catalog |
| POST | `/api/strategy/tick` | Run one scoring pass |
| GET | `/api/strategy/trades` | Every paper trade, all slots |
| GET | `/api/strategy/trades/:slot` | One slot's ledger |
| POST | `/api/strategy/pause` | Stop opening new trades |
| POST | `/api/strategy/resume` | Allow opening new trades |
| POST | `/api/strategy/equity/refresh` | Re-read real Alpaca paper equity |

## Activating

One key pair activates all 12 slots:

```
ALPACA_API_KEY=your_paper_key
ALPACA_SECRET_KEY=your_paper_secret
```

Optionally bind individual slots to different paper accounts with
`ALPACA_<SLOT>_KEY_ID` / `ALPACA_<SLOT>_SECRET`.

Change any slot's strategy with `STRATEGY_<SLOT>=<name>`.
Disable a slot with `SLOT_<SLOT>_ENABLED=false`.

## Verified Behavior

```
$ curl -X POST -H "x-auth-token: $TOKEN" localhost:6060/api/strategy/tick

slots active: 12 / 12
equity basis: $100,000 (default)
OPENED NOW: 33
paper: true | executed: false
```

33 paper trades opened across all 12 strategies. Zero `paper/executed` violations.

## Safety

- No broker client, no order path, no execution anywhere in the engine
- Alpaca contacted with `GET` only — never POST/DELETE, never `/v2/orders`
- Engine defaults to **PAUSED** on first boot (`AUTO_RESUME=false`)
- When paused it still reads and scores, but opens no trades
