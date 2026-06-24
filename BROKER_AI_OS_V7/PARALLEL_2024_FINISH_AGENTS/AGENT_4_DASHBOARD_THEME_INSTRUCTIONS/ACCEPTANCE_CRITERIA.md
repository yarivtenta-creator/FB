# AGENT 4 — ACCEPTANCE CRITERIA

1. Theme toggle present; choice persists across reload via `localStorage` key `bk2024_theme`.
2. Both `light` and `dark` palettes defined; default respects saved preference.
3. Provider Setup Center card lists providers with Website / API Keys / Docs / Setup Guide / Test buttons.
4. No DOM input submits a key value to the server (only `POST /api/data/providers/:id/test`).
5. Paper Status card renders candidates + trades + stats from `/api/data/paper/*`.
6. Operator guides exist for: start 2024, connect Alpaca, Setup Center, test provider, paper trading, theme switch.
7. `index.html` is valid (loads without console errors when server runs).
</content>
