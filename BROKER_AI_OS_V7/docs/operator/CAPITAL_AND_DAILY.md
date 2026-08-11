# Dividing the money, and seeing what changed each day

## The problem this fixes

Every strategy used to size its positions from the **full** account equity. With
12 strategies running that is not "$100k invested across 12 strategies" — it is
twelve strategies each behaving as if it owned the whole $100k. The totals could
add up to several times the account. The numbers looked reasonable and meant
nothing.

## How the money is divided now

The account is split into per-strategy buckets. A strategy sizes from **its own
bucket** and can never deploy more than that bucket holds.

With $100,263.81 and all 12 running:

```
$100,263.81 ÷ 12 = $8,355.32 per strategy
```

The dashboard's **CAPITAL SPLIT** bar shows the mode, the investable amount and
how many strategies are funded. Each row of the strategy table now shows
**Capital**, **Deployed** and **Cash left**, so you can see at a glance which
strategies are fully invested and which are sitting on cash.

Only **enabled** strategies get funded. Turn one off and its share is
redistributed to the others on the next tick — the split always covers exactly
what is running, with no money parked in a strategy that is switched off.

### Modes

| Mode | What it does |
|---|---|
| **Equal split** (default) | Every running strategy gets the same share |
| **Weighted** | Each gets `weight ÷ sum of weights`; set weights per slot via the API |
| **Reserve** | Hold back a % as untouched cash before splitting the rest |

Buttons for equal / weighted / reserve sit in the CAPITAL SPLIT bar.

### About risk %

Each strategy profile has a `riskPct` (Conservative 1%, Aggressive 3%, and so
on). That percentage was written against the whole account, but a strategy now
only holds 1/12th of it, so it is scaled by the number of funded strategies.
The **relative** aggressiveness is preserved — a 3% strategy still commits three
times what a 1% one does — but both stay inside their own bucket.

The bucket cap is absolute. If a strategy's next position would overrun its
cash, the position is trimmed to what it can afford, and skipped entirely if
that buys less than one share.

## Seeing what changed each day

Panel **0c · Daily Change** compares the two most recent daily snapshots.

A snapshot is taken **automatically on the first tick of each UTC day** — with
auto-run on, the history fills itself in and you do nothing. "Take snapshot now"
forces one. Taking a second snapshot on the same day replaces that day's entry
rather than adding a duplicate, so an extra click or a restart cannot corrupt
the history.

The report shows, for the account and for every strategy:

- unrealized P/L and how much it moved
- position value and its change
- capital, deployed amount and cash
- how many new trades opened since the last snapshot
- best and worst strategy of the period

### Marking to market

Open positions are valued at the latest Alpaca price (read-only
`GET /v2/stocks/{symbol}/trades/latest`). When a price cannot be fetched the
position is held at its entry price and the row is flagged, with a warning like:

```
⚠ 4/5 symbols priced. Unpriced positions are held at entry and marked stale.
```

An unpriced position is always reported as unpriced. It is never quietly valued
at entry and presented as a real mark.

### On the first day

With only one snapshot there is nothing to compare, and the panel says so:

> First snapshot (2026-08-11). Come back tomorrow and this will show what moved.

It does not show a zero-change report, which would look like a flat day rather
than a missing one.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/strategy/allocation` | Current split + saved config |
| `POST /api/strategy/allocation/mode` | `{"mode":"equal"}` or `"weighted"` |
| `POST /api/strategy/allocation/weight/:id` | `{"weight":2}` for one slot |
| `POST /api/strategy/allocation/reserve` | `{"reserve_pct":10}` |
| `POST /api/strategy/allocation/reset` | Back to an equal split, no reserve |
| `GET /api/strategy/daily` | What changed since the previous snapshot |
| `GET /api/strategy/daily/history?limit=30` | Raw snapshots |
| `GET /api/strategy/daily/status` | How many snapshots, whether today is recorded |
| `POST /api/strategy/daily/snapshot` | Take one now |

## What is running out of the box

The shipped state now has all 12 strategies **on**, the engine **resumed**, and
auto-run **on at 900s (15 min)**. Positions are still paper simulations unless
you arm Option B — see `OPTION_B_PAPER_EXECUTION.md`.
