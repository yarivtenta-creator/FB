# Skills Installed — BROKER_AI_OS_V7

## Stock Trading Skills (15)
`/trade analyze <ticker>` · `/trade quick <ticker>` · `/trade technical <ticker>`
`/trade fundamental <ticker>` · `/trade sentiment <ticker>` · `/trade sector <sector>`
`/trade compare <t1> <t2>` · `/trade thesis <ticker>` · `/trade options <ticker>`
`/trade portfolio` · `/trade risk <ticker>` · `/trade screen <criteria>`
`/trade earnings <ticker>` · `/trade watchlist` · `/trade report-pdf`

## Crypto Skills (15)
`/crypto analyze <token>` · `/crypto quick <token>` · `/crypto technical <token>`
`/crypto fundamental <token>` · `/crypto sentiment <token>` · `/crypto narrative <sector>`
`/crypto compare <t1> <t2>` · `/crypto tokenomics <token>` · `/crypto onchain <token>`
`/crypto defi <protocol>` · `/crypto risk <token>` · `/crypto screen <criteria>`
`/crypto watchlist` · `/crypto report-pdf`

## Subagents (10)
trade-technical, trade-fundamental, trade-sentiment, trade-risk, trade-thesis
crypto-technical, crypto-fundamental, crypto-sentiment, crypto-tokenomics, crypto-onchain

## Scripts
- `scripts/generate_trade_pdf.py` — stock PDF reports
- `scripts/generate_crypto_pdf.py` — crypto PDF reports

## 4 Upgrades (docs/upgrades/)
- `1-roast.txt` — pressure-test an idea (go / reshape / kill)
- `2-verify.txt` — prove it actually works
- `3-goal.txt` — build with parallel sub-agents
- `4-session-handoff.txt` — clean handoff summary
- `RUN-ALL.txt` — all 4 at once

## Locations
| What | Global (all projects) | This project |
|------|----------------------|--------------|
| Skills | `~/.claude/skills/` | `.claude/skills/` |
| Agents | `~/.claude/agents/` | `.claude/agents/` |
| Scripts | — | `scripts/` |
| Upgrades | — | `docs/upgrades/` |

## Safety
These skills are **research and analysis only**. They do not execute trades,
place orders, or connect to any broker. The BROKER_AI_OS_V7 read-only /
no-live-trading contract is unchanged.
