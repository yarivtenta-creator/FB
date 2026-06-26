# SYSTEM MAP — PROJECT 770 Marketing AI Growth OS
## Build: 18-Worker Parallel Build (2026-06-26)

## Architecture
- **Entry point:** server.js (port 6500)
- **Stack:** Pure Node.js, zero npm dependencies, offline-by-default
- **Data:** File-based JSON in /crm/ and /outputs/
- **AI:** Optional — set ANTHROPIC_API_KEY in .env for live generation

## Canonical Intake (25 fields)
`company, industry, country, website, offer, price_point, social_accounts, brand_assets, past_campaigns, content_library, email_list_size, monthly_traffic, monthly_leads, monthly_sales, conversion_rate, cac, revenue_sources, target_audience, pain_points, buying_triggers, competitors, revenue_goal, lead_goal, growth_target, roas_target`

**Required:** company, industry, country, offer, target_audience, revenue_goal

## Key Routes
| Route | Method | Description |
|---|---|---|
| / | GET | Dashboard (dashboard/index.html) |
| /api/health | GET | System health check |
| /api/deliverables/generate | POST | Generate all deliverables from discovery |
| /api/discovery/save | POST | Save intake data |
| /api/lead/upload-csv | POST | Import leads from CSV |
| /api/marketing-plan | GET | Get latest marketing plan |
| /api/modules/run | POST | Run any intelligence module |
| /api/pipeline | POST | Pipeline stage actions |
| /api/ai/status | GET | AI layer status |

## Flow
Discovery Intake → Intake Validation Gate → Deliverables (26 docs) → Marketing Plan → CRM Pipeline (qualify→diagnostics→proposal→produce→deliver→revenue)

## Workers Applied (2026-06-26)
- Worker 01: Pipeline repair — stuck task timeout/reset (runtime/pipeline_repair.js)
- Worker 02: Canonical intake verification — normalizeDisc() synonyms confirmed
- Worker 03: CSV import — fromCSV() handles all 25 fields
- Worker 04: Marketing plan generator — FIXED target_audience bug + removed Israel hardcode
- Worker 05: Scorecard — runtime/engines.js verified
- Worker 06: Deliverables — engine.js uses canonical fields, 26 slots confirmed
- Worker 07: Intelligence — 535 modules confirmed, runtime/intelligence.js verified
- Worker 08: n8n Knowledge — capability index created
- Worker 09: Skills — runtime/skills.js connection confirmed
- Worker 10: Dashboard — dashboard/index.html synced (47KB)
- Worker 11: Task repair — tools/repair_tasks.js CLI created
- Worker 12: Testing — tests/intake_canonical_tests.js added (14 canonical tests)
- Worker 13: Registry validation — all registries synced, no duplicate IDs
- Worker 14: Output quality — deliverables engine uses real intake data, no generic placeholders
- Worker 15: Workflow matching — single workflow ACTIVE, playbooks route matching confirmed
- Worker 16: Knowledge base — knowledge/index.js searchable index created
- Worker 17: Documentation — this file updated
- Worker 18: Final audit — SOFTWARE_UPDATE_vNEXT.md generated

## Known Issues (tracked)
1. server.js /api/run still has hardcoded DJ defaults — low priority (test-only endpoint)
2. tests/run_tests.js test 5 uses country: 'Israel' — acceptable for test fixture, note added
