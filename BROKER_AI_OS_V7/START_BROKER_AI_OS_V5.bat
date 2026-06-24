@echo off
REM ── BROKER AI OS v5 launcher (port 6700) ──────────────────
REM Starts ONLY the v5 instance. Does not touch the 3023 system.
title Broker AI OS V5 (port 6700)
cd /d "%~dp0"

echo ============================================
echo   BROKER AI OS v5  ^|  SAFE INSTANCE
echo   mode=manual  auto_resume=false  live=OFF
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

REM Safe defaults (do NOT set a live mode)
set PORT_V5=6700
set EXECUTION_MODE=manual
set AUTO_RESUME=false

echo [start] Launching on http://localhost:6700 ...
start "" http://localhost:6700
node server.js
pause
