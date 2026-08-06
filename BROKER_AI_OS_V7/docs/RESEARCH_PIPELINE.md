# Research Pipeline — skills → statistics

Connects the `/trade` and `/crypto` analysis skills to the app's data pipeline.
Analysis stops being a chat report and becomes a scored signal that drives paper
trades and statistics.

## Flow

```
/trade analyze NVDA        (Claude Code — 5 parallel agents)
        │  Trade Score 88/100
        ▼
POST /api/data/research    (ingest, validated, persisted)
        ▼
data_hub getSignals()      (alongside 13F / insider / congress)
        ▼
signal_scoring             (source quality 0.85)
        ▼
strategy_engine tick()     (12 strategies filter by threshold)
        ▼
PAPER trades + statistics  (paper:true, executed:false)
```

## Ingest

```bash
POST /api/data/research     # header: x-auth-token
{
  "symbol": "NVDA",
  "direction": "long",        # long | short | neutral
  "score": 88,                # 0-1 or 0-100, auto-normalized
  "skill": "trade-analyze",
  "rationale": "Composite Trade Score 88/100",
  "price": 180
}
```

Arrays are accepted for batch ingest. Re-ingesting the same `symbol` + `skill`
supersedes the previous entry rather than duplicating it.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/data/research` | All ingested signals |
| GET | `/api/data/research/stats` | Counts, avg/top score, by skill, by direction |
| POST | `/api/data/research` | Ingest one or many |
| DELETE | `/api/data/research/:id` | Remove one |
| POST | `/api/data/research/clear` | Remove all |

## Scoring weight

| Source | Quality |
|--------|---------|
| 13F filings | 0.90 |
| **Research (skills)** | **0.85** |
| Congress | 0.70 |
| Insider | 0.60 |

High, because those runs are multi-agent and evidence-backed — but below 13F,
which is a legal filing rather than an inference.

## Storage

`runtime/research_signals.json`, capped at 500 entries. Survives restart.

## Safety

Ingesting a signal never places an order. There is no execution path from the
research adapter. Every resulting trade is `paper:true` / `executed:false`.

## Verified

```
ingest 3 signals            -> accepted 3, rejected 0
bad input                   -> 400, ["symbol is required", "direction must be ..."]
ranked signals              -> NVDA 0.8805 (research) ranked #1, above 13F 0.7725
strategy tick               -> 18 of 43 paper trades came from research symbols
stats                       -> 3 signals, avg 0.7667, top 0.88, paper:true
```
