# AdsPower Integration Plan

## Overview
AdsPower exposes a local REST API on `http://local.adspower.net:50325`.
All calls require an API key passed as a query parameter.

## Endpoints Used
- `GET /api/v2/user/list` — list browser profiles
- `GET /api/v2/browser/start?user_id=X` — open profile
- `GET /api/v2/browser/stop?user_id=X` — close profile
- `GET /status` — health check (or ping list endpoint)

## Safety Rules
1. ADSPOWER_AUTOMATION_ALLOWED=false by default
2. No automatic messaging, posting, or scraping
3. Every open/close action is logged to activities
4. Profile creation/deletion not supported
5. User must manually initiate all browser actions

## Configuration
Stored in `.env` and `config/adspower.config.json`.
Settings editable via UI Settings page.

## Failure Handling
- If AdsPower is unreachable: show "Disconnected" status, disable buttons
- Log all connection errors to activities
- Never crash the app on AdsPower failure
