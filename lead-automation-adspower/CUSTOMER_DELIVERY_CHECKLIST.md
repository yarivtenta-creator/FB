# CUSTOMER DELIVERY CHECKLIST — EDIT VALUE LOCAL SDR MINI

**Version**: 1.0.0  
**Date**: 2026-06-10  

Use this checklist to verify delivery and onboarding for each customer.

---

## A. Install

- [ ] Customer downloads ZIP: `edit-value-sdr-mini-v1.0.0.zip`
- [ ] Customer extracts ZIP to a local folder
- [ ] Python 3.11+ is installed on customer machine
- [ ] Customer opens terminal in project folder
- [ ] Customer runs: `pip install -r requirements.txt`
- [ ] No errors during install
- [ ] Refer to `INSTALLATION_GUIDE.md` if errors occur

---

## B. Launch

- [ ] Customer runs: `streamlit run app/main_frontend.py`
- [ ] (Windows alternative): double-click `run_local.bat`
- [ ] Browser opens at `http://localhost:8501`
- [ ] Setup Wizard appears on first load
- [ ] No import errors in terminal

---

## C. Configure (Setup Wizard)

- [ ] **Step 1 — Welcome**: customer reads intro, clicks Get Started
- [ ] **Step 2 — Workspace**: company name entered, country selected, language selected
- [ ] **Step 3 — AI Provider**: Mock AI selected (default) or Ollama if available
- [ ] **Step 4 — AdsPower**: skipped or configured with existing AdsPower install
- [ ] **Step 5 — Trello**: skipped or configured with Trello API Key + Token + Board ID
- [ ] **Step 6 — Done**: customer clicks Launch Dashboard
- [ ] Dashboard visible with demo leads

---

## D. Connect Services (optional — customer's choice)

### Ollama (local AI)
- [ ] Customer installs Ollama from https://ollama.ai
- [ ] Customer runs: `ollama pull llama3.2`
- [ ] Settings → AI Engine → click **Use Ollama** → Save
- [ ] Test button shows: "Ollama connected — llama3.2 available"

### Trello
- [ ] Customer gets API Key from https://trello.com/app-key
- [ ] Customer gets OAuth Token from same page
- [ ] Trello page → Setup tab → enter Key, Token, Board ID → Save
- [ ] **Test Connection** button shows: "Connected as [name]"
- [ ] Enable toggle → Save → Sync Now → cards appear in Trello

### AdsPower
- [ ] Customer installs AdsPower desktop app
- [ ] AdsPower is running (local API on port 50325)
- [ ] Edit `.env`: `ADSPOWER_ENABLED=true` → restart app
- [ ] AdsPower page → **Test Connection** → "Connected"

---

## E. Import Leads

- [ ] Customer prepares CSV with columns: `business_name, contact_name, email, niche, country, city, language, website_url`
- [ ] Leads page → Import CSV → paste or upload CSV
- [ ] Leads appear in table
- [ ] Deduplication works (re-import same file = no duplicates)

---

## F. Use Dashboard

- [ ] Dashboard shows correct total lead count
- [ ] Pipeline donut chart reflects actual lead statuses
- [ ] Lead growth bar chart shows imported leads
- [ ] Language distribution chart shows languages from imported leads
- [ ] Recent activity log updates when leads are added/changed

---

## G. Generate Drafts

### Via Outreach Drafts page
- [ ] Select a lead from dropdown
- [ ] Choose channel: Email / DM / Comment
- [ ] Choose tone: Soft / Direct / Professional
- [ ] Click **Generate Draft**
- [ ] Draft appears in preview
- [ ] Draft can be edited inline
- [ ] Draft appears in Approval Queue

### Via Scripto (multilingual)
- [ ] Select lead from dropdown
- [ ] Language auto-detected or manually selected
- [ ] Click **Generate Draft**
- [ ] Draft language matches lead language setting

---

## H. Export Data

- [ ] Leads page → **Export CSV** downloads all leads
- [ ] Approval Queue → approved drafts visible with copy button
- [ ] Settings → System → **Export All Leads** button
- [ ] Settings → System → **Export Approved Drafts** button
- [ ] Settings → System → **Backup Database** button

---

## I. Verify Security Defaults

- [ ] Trello integration shows "Disabled" on fresh install
- [ ] AdsPower integration shows "OFF" in sidebar
- [ ] No credentials pre-filled anywhere
- [ ] AI mode shows "MOCK" in sidebar
- [ ] No automatic connections to external services on startup

---

## J. Final Check

- [ ] App runs with no errors in terminal
- [ ] All 10 pages load without errors
- [ ] Setup Wizard does not reappear after completion
- [ ] Data persists after app restart (close and reopen)
- [ ] Customer has `CUSTOMER_README.md` for reference
- [ ] Customer has `TROUBLESHOOTING.md` for self-service support
