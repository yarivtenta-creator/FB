@echo off
REM Double-click this to clean up idle Claude processes.
REM
REM It exists because .ps1 files do not run on double-click on Windows, and
REM running one from a prompt usually fails with "running scripts is disabled
REM on this system". -ExecutionPolicy Bypass applies to this one invocation
REM only; it does not change any machine setting.
REM
REM Optional argument overrides the mode:
REM   fix-claude-cpu.bat Report     show what is running, change nothing
REM   fix-claude-cpu.bat KillIdle   stop idle processes (default)
REM   fix-claude-cpu.bat KillAll    stop everything

setlocal

set "MODE=%~1"
if "%MODE%"=="" set "MODE=KillIdle"

if not exist "%~dp0fix-claude-cpu.ps1" (
    echo ERROR: fix-claude-cpu.ps1 not found next to this file.
    echo Keep both files in the same folder.
    echo.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-claude-cpu.ps1" -Mode "%MODE%"
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
    echo.
    echo Script exited with code %RC%.
)

echo.
pause
exit /b %RC%
