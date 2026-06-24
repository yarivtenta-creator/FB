@echo off
REM Stops ONLY the process listening on port 6060.
title Stop BROKER_AI_OS_V7
echo Stopping BROKER_AI_OS_V7 (port 6060)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6060 ^| findstr LISTENING') do (
  echo Killing PID %%a on port 6060
  taskkill /PID %%a /F >nul 2>nul
)
echo Done. Port 6060 released.
pause
