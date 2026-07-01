# Local Setup Guide

## Prerequisites
- Python 3.10 or higher
- pip

## Installation

```bash
git clone <repo_url>
cd edit-value-local-sdr
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
streamlit run app/main.py
```

Windows: double-click `run_local.bat`

## Configuration

Edit `.env`:

```env
AI_MODE=mock          # mock or ollama
OLLAMA_MODEL=llama3.2 # used when AI_MODE=ollama
ADSPOWER_ENABLED=false
```

## Data Location

Database: `data/sdr.db` (created automatically on first run)

## Reset Data

Delete `data/sdr.db` and restart the app. Seed data will reload.
