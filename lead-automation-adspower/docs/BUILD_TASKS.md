# Build Tasks

## COMMANDER
- Scope: Integration, config, seed data, final assembly
- Owned: main.py, config/, .env.example, requirements.txt
- Dependencies: All workers
- Tests: App startup, config loading
- Completion: App launches and navigates all pages

## WORKER_1_CORE
- Scope: DB, dashboard, navigation, activity log, settings
- Owned: database/, pages/dashboard.py, pages/adspower_settings.py, services/activity_service.py
- Dependencies: None
- Tests: DB init, dashboard loads
- Completion: App starts, dashboard shows KPIs

## WORKER_2_LEADS
- Scope: Lead CRUD, CSV, deduplication, lead detail, notes
- Owned: pages/leads.py, pages/lead_detail.py, services/lead_service.py
- Dependencies: WORKER_1_CORE
- Tests: Add/edit/delete lead, CSV import/export
- Completion: Full lead workflow

## WORKER_3_AI
- Scope: AI client, agents, content analysis, drafts, approval queue
- Owned: adapters/ai_client.py, agents/, services/outreach_service.py, services/approval_service.py, pages/content_analysis.py, pages/outreach_drafts.py, pages/approval_queue.py
- Dependencies: WORKER_1_CORE, WORKER_2_LEADS
- Tests: Mock AI, draft generation, approval workflow
- Completion: Full AI workflow

## WORKER_4_ADSPOWER
- Scope: AdsPower client, browser profile service, settings UI integration
- Owned: adapters/adspower_client.py, services/browser_profile_service.py
- Dependencies: WORKER_1_CORE
- Tests: Disabled mode, connection failure
- Completion: AdsPower connector operational
