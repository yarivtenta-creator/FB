@echo off
echo Starting EDIT VALUE LOCAL SDR MINI...
cd /d "%~dp0"
if not exist ".env" (
    copy .env.example .env
    echo Created .env from .env.example
)
if not exist "data" mkdir data
streamlit run app/main_frontend.py --server.port 8501 --server.headless false
pause
