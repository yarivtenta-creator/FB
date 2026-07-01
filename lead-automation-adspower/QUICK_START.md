# QUICK START — EDIT VALUE LOCAL SDR MINI

## 3-command install

```bash
pip install -r requirements.txt
cp .env.example .env
streamlit run app/main_frontend.py
```

Open: **http://localhost:8501**

---

## Windows 3-command install

```bat
pip install -r requirements.txt
copy .env.example .env
streamlit run app/main_frontend.py
```

---

## Or use the launcher scripts

**Windows:** double-click `run_local.bat`  
**Mac/Linux:** run `./run_local.sh`

---

## What happens on first run

1. Browser opens at http://localhost:8501
2. Setup Wizard appears (6 steps)
3. Enter your company name and preferences
4. Dashboard loads with 12 demo leads

---

## Key pages

| Page | What it does |
|---|---|
| Dashboard | Pipeline stats, charts, recent activity |
| Leads | View, add, import, search all leads |
| Content Analysis | Paste a URL or text to analyse a lead's content |
| Outreach Drafts | Generate AI drafts (9 variants per lead) |
| Approval Queue | Review and approve drafts before sending |
| Scripto | Generate multilingual drafts (EN/IT/FR/DE) |
| Trello | Sync pipeline to Trello board |
| AdsPower | Manage browser profiles per lead |
| Settings | Configure AI, language, Trello, AdsPower |

---

## Add your first real lead

1. Go to **Leads** → **Add Lead**
2. Fill in business name, niche, country
3. Click **Save**
4. Click **View** on the lead → **AI Profile** tab → **Analyse Lead**
