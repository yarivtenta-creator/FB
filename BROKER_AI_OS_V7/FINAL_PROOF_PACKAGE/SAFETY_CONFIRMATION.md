# SAFETY CONFIRMATION (scan findings — exact)

Scope: entire project EXCLUDING `node_modules/`. Tools: ripgrep.

## 1. Order / execution METHODS (the dangerous surface)
Pattern for real calls/defs: `execute\s*\(|function execute|\.transfer\(|submitOrder\s*\(|placeOrder\s*\(`
**Result: NO MATCHES FOUND.** There is no order/execute/transfer function call or definition anywhere.

Word matches for `placeOrder|submitOrder|cancelOrder|closePosition|replaceOrder` exist ONLY in:
- prohibition comments (`adapters/alpaca/index.js`, `paper_bridge/index.js`)
- the test allow-list of forbidden names (`tests/run.js`)
- planning/operator docs
- `graph/langgraph_phase1_plan.md` ("cannot import or call `placeOrder`")
None are executable order code.

## 2. `execute` / `execution` / `transfer` words (75 occurrences, 46 files)
All are non-executing nouns/flags, e.g. `EXECUTION_MODE`, `execution_allowed`,
`execution_is_performed_here:false`, `EXECUTION_IS_PERFORMED_HERE`, doc prose. None invoke anything.
Verified: the call-pattern scan in §1 returned zero.

## 3. FIX routing / Plus500 / T4
Pattern `\bFIX\b|Plus500` matches ONLY:
- `.env.example` ("no execution credential and no FIX configuration. Do not add one.")
- registry/adapter/connector comments stating "DATA/STATUS ONLY. No execution, no FIX."
- `expansion/integration_readiness_center` marks Plus500 `not_ready` (high risk).
**No FIX engine, no Plus500/T4 execution path exists.** T4 is a mock futures *data* connector only.

## 4. Secrets / tokens / API keys
Pattern `secret|token|api[_ ]?key|password` (case-insensitive) matches ONLY:
- `.env.example` — placeholder env var NAMES with **empty values** (`ALPACA_API_KEY_ID=`, etc.).
- `auth/*` — local **session tokens** (`crypto.randomBytes`) and **scrypt-hashed** passwords;
  plaintext is never stored; `auth.js` comment: "no secrets exposed".
- `auth/generate_users.js` — documented **placeholder dev passwords** (`ChangeMe-*-2026`) meant to be changed.

Real-key pattern `sk_live|sk_test|pk_live|AKIA[0-9A-Z]{16}|bearer [a-z0-9]{20}`:
**NONE FOUND.**

## 5. `.env` handling
- Only `.env.example` exists on disk (no real `.env`).
- `.gitignore` ignores `.env`, `.env.*` (keeps `!.env.example`), `node_modules/`, `logs/`,
  and `paper_state.json`.
- `git ls-files` shows no `.env` tracked.

## 6. Real read-only Alpaca networking (added in the live-integration step)
- The adapter issues **only** `GET` to `https://data.alpaca.markets/...` (market-data host).
  Verified: source references `data.alpaca.markets` and **not** the trading host (unit test
  `alpaca adapter never targets the TRADING host` = PASS).
- Order-call pattern scan (`placeOrder(|submitOrder(|.transfer(|cancelOrder(|closePosition(|replaceOrder(`)
  across the project (excluding node_modules/tests) → **NO ORDER CALLS FOUND**.
- Key values are sent only in request headers; the adapter contains **no `console.*` logging** at all
  (grep returned none), so a key can never be logged. Keys are read via `process.env` presence checks only.
- On unauthorized/unreachable, the adapter returns fixtures and fabricates no "live" data
  (proven: dummy-key run → real 401 → fallback).

## CONFIRMATION
- [x] No live trading / no real orders / no broker execution.
- [x] No T4 / Plus500 execution. No FIX routing.
- [x] Read-only data only; `DATA_MODE=mock` by default.
- [x] No API keys in UI, logs, or source. `.env.example` only; real `.env` git-ignored.
- [x] Every paper artifact carries `paper:true` and `executed:false` (see `PAPER_TRADING_PROOF.md`).
- [x] 3023, 2025, /home/user/FB, staging folders were NOT touched (all work is inside WORLD_BASE_CLEAN).
</content>
