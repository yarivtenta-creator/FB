# RUNBOOK — Broker AI OS v2

## 1. Start
```
cd "C:\Users\Local PC\Desktop\WORLD_BASE_CLEAN"
npm install        # first time only
npm run check      # expect SYNTAX_OK
node server.js     # or START_BROKER_AI_OS_V2.bat
```
Open http://localhost:2024/login.

## 2. Sign in (change these before non-local use)
- admin / `ChangeMe-Admin-2026`  · operator / `ChangeMe-Operator-2026` · viewer / `ChangeMe-Viewer-2026`
- Reset: edit `auth/generate_users.js`, run `node auth/generate_users.js`.

## 3. Connect Alpaca (read-only, manual)
1. Provider Setup Center → Alpaca → **API Keys** (opens Alpaca; create read-only/paper keys there).
2. `copy .env.example .env`, then set:
   ```
   DATA_MODE=live
   ALPACA_API_KEY_ID=...
   ALPACA_API_SECRET_KEY=...
   ALPACA_DATA_BASE_URL=https://data.alpaca.markets
   ```
3. Restart. Alpaca shows `configured` + `live`. Click **Test** → expect `http_status:200`.

## 4. Run paper trading
- Approve a governance order (card 9 or `POST /api/gov/orders/:id/approve`) → opens a gate (`executed:false`).
- `GET /api/data/paper/candidates` → candidate `paper:true, executed:false`.
- `POST /api/data/paper/candidates/:id/simulate` → paper trade priced from the Data Hub.
- `GET /api/data/paper/stats` → `paper:true`.

## 5. Switch theme
Header button **☀ Bright / ☾ Dark**; preference saved in the browser (`localStorage`).

## 6. Stop
Close the server window or run `STOP_BROKER_AI_OS_V2.bat` (kills only the 2024 listener).

## Troubleshooting
- Port 2024 busy → `STOP_BROKER_AI_OS_V2.bat`.
- Live Test returns 401 → keys missing/invalid; the system safely falls back to fixtures (no fabrication).
- Blank panels → check the server console; ensure `db/` and store JSON files exist.
</content>
