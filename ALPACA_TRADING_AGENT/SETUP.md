# Setup Guide — 20 minutes, zero coding

## What you're building

- **Brain:** Claude (Claude Desktop or Claude Code), instructed by `CLAUDE.md`
- **Hands:** Alpaca's MCP server — the bridge that lets Claude pull live prices and place orders
- **Memory:** the `memory/` folder — the ledger and learnings files that make the bot smarter over time
- **Money:** Alpaca PAPER account only (fake money) until you've proven the system

## Step 1 — Alpaca account (5 min)

1. Go to https://alpaca.markets and sign up (free, no deposit needed for paper trading).
2. In the dashboard, switch to **Paper Trading** (toggle at the top left).
3. Go to the API keys section of the paper dashboard and generate keys. Copy both:
   - `API Key ID`
   - `Secret Key`
4. Keep them private. These paper keys can't touch real money, but treat them like passwords anyway.

## Step 2 — Connect the Alpaca MCP to Claude (10 min)

Alpaca has an official MCP server: https://github.com/alpacahq/alpaca-mcp-server

**Easiest path:** open Claude (Desktop or Code), paste this, and let Claude do it:

> Help me install and configure the official Alpaca MCP server (github.com/alpacahq/alpaca-mcp-server) for my PAPER trading account. I have my API Key ID and Secret Key ready. Configure it so it only uses the paper endpoint (paper-api.alpaca.markets). Then verify the connection by fetching my paper account balance.

Claude will guide you through adding it to your MCP config and pasting the keys in. When it can read your paper account balance ($100,000 fake dollars by default), you're connected.

## Step 3 — Load this agent (2 min)

1. Put this whole folder somewhere permanent (e.g., `C:\trading-agent\` or your projects folder).
2. Open the folder in Claude Code, **or** in Claude Desktop start a Project and add these files to it.
3. Fill in `profile/trader-profile.md` — one page about you, your goals, your risk tolerance. The agent reads it before trading.
4. Paste the contents of `MASTER_PROMPT.txt` to start the first session.

## Step 4 — Run it

- Say **"run cycle"** → the agent reads its memory, checks the market, applies the strategy, trades (paper), logs everything, and reports.
- Say **"status"** any time.
- After a few days, say **"reflect"** → it mines the ledger for patterns and proposes improvements.
- Run a cycle 1–3× per day during US market hours (15:30–22:00 Amsterdam time). You can also just ask Claude to remind you or schedule it.

## The homework (from the video, and it's right)

1. Paper trade for **at least one week**.
2. Watch the learnings file grow — that's the real product.
3. Only after consistent paper results, consider real money: start at 1–3% of your max risk tolerance, in a **separate sub-account** with its own API keys, and scale slowly.

## Safety checklist before EVER going live (not yet!)

- [ ] ≥ 20 paper trades logged, positive expectancy
- [ ] Learnings file contains real, specific patterns
- [ ] Separate live sub-account funded with only what the bot may lose
- [ ] New API keys for live, with withdrawal permissions DISABLED
- [ ] Risk rules in CLAUDE.md reviewed and tightened for live

## Troubleshooting

- **Claude can't see the MCP tools** → restart Claude Desktop/Code after editing the MCP config.
- **"Market closed" / no data** → US market hours only in v1: Mon–Fri 15:30–22:00 Amsterdam time (16:30–23:00 during US winter time).
- **Orders rejected** → check buying power and that you're on the paper endpoint.
- Anything else → just ask Claude; the error message plus "fix this" usually works.
