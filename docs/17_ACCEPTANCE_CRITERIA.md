# Acceptance Criteria

## Module 1: Core System

### Success Criteria
- Application starts with `streamlit run app/main.py` without errors
- SQLite database created automatically on first run
- All 8 tables created with correct schema
- Default settings seeded (ai_mode=mock, adspower_enabled=false)
- Dashboard loads with KPI cards
- Sidebar navigation works for all pages
- Seed data loads on empty database (5 sample leads)

### Failure Criteria
- App fails to start
- Database not created
- Missing tables
- Dashboard shows Python errors
- Navigation does not switch pages

### Required Tests
- test_db_init
- test_dashboard_loads (Streamlit smoke test)
- test_settings_defaults

### Documentation Requirements
- README.md with launch instructions
- LOCAL_SETUP.md
- DATABASE_SCHEMA.md

### Completion Requirement
App launches, navigates all pages, shows seed data.

---

## Module 2: Lead Management

### Success Criteria
- Add lead via form with all required fields
- Edit lead with inline save
- Delete lead with confirmation dialog
- CSV import: valid rows imported, duplicates skipped
- CSV import: missing business_name rows skipped with count
- CSV export: all filtered leads exported with all fields
- Lead detail page shows all tabs
- Search filters leads correctly by name, email, business
- Status filter works
- Niche filter works
- Lead score saved and displayed

### Failure Criteria
- Cannot save lead without business_name
- Duplicate email leads to duplicate records (must deduplicate)
- CSV import crashes on malformed rows (must skip with error log)
- Delete without confirmation

### Required Tests
- test_create_lead
- test_update_lead
- test_delete_lead
- test_csv_import
- test_csv_deduplication
- test_csv_export
- test_lead_stats

### Completion Requirement
Full CRUD demonstrated. CSV round-trip verified.

---

## Module 3: AI System

### Success Criteria
- Mock AI returns structured JSON for all agent calls
- Lead profile generates summary, opportunities, pain points, score, channel
- Lead score updates on lead record after profile analysis
- Content analysis returns key_themes, tone, opportunities, pain_points
- Outreach draft generated for all 9 channel/tone combinations
- Draft saved to DB with correct lead_id, channel, tone
- Approval queue shows pending drafts
- Approve: sets status to approved, creates approval record
- Reject: sets status to rejected, creates approval record
- Compliance check returns safe/warnings
- Next action suggestion returned

### Failure Criteria
- AI call crashes app (must handle gracefully)
- Draft not saved to DB
- Approval not persisted
- Agent returns non-parseable response (must fall back gracefully)

### Required Tests
- test_mock_ai_lead_profile
- test_mock_ai_outreach
- test_lead_profile_agent
- test_draft_workflow
- test_approval_workflow
- test_content_analysis_agent

### Completion Requirement
Full AI workflow from analysis → draft → approval demonstrated in both mock and Ollama modes.

---

## Module 4: AdsPower Integration

### Success Criteria
- App starts with AdsPower disabled (no errors)
- Settings page shows enable/disable toggle
- Settings page shows connection test button
- Connection test returns clear connected/disconnected status
- When disabled: all AdsPower buttons shown as disabled or hidden
- When connection fails: error shown, no crash
- Profile open/close logged to activities
- Profile attach/detach works on lead detail page

### Failure Criteria
- App crashes when AdsPower is unreachable
- API key exposed in UI
- Automated actions triggered without user click
- Connection failure not communicated to user

### Required Tests
- test_adspower_disabled_mode
- test_adspower_connection_failure

### Completion Requirement
AdsPower disabled mode fully tested. Connected mode tested against mock server or real instance.

---

## Module 5: Trello Integration (Phase 2)

### Success Criteria
- Workspace can connect Trello via OAuth
- Board created from template on first sync
- Lead cards created in correct list on first sync
- Lead status change moves card to correct list
- Sync only pushes safe data (no emails, phones, draft content)
- All sync events logged to activities
- Trello token stored encrypted

### Failure Criteria
- Trello token in plaintext in DB
- Email or phone synced to Trello
- Draft content synced to Trello card
- Sync failure crashes approval workflow

### Required Tests
- test_trello_sync_lead
- test_trello_privacy_check (assert no PII in synced payload)
- test_trello_connection_failure

### Completion Requirement
End-to-end sync verified. Privacy audit passes.

---

## Module 6: Multi-Language (Phase 2)

### Success Criteria
- Lead with language=it generates Italian outreach draft
- Lead with language=fr generates French outreach draft
- Draft language matches lead language field
- Fallback to English if language not supported
- UI language switchable per user

### Required Tests
- test_draft_language_it
- test_draft_language_fr
- test_draft_language_fallback

---

## Module 7: Multi-Tenant (Phase 2)

### Success Criteria
- Workspace A cannot see Workspace B's leads
- Every query includes workspace_id filter
- New user registration creates tenant + workspace
- Invitation flow works correctly

### Required Tests
- test_workspace_isolation
- test_cross_workspace_access_denied
