@echo off
REM ── BROKER_AI_OS_V7 launcher (port 6060) ──────────────────
title BROKER AI OS V7 (port 6060)
cd /d "%~dp0"

echo ============================================
echo   BROKER_AI_OS_V7  ^|  port 6060
echo   mode=manual  auto_resume=false  live=OFF
echo   Alpaca: READ-ONLY  ^|  No live trading
echo ============================================

REM Verify Node
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found in PATH. Install Node 18+ and retry.
  pause
  exit /b 1
)

REM Install deps if missing
if not exist "node_modules" (
  echo [setup] Installing dependencies...
  call npm install --no-audit --no-fund
)

REM .env is loaded by server.js itself (cross-platform, comment-safe)

REM Lock to port 6060 — override anything in .env
set PORT=6060
set EXECUTION_MODE=manual
set AUTO_RESUME=false

echo [start] Launching BROKER_AI_OS_V7 on http://localhost:6060 ...
start "" http://localhost:6060
node server.js
pause
