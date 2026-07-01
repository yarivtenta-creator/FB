# Edit Value — Local SDR Mini

## What This Product Does

Edit Value Local SDR Mini is an offline AI-powered Sales Development Representative (SDR) tool designed for creative businesses and video/photography studios.

It helps you:
- Manage a pipeline of potential clients (leads)
- Analyse their profiles using AI
- Generate personalised, multilingual outreach drafts (English, Italian, French, German)
- Review and approve drafts before sending
- Optionally sync your pipeline to Trello for team visibility
- Manage browser profiles via AdsPower for manual outreach

All data is stored locally in a SQLite database. Nothing is sent to external servers (except optional Trello/Ollama connections).

---

## System Requirements

- Python 3.10 or higher
- Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- 500 MB free disk space
- Internet connection only needed for: Trello sync, Ollama model downloads

---

## Install in 3 Steps

### Option A — Download ZIP

1. Download the release ZIP from the project page and unzip it.
2. Open a terminal in the project folder and run:
   - **Windows:** `install.bat`
   - **Mac/Linux:** `bash install.sh`
3. Launch the app:
   - **Windows:** `run_local.bat`
   - **Mac/Linux:** `bash run_local.sh`

### Option B — Git Clone

```bash
git clone <repo-url> edit-value-sdr-mini
cd edit-value-sdr-mini
pip install -r requirements.txt
streamlit run app/main_frontend.py
```

---

## First-Run Wizard

On first launch, a setup wizard will guide you through:

1. **Welcome** — what the app does
2. **Your Details** — workspace name, sender name, default language
3. **AI Engine** — choose Mock AI (instant) or Ollama (local LLM)
4. **AdsPower** — optional browser profile manager
5. **Trello** — optional pipeline sync
6. **Done** — review config and launch

You can change all settings later via the Settings page.

---

## Configuration Guide

### AI Engine

- **Mock AI** (default): Template-based responses. No setup needed. Great for demos.
- **Ollama**: Local LLM. Install Ollama from [ollama.com](https://ollama.com), pull a model (`ollama pull llama3.2`), then select Ollama in Settings.

### AdsPower

1. Install AdsPower desktop app
2. Enable AdsPower in Settings → AdsPower tab
3. Enter the base URL (default: `http://local.adspower.net:50325`)
4. Enter your API key from AdsPower → API Management

### Trello

1. Get your API key from [trello.com/app-key](https://trello.com/app-key)
2. Generate a token from the same page
3. Create a Trello board for your pipeline
4. Find the board ID from the board URL: `https://trello.com/b/<BOARD_ID>/...`
5. Enter all three in Settings → Trello tab or the Setup Wizard

---

## Quick Start: Add Your First Lead

1. Click **Leads** in the sidebar
2. Click **+ Add Lead**
3. Fill in: Business Name, Contact Name, Niche, Country, and Instagram/Website URL
4. Click **Save**
5. Go to **Lead Detail** → click **Run AI Analysis** to score the lead
6. Click **Generate Drafts** to create outreach messages
7. Review in **Approval Queue** and approve your favourite draft

---

## FAQ

**Q: Can I use this offline?**  
A: Yes, fully. Mock AI and all lead management works without internet.

**Q: Where is my data stored?**  
A: In `data/sdr.db` — a local SQLite file. Back it up with `backup.bat` / `backup.sh`.

**Q: How do I reset the setup wizard?**  
A: Go to Settings → System tab → Reset to Defaults. Or run `python -c "from app.database.db import set_setting; set_setting('setup_complete','false')"`.

**Q: Can I import leads from CSV?**  
A: Yes. Go to Leads → Import CSV. The file needs a `business_name` column.

**Q: What languages does Scripto support?**  
A: English, Italian, French, German (with Spanish and Portuguese detection).

**Q: Is my data shared with anyone?**  
A: No. All data stays on your machine. Trello sync only sends non-PII fields (business name, score, status — never email or phone).

**Q: How do I update the app?**  
A: Run `git pull` (if cloned) or download the latest ZIP and copy the `app/` folder.
