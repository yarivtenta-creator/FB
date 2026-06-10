# ZIP CONTENTS TREE — EDIT VALUE LOCAL SDR MINI

**File**: `dist/edit-value-sdr-mini-v1.0.0.zip`  
**Total files**: 111  
**Compressed size**: ~130K  
**Build date**: 2026-06-10  
**Builder**: `python build_release.py`  

---

## Directory Structure

```
edit-value-sdr-mini-v1.0.0.zip
│
├── .env.example                         ← Environment config template
├── CUSTOMER_README.md                   ← Customer-facing install guide + FAQ
├── README.md                            ← Project overview
├── requirements.txt                     ← Python dependencies (5 packages)
├── install.bat                          ← Windows one-click installer
├── install.sh                           ← Mac/Linux one-click installer
├── run_local.bat                        ← Windows launcher
├── run_local.sh                         ← Mac/Linux launcher
├── backup.bat                           ← Windows backup script
├── backup.sh                            ← Mac/Linux backup script
│
├── app/
│   ├── __init__.py
│   ├── main.py                          ← Legacy entry point
│   ├── main_frontend.py                 ← PRIMARY entry point (use this)
│   │
│   ├── adapters/
│   │   ├── __init__.py
│   │   ├── ai_client.py                 ← Mock AI + Ollama adapter
│   │   ├── adspower_client.py           ← AdsPower Local API adapter
│   │   └── trello_client.py             ← Trello REST API adapter
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── approval_crm_agent.py        ← Compliance check + next action
│   │   ├── content_analysis_agent.py    ← Website/social content analysis
│   │   ├── lead_profile_agent.py        ← AI lead profile generation
│   │   └── outreach_draft_agent.py      ← Outreach draft generation
│   │
│   ├── assets/
│   │   └── logo.svg                     ← App logo
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   ├── db.py                        ← SQLite connection + init + settings
│   │   └── schema.sql                   ← 8-table schema with indexes
│   │
│   ├── frontend/
│   │   ├── __init__.py
│   │   ├── data_bridge.py               ← SQLite ↔ Streamlit connector
│   │   ├── mock_data.py                 ← Demo seed data (12 leads, etc.)
│   │   ├── sidebar.py                   ← Navigation sidebar
│   │   ├── theme.py                     ← Dark theme CSS (~350 lines)
│   │   ├── page_setup_wizard.py         ← 6-step first-run wizard
│   │   ├── page_dashboard.py            ← Dashboard with Plotly charts
│   │   ├── page_leads.py                ← Lead table + search + filters
│   │   ├── page_lead_detail.py          ← Lead detail (6 tabs)
│   │   ├── page_content_analysis.py     ← Content paste/screenshot analysis
│   │   ├── page_outreach_drafts.py      ← 9-variant draft generation
│   │   ├── page_approval_queue.py       ← Approval workflow + compliance
│   │   ├── page_scripto.py              ← Multilingual draft generation
│   │   ├── page_trello.py               ← Trello sync management
│   │   ├── page_adspower.py             ← AdsPower browser profile mgmt
│   │   └── page_settings.py            ← App settings (5 tabs)
│   │
│   ├── pages/                           ← Legacy page stubs (kept for compat)
│   │   ├── __init__.py
│   │   ├── adspower_settings.py
│   │   ├── approval_queue.py
│   │   ├── content_analysis.py
│   │   ├── dashboard.py
│   │   ├── export.py
│   │   ├── lead_detail.py
│   │   ├── leads.py
│   │   └── outreach_drafts.py
│   │
│   ├── prompts/
│   │   ├── compliance_check_prompt.md
│   │   ├── content_analysis_prompt.md
│   │   ├── lead_profile_prompt.md
│   │   ├── outreach_draft_prompt.md     ← English prompt
│   │   ├── outreach_draft_prompt_de.md  ← German prompt
│   │   ├── outreach_draft_prompt_fr.md  ← French prompt
│   │   └── outreach_draft_prompt_it.md  ← Italian prompt
│   │
│   ├── screenshots/                     ← Live app screenshots (10 pages)
│   │   ├── 01_dashboard.png
│   │   ├── 02_leads.png
│   │   ├── 03_lead_detail.png
│   │   ├── 04_content_analysis.png
│   │   ├── 05_outreach_drafts.png
│   │   ├── 06_approval_queue.png
│   │   ├── 07_scripto.png
│   │   ├── 08_trello.png
│   │   ├── 09_adspower.png
│   │   └── 10_settings.png
│   │
│   └── services/
│       ├── __init__.py
│       ├── activity_service.py          ← Activity audit log
│       ├── approval_service.py          ← Draft approval workflow
│       ├── browser_profile_service.py   ← AdsPower profile linkage
│       ├── content_service.py           ← Content storage + retrieval
│       ├── lead_service.py              ← Lead CRUD + CSV import/export
│       ├── outreach_service.py          ← Draft CRUD
│       ├── plan_enforcer.py             ← Phase gate stub
│       ├── scripto_service.py           ← Multilingual draft generation
│       └── trello_service.py            ← Trello sync (privacy-safe)
│
├── config/
│   ├── adspower.config.json             ← AdsPower config defaults
│   └── app.config.json                  ← App config defaults
│
├── docs/                                ← Architecture + completion docs
│   ├── 01_PROJECT_PLAN.md
│   ├── 02_SYSTEM_ARCHITECTURE.md
│   ├── 03_DATABASE_SCHEMA.md
│   ├── 04_UI_SCREENS.md
│   ├── 05_AGENT_SPEC.md
│   ├── 06_ADSPOWER_INTEGRATION_PLAN.md
│   ├── 07_BUILD_ORDER.md
│   ├── 08_INSTALLATION_PLAN.md
│   ├── 09_RISKS_AND_ASSUMPTIONS.md
│   ├── 10_SCRIPTO_SAAS_ARCHITECTURE.md
│   ├── 11_MULTI_TENANT_DESIGN.md
│   ├── 12_USER_ROLES_AND_PERMISSIONS.md
│   ├── 13_TRELLO_INTEGRATION_ARCHITECTURE.md
│   ├── 14_MULTILINGUAL_SYSTEM.md
│   ├── 15_DEPLOYMENT_ARCHITECTURE.md
│   ├── 16_BILLING_READY_ARCHITECTURE.md
│   ├── 17_ACCEPTANCE_CRITERIA.md
│   ├── 18_REVIEW_GATES.md
│   ├── 19_GITHUB_WORKFLOW.md
│   ├── 20_ARCHITECTURE_AUDIT.md
│   ├── ADSPOWER_INTEGRATION.md
│   ├── AGENTS.md
│   ├── BRANDING_ASSETS.md
│   ├── BUILD_TASKS.md
│   ├── FINAL_COMPLETION_REPORT.md
│   ├── INTEGRATION_STATUS_REPORT.md
│   ├── LOCAL_SETUP.md
│   ├── REFERENCES_REVIEW.md
│   ├── SECRETS_SCAN_REPORT.md
│   └── TEST_REPORT.md
│
└── tests/
    ├── __init__.py
    ├── test_app.py                      ← 21 unit + integration tests
    └── test_install.py                  ← 6 install + clean-env tests

```

---

## Excluded from ZIP (by build_release.py)

```
data/           — SQLite database (created on first run)
.env            — User's local secrets (never shipped)
__pycache__/    — Python bytecode
*.pyc           — Compiled bytecode
.git/           — Version control history
.claude/        — Development tooling
dist/           — Build output directory itself
*.log           — Log files
app/exports/*   — User CSV exports
app/imports/*   — User CSV imports
backups/*       — User database backups
```

---

## Customer-required files verification

| File | Purpose | Present |
|---|---|---|
| requirements.txt | Dependency install | YES |
| .env.example | Config template | YES |
| install.bat | Windows installer | YES |
| install.sh | Mac/Linux installer | YES |
| run_local.bat | Windows launcher | YES |
| run_local.sh | Mac/Linux launcher | YES |
| CUSTOMER_README.md | Install guide + FAQ | YES |
| app/main_frontend.py | App entry point | YES |
| app/database/schema.sql | DB schema | YES |
