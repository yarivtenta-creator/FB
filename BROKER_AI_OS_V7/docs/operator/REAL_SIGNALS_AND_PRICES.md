# Real prices, real signals

## What was wrong

An audit of a live dashboard found the engine was real, the money was real, and
the **inputs were fiction**.

**Every position was booked at $100.** The engine had a fallback:

```js
const price = Number(sig.price) > 0 ? Number(sig.price) : 100;
```

The mock signals carry no price at all, so that fallback fired every time.
MSFT was booked at $100 while it trades near $428. Share counts and notionals
were all wrong — which is why the Deployed column was full of suspiciously round
numbers like $1,000 and $8,000.

Worse: the daily change panel marks positions against *real* prices. Comparing
$100 entries to real quotes would have reported roughly **$71,000 of profit that
never existed**, on a $100k account.

**And every signal was a fixture.** All six came from `db/mock_signals.json`,
whose own contents read `"Mock sample."` — providers `13f_mock`,
`congress_mock`, `insider_mock`. Twelve strategies were trading six made-up
tickers.

## What it does now

### 1. No price, no position

The `: 100` fallback is gone. A position is opened only at a real traded price.
When none is available the trade is skipped and the reason is reported:

```json
{ "slot": "A", "symbol": "GOOGL", "reason": "no_price" }
```

`data_layer/prices` fetches real quotes — Alpaca first, Twelve Data as a
fallback — caches them for `PRICE_TTL_MS` (default 60s), and returns a real
number or nothing. There is no placeholder constant anywhere in that file, by
design. If both sources fail it reports *both* errors, because "no price"
without a reason is not actionable.

### 2. Real signals from real bars

`data_layer/adapters/market_signals` pulls daily bars from Alpaca (read-only)
and computes, from actual closes:

| Metric | Meaning |
|---|---|
| `ret_20d` | 20-session return |
| `sma20` / `sma50` | simple moving averages |
| `annualized_vol_pct` | stdev of daily returns, annualized |

Direction is **long** on positive momentum in an uptrend, **short** on negative
momentum in a downtrend, **neutral** when those disagree. Confidence is a stated
function of momentum strength, trend agreement and volatility — see
`_confidence()` — not a magic constant.

Every signal carries a **real price**, so sizing is correct:

```
NVDA   long    conf 0.7142   $157.08   20-session return +9.61%, SMA20 150.28 vs SMA50 140.75
XOM    short   conf 0.5527   $110.84   20-session return -3.73%, SMA20 112.75 vs SMA50 116.24
AAPL   neutral conf 0.1629   $209.97   20-session return +0.20%, SMA20 209.56 vs SMA50 209.57
```

If the bars cannot be fetched it returns an error and **no signals**. It never
substitutes fixtures.

Set the universe with `SIGNAL_UNIVERSE` (comma separated); blank uses the
built-in large-cap list plus SPY/QQQ.

### 3. Fixtures no longer trade

`13f_mock`, `congress_mock` and `insider_mock` are excluded from trading. They
still appear in the signal board for continuity, but no strategy acts on them.

```
TRADE_ON_MOCK_SIGNALS=false     # default; set true only for demos
```

## Four strategies now sit idle — on purpose

Conservative, Insider Follow, Congress Follow and Institutional 13F only accept
fixture sources. With fixtures excluded, they have nothing to trade.

That is deliberate. "Insider Follow" should not quietly start trading momentum
and keep calling itself insider data. But it must be **visible**, so the
dashboard now says so directly, per strategy, with the free option for fixing it:

> **4 strategies have no real signal feed and will not trade.**
> They only accept fixture sources, and fixtures are excluded from trading.
> They are not broken — they are waiting on data you do not have yet.
> · Conservative needs a real 13F feed — free option: SEC EDGAR (keyless, already in your provider list)
> · Insider Follow needs a real Form 4 insider feed — free option: SEC EDGAR
> · Congress Follow needs a real congressional-trade feed — Quiver Quant, limited free tier

The strategy table also has a **Signal feed** column reading `ok` or `no feed`.

## Discarded records are now visible

The data hub validated every record and silently dropped failures. An entire
adapter's output could vanish with every panel still looking normal — which is
exactly what happened the first time real signals were wired in: all of them
were rejected for a missing `kind` field and simply disappeared.

Rejects are now kept and exposed at `GET /api/data/rejects`, with a button in
panel 0a.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/data/market-signals` | Real signals with their metrics |
| `POST /api/data/market-signals/refresh` | Recompute from live bars |
| `GET /api/data/rejects` | What the hub discarded, and why |
| `GET /api/strategy/prices?symbols=A,B` | Cached quotes and their source |
| `POST /api/strategy/prices/refresh` | Force a re-fetch |

## Order of operations

Each automatic tick now: refresh market signals → refresh equity → warm real
prices → size and open. Each step is awaited. Firing any of them off without
waiting is what made equity read as the $100,000 default for a whole session.
