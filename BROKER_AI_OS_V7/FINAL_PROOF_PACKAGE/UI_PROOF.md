# UI PROOF (verified in a live browser against the running server, port 2024)

Method: started the real server (`node server.js`, port 2024), logged in as `admin`, loaded the
dashboard, and read live DOM/computed styles. (Static `screenshot` capture timed out in this
environment — so colors/labels are proven via `getComputedStyle`, which is the authoritative source
for theme values anyway.)

## Theme files
- `public/theme.js` — toggle + `localStorage` persistence (key `bk2024_theme`).
- `public/index.html` — `[data-theme="dark"]` and `[data-theme="light"]` palettes; toggle button `#themeToggle`.

## Bright / Dark — proven by computed styles
| | data-theme | body background | body color | toggle label |
|---|---|---|---|---|
| Dark (default) | `dark` | `rgb(10, 14, 20)` | `rgb(230, 237, 243)` | `☀ Bright` |
| After toggle | `light` | `rgb(244, 246, 251)` | `rgb(28, 37, 48)` | `☾ Dark` |

## Persistence — proven across reload
- After toggling to light, `localStorage.bk2024_theme === "light"`.
- After `location.reload()`, theme re-applies as `light`, body bg `rgb(244,246,251)`, toggle label `☾ Dark`.
- (A label-sync bug found during verification — the `<head>` script set the attribute before the
  button existed — was fixed in `theme.js` by re-applying on `DOMContentLoaded`; re-verified.)

## Toggle location
Header, top-right, button `#themeToggle` (`onclick="BK_THEME.toggle()"`), next to the user/logout.

## Applied dashboard sections (rendered with live data, authenticated)
- **Provider Setup Center** (card 2): rendered providers = `Alpaca, T4, News, Calendar, Congress, 13F, Insider`,
  each with Website / API Keys / Docs / Setup Guide links + a read-only **Test** button.
- **Data Hub** (card 3): `data mode mock · source data_hub_v2 · freshness mock (static fixtures) ·
  registered providers 7 · active (enabled) 5 · configured 0 · symbol coverage 14`.
- **Ranked Signals** (card 8): first row `GOOGL 13f_mock`.
- **Paper Status** (card 10): `2 OPEN · 0 CLOSED · PAPER true`; candidate `#201 AMZN long paper:true · executed:false`.

## Key-safety (UI)
- Unit test: `index.html has NO password input / no key-capturing field` (PASS).
- The only POST the Setup Center issues is the read-only `POST /api/data/providers/:id/test`.
- API-key links open the provider's own site in a new tab; keys are never typed into this app.

## Operator guides (served at /docs/operator/*, linked from card 16)
`START_2024.md`, `CONNECT_ALPACA.md`, `PROVIDER_SETUP_CENTER.md`, `PAPER_TRADING.md`, `THEME_SWITCH.md`.
They explain: how to start 2024, connect Alpaca manually, use the Provider Setup Center, test a
provider connection, run paper trading, and switch theme.
</content>
