@echo off
title Restart Broker AI OS V5
cd /d "%~dp0"
call "%~dp0STOP_BROKER_AI_OS_V5.bat"
timeout /t 2 /nobreak >nul
call "%~dp0START_BROKER_AI_OS_V5.bat"
