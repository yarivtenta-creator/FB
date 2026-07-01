# REMAINING WORK — Broker AI OS v2

**Status:** FULL PAPER SYSTEM READY FOR MANUAL PROVIDER KEYS.
Broker development is **frozen**. Nothing below is a development blocker. Items are operator
actions, optional hardening, or future scope — ranked by priority.

---

## P0 — Operator must do (to see real live data)
1. **Add Alpaca read-only keys.** Copy `.env.example` → `.env`; set `DATA_MODE=live`,
   `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`. Restart. Click **Test** → expect `http_status:200`.
   *Why pending:* no keys present in this build (by design). This is the one thing between "ready"
   and "live quotes flowing".
2. **Change default passwords.** `admin/operator/viewer` use placeholders (`ChangeMe-*-2026`).
   Edit `auth/generate_users.js`, run `node auth/generate_users.js`. Required before any non-local use.

## P1 — Verify-after-keys (5 min, operator)
3. Confirm `GET /api/data/hub/health` → `data_mode:live`, `freshness:"live (read-only)"`,
   Alpaca `enabled:true`.
4. Confirm a paper trade prices off a real live quote (open via Paper Status, check `entry`).
5. Confirm logs hold no key value (`logs/v2.log`, server console).

## P2 — Optional hardening (not required for status)
6. **`git init`** the project as its own repo so `.gitignore` actually protects `.env`
   (currently sits inside untracked home repo).
7. **SIP feed** if entitled: set `ALPACA_DATA_FEED=sip` (default `iex` free tier).
8. **Rate-limit / backoff** on `refreshLive()` if polling hard (currently 5s cache TTL, fire-and-forget).
9. **Persist live cache** across restart if cold-start latency matters (currently in-memory only).

## P3 — Future scope (explicitly NOT done — needs own engagement + approval)
10. **More real adapters.** Only Alpaca is real read-only. News/Calendar/Congress/13F/Insider
    still mock. T4/Plus500 mock data-only (keep execution-free).
11. **`auto-paper` loop.** Reserved in `config.VALID_MODES`, not implemented (manual-approval only).
    Adding it = signal→paper automation; design carefully, keep `executed:false`.
12. **Real bars / historical** Alpaca data (currently `getBars` mock).
13. **P/L realism** once live quotes feed closes over time.

## Guardrails if anyone extends later
- Never add order/execute method or the trading host.
- Keep `executed:false` hard-coded in paper path.
- Load any key from env presence only; never log/return key values.
- Do not touch 3023, 2025, /home/user/FB, staging.

---
**Bottom line:** code complete + verified. Only P0 (add keys, change passwords) blocks live use.
Everything else optional/future.
</content>
