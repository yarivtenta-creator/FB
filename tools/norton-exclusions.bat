@echo off
REM Double-click this to list the repository folders worth excluding from
REM Norton's real-time scanning, and to benchmark how slow git currently is.
REM
REM Read-only. It changes nothing, on your system or in Norton.
REM
REM Optional argument sets where to search:
REM   norton-exclusions.bat C:\dev

setlocal

if not exist "%~dp0norton-exclusions.ps1" (
    echo ERROR: norton-exclusions.ps1 not found next to this file.
    echo Keep both files in the same folder.
    echo.
    pause
    exit /b 1
)

if "%~1"=="" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0norton-exclusions.ps1"
) else (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0norton-exclusions.ps1" -SearchPath "%~1"
)

echo.
pause
exit /b %ERRORLEVEL%
