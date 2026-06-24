# SAFETY CONTRACT — Broker AI OS v2

These guarantees are enforced in code and verified in `../FINAL_PROOF_PACKAGE/`.

| Guarantee | How it is enforced | Evidence |
|---|---|---|
| No live trading / no real orders | No broker client; no order endpoint exists | order-call scan → NO MATCHES |
| No broker execution | Governance approval is a gate flag only (`executed:false`) | `PAPER_TRADING_PROOF.md` |
| No T4/Plus500 execution, no FIX | T4 is mock data only; Plus500 `not_ready`; no FIX engine | `SAFETY_CONFIRMATION.md` |
| Read-only data only | Adapter issues GET only, to the market-data host only | `ALPACA_LIVE_INTEGRATION_PROOF.md` |
| Paper only | Every trade/candidate `paper:true`, `executed:false` | all test suites |
| No secrets in source/logs/UI | `.env.example` placeholders only; `.env` git-ignored; no key logging; no UI key capture | `SAFETY_CONFIRMATION.md`, `UI_PROOF.md` |
| Mock by default | `DATA_MODE=mock` default; unknown values fall back to mock | `config.js` |
| Live is read-only + gated | Live needs keys present; auto-enable only in live mode; still no orders | `PROVIDER_PROOF.md` |

## Do-not-touch (out of scope, never modified)
- `3023` / Garrrr · `2025` / BROKER_WORLD_SYSTEM · `/home/user/FB` · staging folders.

## If you extend this later (guardrails)
- Never add an order/execution method or the trading host.
- Keep `executed:false` hard-coded in the paper path.
- Load any new key from env presence only; never log or return key values.
</content>
