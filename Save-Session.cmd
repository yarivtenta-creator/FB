@echo off
REM ===================================================================
REM  Save Session  -  the "button".
REM  Double-click this file (or run it) to save the current session.
REM  It launches the PowerShell workflow interactively.
REM
REM  Optional: set a custom memory root before running, e.g.
REM      set GPT_MEMORY_ROOT=D:\GPT Memory
REM ===================================================================
setlocal
set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\Save-Session.ps1" %*
echo.
pause
