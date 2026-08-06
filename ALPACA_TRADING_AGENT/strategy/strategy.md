# Strategy v1 — Moving Average Crossover (starter)

Simple on purpose. Prove the system works on paper, then upgrade the strategy.

## Universe / Watchlist

SPY, QQQ, AAPL, MSFT, NVDA
(Edit freely. Keep it ≤ 8 symbols so cycles stay fast.)

## Timeframe

1-hour bars. Evaluate on closed bars only — never on a bar still forming.

## Indicators

- Fast MA: 20-period SMA (1h)
- Slow MA: 50-period SMA (1h)
- Volume filter: 20-period average volume (1h)

## Entry Rule (LONG only in v1)

BUY when ALL are true on the most recent closed 1h bar:
1. MA20 crosses ABOVE MA50 (was below on the prior bar, is above now)
2. Bar volume ≥ its 20-period average volume
3. No open position already in this symbol
4. No matching loss-pattern in `memory/learnings.md`
5. Risk rules in CLAUDE.md allow a new entry

## Exit Rules

SELL (close position) when ANY is true:
1. MA20 crosses back BELOW MA50 (closed 1h bar)
2. Stop-loss hit (-2% from entry)
3. Take-profit hit (+4% from entry)

## Position Sizing

qty = floor( (equity × 5%) / price )

## Explicitly NOT in v1 (add later, one at a time, with backtests)

- Shorting
- RSI/momentum confirmation
- Multi-timeframe confirmation
- News/sentiment input
- Crypto or extended-hours trading

## Change Log

- v1 (2026-07-16): initial MA 20/50 crossover with volume filter. Paper only.
