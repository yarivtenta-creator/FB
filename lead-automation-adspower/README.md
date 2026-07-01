# EDIT VALUE LOCAL SDR MINI

A **local-first** lead management system for wedding videographers, creative studios, photographers, and content creators.

## Features

- **Lead Management**: Add, edit, delete, import/export leads with full pipeline tracking
- **AI Analysis**: Local AI (mock or Ollama) generates lead profiles, content analysis, and outreach drafts
- **Approval Queue**: Review and approve drafts before any outreach, with compliance tracking
- **Activity Log**: All actions logged per lead
- **AdsPower Integration**: Optional browser profile management (manual only, no automation)
- **Export**: CSV export for leads and approved drafts

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env
streamlit run app/main.py
```

Open [http://localhost:8501](http://localhost:8501)

## Optional: Enable Ollama AI

```bash
ollama pull llama3.2
# Edit .env: AI_MODE=ollama
```

## Optional: Enable AdsPower

Edit `.env` or use Settings page in the app:
```
ADSPOWER_ENABLED=true
ADSPOWER_API_KEY=your_key_here
```

## Pipeline Statuses

New → Reviewed → Approved → Contacted → Replied → Interested → Call Booked → Not Relevant / Do Not Contact

## Stack

- Python + Streamlit
- SQLite (local file: `data/sdr.db`)
- Mock AI (default) or Ollama
- AdsPower Local API (optional)
