# AGENT 4 — DASHBOARD, THEME & OPERATOR INSTRUCTIONS

You own the **dashboard UI**, the **bright/dark theme**, the **Provider Setup Center panel**,
the **paper status panels**, and the **operator guides**.

## Mission
Give the operator a clear console: switch theme, see provider setup links, run provider tests,
view paper candidates/trades/stats — all read-only/paper, no key entry that transmits anything.

## Do
- `public/index.html`: add a theme toggle (bright/dark) persisted to `localStorage`; add a
  **Provider Setup Center** card (per provider: Website / API Keys / Docs / Setup Guide links +
  a Test button calling `POST /api/data/providers/:id/test`); add a **Paper Status** card
  (candidates, open/closed trades, stats).
- `public/theme.js`: theme variables for `light` and `dark`, toggle + persistence.
- The Provider Setup Center must NOT collect or transmit keys — links + read-only test only.
- `docs/operator/`: write operator guides (start 2024, connect Alpaca manually, use Setup Center,
  test a provider, run paper trading, switch theme).

## Never
- No inputs that POST a key anywhere. No execution buttons. No live-order UI.

## Deliver
Updated dashboard + theme file + operator guide set. UI built against the documented endpoint
contract so it can start before final wiring.
</content>
