# REAL_2024_AUDIT — Broker AI OS v2 (local)

**Audit date:** 2026-06-03
**Audited project (proven below):** `C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN`
**Identity:** `package.json` → `"broker-ai-os-v2"` v2.0.0, Express-only, port 2024, "Mock-only, manual-approval, no live execution."
**Method:** Read-only. Only files inside this local project were used. No code modified.

---

## 0. Proof of correct project

| Check | Result |
|-------|--------|
| Current working directory (shell launch) | `C:\Users\Local PC` (the **home folder**, itself a git repo full of unrelated files — not a project root) |
| `server.js` exists | **YES** — `WORLD_BASE_CLEAN/server.js` (Express app, port 2024) |
| `package.json` exists | **YES** — `WORLD_BASE_CLEAN/package.json` (`broker-ai-os-v2`) |
| `data_layer` exists | **YES** — adapters, data_hub_v2, paper_trading, provider_registry, performance_tracker, signal_scoring, schemas, routes.js |
| `auth` exists | **YES** — auth.js, middleware.js, routes.js, roles.js, hashing.js, login.html, store/ |
| `governance` exists | **YES** — governance.js, routes.js, audit_log.js, gov_config.js, panel.html, store/ |
| `public` exists | **YES** — `public/index.html` (dashboard) |

> The shell opened in `C:\Users\Local PC` (home), **not** a project. Three copies of this system exist on disk:
> - `Desktop\all2BROKER_AI_OS_V2_SAFE_BUILD` — staging: zips + packs, **no `package.json`, no `public/`**
> - `Desktop\claude new world` — same staging contents, **no `package.json`, no `public/`**
> - `Desktop\WORLD_BASE_CLEAN` — **the only complete, runnable build**: has `package.json`, `package-lock.json`, `public/`, `config.js`, `db/`, `connectors/`, and START/STOP/RESTART `.bat` launchers.
>
> **`WORLD_BASE_CLEAN` is the real project.** The other two are assembly/zip folders.

---

## 1. What currently works

Verified by reading source and a Node syntax check (`node --check server.js` → SYNTAX_OK; Node v24.14.0 installed).

- **App boots as one integrated server.** `server.js` mounts every subsystem into a single Express instance on port 2024 (`require.main` guard; `module.exports = app`).
- **Auth + RBAC** (`auth/`). Local scrypt-hashed users (`admin`, `operator`, `viewer`), in-memory sessions with sliding 30-min / 7-day remember-me timeouts, token via `x-auth-token` header or `auth=` cookie. `requireAuth` / `requirePerm` / `requireRole` guards. Roles: admin=`*`, operator can decide approvals, viewer read-only. Admin-only perms (`config.admin`, `backup.admin`, `users.admin`, …) correctly denied to non-admins.
- **Governance approval authority** (`governance/`). `/api/gov` + `/api/governance` compat. List/promote signals, approve/reject orders, history, audit. **Status-change only — cannot place an order** (by design; core `/api/approval/*` was removed so Governance is the single authority).
- **Data Layer** (`data_layer/`). `data_hub_v2` is the single aggregation point; 7 mock adapters registered (alpaca, t4, news, calendar, congress, insider, 13f). All output normalized through `schemas` (`validate()` drops non-conforming records). Endpoints under `/api/data/*`: quotes, news, calendar, signals, ranked signals, provider list/summary, performance.
- **Paper trading simulation** (`data_layer/paper_trading`). `openTrade`/`closeTrade`/`listTrades`/`stats` work against mock hub quotes, persisted to `paper_state.json`, every record flagged `paper:true, mock:true`. P/L and win-rate computed. **Functional today.**
- **T4 futures mock connector**, **n8n template registry** endpoints, **backup center** (manifest list/create, admin-gated), **health check** (`/api/health/full`), **graph plan stub** (`/api/graph/propose`).
- **Safety contract holds.** `config.js` reads only two non-secret flags; `EXECUTION_MODE` defaults `manual`, `AUTO_RESUME=false`, `LIVE_ENDPOINT_ENABLED=false`. A full-project scan for outbound network code (`http`/`https`/`fetch`/`axios`/`alpaca` URLs) returned **nothing but localhost log strings** — there is genuinely no live I/O anywhere.
- **Launchers** (`START_/STOP_/RESTART_BROKER_AI_OS_V2.bat`): verify Node, run `npm install` if `node_modules` is absent, set safe env, start server, open browser.

## 2. What is currently broken / gaps

- **Dependencies not installed.** `node_modules/` is **missing**. `node server.js` fails until `npm install` runs. (START.bat installs automatically; manual `node server.js` does not.) — *blocking for first manual boot, trivial to fix.*
- **`logs/` directory missing.** `server.js` appends a boot line to `logs/v2.log`; the write is wrapped in `try/catch`, so it's silently skipped — harmless but the boot log is lost.
- **No real data.** Every adapter returns static fixtures; `data_hub_v2.health()` reports `data_freshness: "mock (static fixtures)"`. Paper-trade P/L is therefore not market-realistic.
- **`auto-paper` mode is declared but not implemented.** `config.VALID_MODES` includes `auto-paper`, but no engine/loop anywhere consumes it; only `manual` behavior exists.
- **Three on-disk copies** of the project invite editing the wrong one (the root cause pattern behind the "wrong repo" question — see §7).
- **Admin password is a placeholder** (`users.json` comment: "Placeholders … change them"). Hashes exist, but the cleartext must be known/reset to log in.

No crashes, no syntax errors, no broken `require` graph were found in the source itself.

## 3. What blocks REAL read-only provider integration

This is blocked **by design**, not by bugs:

1. **No HTTP client / no network code.** Adapters (`adapters/alpaca/index.js`, etc.) are pure mock functions. There is no `fetch`/`axios`/`https` call to replace.
2. **No credential path.** `config.js` deliberately "reads NO credentials … never touches .env keys, Alpaca keys, tokens." A read-only integration needs an explicit, gated way to load API keys (env only).
3. **Registry locks providers off.** `provider_registry` ships everything `enabled:false` / `status:'not_configured'`; `summary()` states "enabled=false means not wired to any live source."

To integrate read-only safely: add an HTTP fetch inside one adapter (e.g. Alpaca *market-data* / *positions* endpoints only), load its key from env behind a feature flag, flip that provider's `enabled` once healthy — and **keep all order/execution endpoints absent** (they don't exist today; do not add them).

## 4. What blocks paper trading

Paper trading **already runs** as a local simulation. What blocks *meaningful* paper trading:

1. **Mock-only prices.** Quotes are static fixtures, so entries/exits and P/L don't reflect the market. → same gap as §3 (need real read-only quotes feeding `data_hub_v2`).
2. **No automation loop.** `auto-paper` mode is unimplemented; trades only open/close on manual `POST /api/data/paper/open|close`. There is no scheduler, no signal→paper-order bridge.
3. **First-boot deps** (§2) must be installed before any of this is reachable.

Nothing in the safety contract blocks paper trading itself — it is explicitly the allowed surface.

## 5. Exact next actions

1. **Boot it.** `cd "C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN"` → `npm install` → `npm run check` → `node server.js` (or run `START_BROKER_AI_OS_V2.bat`). Open `http://localhost:2024/login`.
2. **Set/confirm the admin password** so login works (`auth/store/users.json` hashes are placeholders).
3. **Consolidate copies.** Make `WORLD_BASE_CLEAN` the single source of truth; archive/delete `all2BROKER_AI_OS_V2_SAFE_BUILD` and `claude new world` to stop edits landing in the wrong folder.
4. **(Optional) read-only provider:** in `adapters/alpaca`, add a read-only market-data fetch + env key behind a flag; set `enabled:true` only after `data_hub.health()` is green; never add order endpoints.
5. **(Optional) real paper trading:** route `data_hub` quotes from the live read-only feed into `paper_trading._price`, then implement the `auto-paper` loop that `VALID_MODES` already reserves.
6. Create an empty `logs/` dir so the boot log persists (cosmetic).

## 6. Integrated application or library?

**Integrated, runnable application** — not a library.

- Single entry point `server.js` wires auth, governance, data layer, expansion, connectors, backup, health, and a static `public/` dashboard into one Express process with launchers and a UI.
- The sub-packs (auth pack, governance pack, data-layer pack, expansion) are modular routers, but they are *assembled and mounted* here. Each `routes.js` says "Mount in v2…" — they are components **of** the app, consumed internally, not published for external reuse. There is no exported library surface beyond `module.exports = app` (used to host/test the app).

## 7. Was the previous cloud audit performed on the wrong project?

**Almost certainly yes — `/home/user/FB` is a different project from this one.**

- `/home/user/FB` corresponds (per the workspace `CLAUDE.md`) to the **"Israel Meta Campaigns Dashboard / Campaign Command Center"** — a React 18 + Express bilingual **Facebook/Meta ad-campaign** orchestration tool (ports 3001/3002, agents Claude/Codex/Gemini).
- This project (`WORLD_BASE_CLEAN`, `broker-ai-os-v2`, port 2024) is a **stock/futures broker AI OS**: providers, signals, governance approvals, paper trading. A full scan of this project for `facebook` / `campaign` / `meta ads` / `gemini` / `codex` / `/home/user/FB` returned **zero matches**.
- They share no code, no ports, no dependencies, and no domain. "FB" = Facebook campaigns; this = brokerage.

**Conclusion:** if the cloud audit ran against `/home/user/FB` while intending to assess the Broker AI OS, it audited the wrong repository. The correct target for *this* system is the local `WORLD_BASE_CLEAN` folder, port 2024 — not `/home/user/FB`. (No `/home/user/FB` files were inspected for this audit; it is referenced only to explain the mismatch.)
