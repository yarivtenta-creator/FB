# Project Plan: EDIT VALUE LOCAL SDR MINI

## Vision
A local-first lead management system for wedding videographers, creative studios, photographers, and content creators. Runs entirely on the user's machine. No cloud dependencies required.

## Goals
1. Store and manage leads with full lifecycle tracking
2. Analyze lead content (website, social, text)
3. Generate personalized outreach drafts via local AI
4. Manage approval workflow before any outreach
5. Track all activities per lead
6. Optionally integrate with AdsPower for browser profile management

## Non-Goals
- SaaS / multi-tenant
- Automated sending of messages
- External CRM sync
- Real-time scraping

## Target Users
Solo operators and small teams managing outreach to creative businesses.

## Success Criteria
- App launches with `streamlit run app/main.py`
- Leads can be added, edited, imported, exported
- AI analysis runs locally (mock or Ollama)
- Approval queue is functional
- AdsPower can be connected (optional)
- All activity is logged

## Timeline
Single autonomous build session — all phases completed before delivery.
