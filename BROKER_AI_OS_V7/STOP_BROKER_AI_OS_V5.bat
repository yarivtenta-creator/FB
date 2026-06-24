@echo off
REM Stops ONLY the process listening on port 6700. Leaves 3023 untouched.
title Stop Broker AI OS V5
echo Stopping Broker AI OS v5 (port 6700)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6700 ^| findstr LISTENING') do (
  echo Killing PID %%a on port 6700
  taskkill /PID %%a /F >nul 2>nul
)
echo Done. Port 3023 was not touched.
pause
