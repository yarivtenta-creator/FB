#!/bin/bash
echo "Installing Edit Value Local SDR Mini..."
pip install -r requirements.txt
cp -n .env.example .env 2>/dev/null || true
mkdir -p data
chmod +x run_local.sh
echo "Done. Run: streamlit run app/main_frontend.py"
