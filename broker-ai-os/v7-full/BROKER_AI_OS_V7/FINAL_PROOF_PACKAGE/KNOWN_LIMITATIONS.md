# KNOWN LIMITATIONS (honest, evidence-based)

Status is now **FULL PAPER SYSTEM READY FOR MANUAL PROVIDER KEYS**. The remaining items below do
not block that status and none compromise safety.

## 1. ~~Live read-only fetch is a stub~~ — RESOLVED
The Alpaca adapter now performs a **real read-only HTTP GET** to `data.alpaca.markets`. Proven by a
real HTTP 401 (dummy keys) and by the full-chain test on real-shaped data. See
`ALPACA_LIVE_INTEGRATION_PROOF.md`.

## 2. Authenticated live quotes not yet observed (by design)
No operator API keys are present, so a real **HTTP 200** with live numbers has not been captured.
This is the definition of "READY FOR MANUAL PROVIDER KEYS": add read-only keys + `DATA_MODE=live`
and Alpaca auto-activates. The pipeline is already proven to carry Alpaca's real quote schema
end-to-end (paper trade priced at the live midpoint 222.22).

## 3. Only Alpaca has a real read-only adapter
T4/Plus500, News, Calendar, Congress, 13F, Insider remain mock data sources (data/status only).
`registry.test()` for those reports "no read-only adapter integration wired yet." This matches the
task scope (Alpaca read-only first). T4/Plus500 remain explicitly execution-free.

## 4. No automation loop (`auto-paper`)
Reserved in `config.VALID_MODES` but intentionally not implemented (manual-approval system).

## 5. Live feed = IEX (free tier) midpoint
`getQuotes()` uses the `iex` feed and the bid/ask midpoint. Operators with SIP entitlement can set
`ALPACA_DATA_FEED=sip`. Bars remain mock (not part of the required quote path).

## 6. Dev credentials are placeholders
`admin/operator/viewer` use documented placeholders (`ChangeMe-*-2026`); change via
`node auth/generate_users.js` before non-local use.

## 7. `git` tracking
Project sits inside the home repo, untracked. The added `.gitignore` protects `.env` once the
project is initialized as its own repo (`git init`).

## Explicitly NOT limitations (verified safe)
- No live trading / orders / broker execution / FIX / T4/Plus500 execution — verified absent.
- Adapter only contacts the read-only data host; never the trading host; never logs a key.
- Paper artifacts always `paper:true` / `executed:false` — verified across all suites.
</content>
