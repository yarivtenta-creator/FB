# Operator Guide — Start Broker AI OS v2 (port 2024)

This instance is **safe**: mock data by default, read-only data, paper-only, no live execution.
It does not touch 3023 or 2025.

## Start it
1. Install Node.js 18+ (this build was verified on Node v24).
2. Open a terminal in `C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN`.
3. First time only: `npm install`
4. Sanity check: `npm run check`  → prints `SYNTAX_OK`
5. Start: `node server.js`  (or double-click `START_BROKER_AI_OS_V2.bat`)
6. Open http://localhost:2024/login

## Sign in (local dev credentials)
The shipped placeholder credentials (from `auth/generate_users.js`) are:
- admin / `ChangeMe-Admin-2026`
- operator / `ChangeMe-Operator-2026`
- viewer / `ChangeMe-Viewer-2026`

**Change them** before any non-local use: edit `auth/generate_users.js`, then run
`node auth/generate_users.js` to re-hash. Passwords are scrypt-hashed; plaintext is never stored.

## What you should see
System Health, Provider Setup Center, Data Hub (source of truth), Paper Signal Board,
Ranked Signals, Governance/Approval Queue, Paper Status, T4 mock futures, n8n registry.

## Stop it
Close the server window or run `STOP_BROKER_AI_OS_V2.bat` (kills only the 2024 listener).
</content>
