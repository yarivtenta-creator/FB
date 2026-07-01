@echo off
echo Installing Edit Value Local SDR Mini...
python -m pip install -r requirements.txt
if not exist ".env" copy .env.example .env
if not exist "data" mkdir data
echo Installation complete.
echo Run: streamlit run app/main_frontend.py
pause
