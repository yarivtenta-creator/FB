# FIRST RUN GUIDE — EDIT VALUE LOCAL SDR MINI

This guide walks you through your first session after installing the app.

---

## Step 1 — Launch the app

```
streamlit run app/main_frontend.py
```

Your browser opens at `http://localhost:8501`.

---

## Step 2 — Setup Wizard (first run only)

The Setup Wizard appears automatically. Complete all 6 steps:

**Step 1 — Welcome**
Read the overview. Click **Get Started**.

**Step 2 — Workspace Details**
- Enter your company or personal name
- Select your country
- Select your default outreach language

**Step 3 — AI Provider**
- Leave as **Mock AI** for now (no setup required)
- You can switch to Ollama later in Settings if you have it installed

**Step 4 — AdsPower**
- Leave disabled unless you have AdsPower installed
- Can be enabled later in Settings

**Step 5 — Trello**
- Leave disabled unless you have a Trello account
- Requires a Trello API Key and Token (free from trello.com/app-key)

**Step 6 — Done**
Click **Launch Dashboard**.

---

## Step 3 — Explore the demo data

The dashboard loads with 12 demo leads from 4 countries (Italy, France, Germany, UK/US).

- **Dashboard**: See pipeline stats and a lead growth chart
- **Leads**: Browse all 12 demo leads with search and filters
- **Lead Detail**: Click any lead's **View** button to see the full detail page

---

## Step 4 — Import your own leads

Go to **Leads** → **Import CSV**.

CSV format required:
```
business_name,contact_name,email,niche,country,city,language,website_url,notes
Golden Hour Films,Sarah Chen,sarah@...,Wedding Videographer,USA,Austin,en,,
```

---

## Step 5 — Analyse a lead

1. Go to **Leads** → click **View** on any lead
2. Click the **AI Profile** tab
3. Click **Analyse Lead**
4. The AI generates: summary, service type, opportunities, pain points, score, recommended channel

---

## Step 6 — Generate outreach drafts

1. Go to **Outreach Drafts** → select a lead
2. Choose channel (Email / DM / Comment) and tone (Soft / Direct / Professional)
3. Click **Generate Draft**
4. The draft appears in the preview panel

Or use **Scripto** for multilingual drafts (EN/IT/FR/DE automatically detected from lead country).

---

## Step 7 — Approve a draft

1. Go to **Approval Queue**
2. Find the draft you generated
3. Read the draft — edit inline if needed
4. Click **Approve** or **Reject**
5. Approved drafts are flagged for sending (manual send required)

---

## Step 8 — Configure real integrations (optional)

### Ollama (local AI)
1. Install Ollama from https://ollama.ai
2. Run: `ollama pull llama3.2`
3. Go to **Settings** → **AI Engine** → click **Use Ollama**

### Trello
1. Get free API Key from https://trello.com/app-key
2. Go to **Trello** → **Setup** tab
3. Enter API Key, Token, and Board ID
4. Click **Save** then **Test Connection**
5. Enable the toggle and click **Sync Now**

### AdsPower
1. Install AdsPower from https://www.adspower.com
2. Open AdsPower — it starts a local server at port 50325
3. Go to **Settings** → set `ADSPOWER_ENABLED=true` in .env
4. Restart the app — AdsPower tab becomes active

---

## Where your data is stored

All data is saved to: `data/sdr.db` (SQLite, in the project folder)

Back up this file to preserve your leads, drafts, and approvals.
