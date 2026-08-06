# Alpaca MCP Server — Setup

Official server: https://github.com/alpacahq/alpaca-mcp-server (v2.2.0)
Vendored at `mcp/alpaca/server/`. Config at repo root `.mcp.json`.

## Two profiles

### 1. READ-ONLY (active by default)

`ALPACA_TOOLSETS` excludes the `trading` toolset.

- **47 tools** — market data, account status, news, assets, calendar, clock
- **Zero order-placement tools** (verified)
- Matches the BROKER_AI_OS_V7 read-only contract

### 2. PAPER TRADING (opt-in — you must enable it)

Required by `ALPACA_TRADING_AGENT/`, which places paper orders.

To enable, edit `.mcp.json` and **add `trading`** to `ALPACA_TOOLSETS`:

```json
"ALPACA_TOOLSETS": "account,assets,stock-data,crypto-data,options-data,news,index-data,corporate-actions,trading"
```

This adds: `place_stock_order`, `place_crypto_order`, `place_option_order`,
`replace_order_by_id`, `cancel_order_by_id`, `close_position`,
`exercise_options_position`, `get_all_positions`.

`ALPACA_PAPER_TRADE` stays `true` — orders hit the paper endpoint only.
**Never set it to `false`.** That switches to real money.

## Credentials

Never hardcode keys in `.mcp.json` — it is committed. Export them instead:

**Windows (PowerShell):**
```powershell
$env:ALPACA_API_KEY="your_paper_key"
$env:ALPACA_SECRET_KEY="your_paper_secret"
```

**Mac/Linux:**
```bash
export ALPACA_API_KEY=your_paper_key
export ALPACA_SECRET_KEY=your_paper_secret
```

Then start Claude Code from that shell so it inherits them.

## Verify

```
claude mcp list
```
Should show `alpaca`. Then ask: *"Using the alpaca MCP, what is my paper account equity?"*

## Verification performed

| Config | Tools | Order tools |
|--------|-------|-------------|
| all toolsets | ~58 | place_stock_order, place_crypto_order, place_option_order, replace_order_by_id, exercise_options_position |
| trading excluded | 47 | none |

Tested by listing tools over stdio against the installed server.

**Not verified:** a live Alpaca connection. This sandbox blocks egress to
`alpaca.markets` (HTTP 403 from the proxy) and no real keys were provided.
The server starts and filters tools correctly; reaching Alpaca must be
confirmed on your machine with real keys.
