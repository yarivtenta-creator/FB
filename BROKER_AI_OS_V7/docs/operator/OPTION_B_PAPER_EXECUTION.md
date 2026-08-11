# Option B — letting the system move your Alpaca paper balance

## What changed and why

Before Option B, BROKER_AI_OS_V7 read your Alpaca paper equity to size positions
and then simulated every trade in its own ledger. Alpaca was never told anything,
so your paper balance never moved no matter how many strategies ran. That was
correct behaviour for a read-only system, but it is not what you wanted to see.

Option B connects the last wire. When it is armed, every trade the strategy
engine opens is also submitted as a market order to your Alpaca **paper**
account, so the balance and the positions really change.

It is **off by default**. Nothing is sent until you turn it on.

## Turning it on

In `.env`:

```
ALPACA_EXECUTE=true
```

Restart the app. Open the dashboard and look at panel **0b · Alpaca Paper
Execution**. It shows five guards; all five must be green before a single order
is sent.

| Guard | What it checks |
|---|---|
| `OPT_IN` | `ALPACA_EXECUTE=true` is set |
| `PAPER_HOST` | `ALPACA_BASE_URL` host is exactly `paper-api.alpaca.markets` |
| `PAPER_KEY` | Your API key starts with `PK` |
| `KEYS_PRESENT` | Key and secret are both set |
| `PAPER_ACCOUNT` | Alpaca returns an account number starting with `PA` |

If a guard is red, the panel names it and says why. You never get a bare
"blocked" with no explanation.

## What is still impossible

Live trading. Not "discouraged" — refused:

- A **live host** (`api.alpaca.markets`) fails `PAPER_HOST`.
- A **live key** (starting `AK`) fails `PAPER_KEY`.
- A **live account number** fails `PAPER_ACCOUNT`.

There is no env var, flag, or argument that turns those three guards off.
Setting `ALPACA_EXECUTE=true` against a live key produces a blocked result and
an audit entry, not a live order.

The guards also **fail closed**: if the paper-account check cannot complete —
network down, bad key, proxy in the way — it fails and nothing is sent.

## What gets sent

One market order per newly opened trade:

```
POST https://paper-api.alpaca.markets/v2/orders
{"symbol":"AAPL","qty":"3","side":"buy","type":"market","time_in_force":"day",
 "client_order_id":"V7-…-AAPL-buy"}
```

Quantity comes from your real paper equity × the strategy's risk %.
`neutral`-direction signals are never sent — there is no buy or sell to make.

Every attempt, sent or blocked, is recorded in `runtime/execution_audit.json`
and readable at `/api/alpaca-exec/audit`.

## Turning it off

Set `ALPACA_EXECUTE=false` and restart. The engine goes back to simulating
trades locally. Orders already at Alpaca stay there — close them in the Alpaca
dashboard if you want a clean slate.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/alpaca-exec/status` | Armed or blocked, with per-guard detail |
| `GET /api/alpaca-exec/positions` | What your paper account actually holds |
| `GET /api/alpaca-exec/orders` | Real broker order history |
| `GET /api/alpaca-exec/audit` | Every order attempt, allowed or blocked |
| `POST /api/alpaca-exec/order` | Submit one order manually (login required) |
