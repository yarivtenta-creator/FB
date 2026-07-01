# TEST REPORT — EDIT VALUE LOCAL SDR MINI

**Run Date**: 2026-06-10  
**Branch**: claude/gifted-babbage-cekfrh  
**Runner**: pytest 9.0.3 / Python 3.11.15  

---

## Result: 27/27 PASSED

```
tests/test_app.py::test_db_init PASSED
tests/test_app.py::test_create_lead PASSED
tests/test_app.py::test_update_lead PASSED
tests/test_app.py::test_delete_lead PASSED
tests/test_app.py::test_csv_import PASSED
tests/test_app.py::test_csv_deduplication PASSED
tests/test_app.py::test_csv_export PASSED
tests/test_app.py::test_lead_stats PASSED
tests/test_app.py::test_activity_log PASSED
tests/test_app.py::test_mock_ai_lead_profile PASSED
tests/test_app.py::test_mock_ai_outreach PASSED
tests/test_app.py::test_lead_profile_agent PASSED
tests/test_app.py::test_draft_workflow PASSED
tests/test_app.py::test_approval_workflow PASSED
tests/test_app.py::test_adspower_disabled_mode PASSED
tests/test_app.py::test_adspower_connection_failure PASSED
tests/test_app.py::test_content_analysis_agent PASSED
tests/test_app.py::test_settings PASSED
tests/test_app.py::test_content_service PASSED
tests/test_app.py::test_full_workflow_integration PASSED
tests/test_app.py::test_plan_enforcer_stub PASSED
tests/test_install.py::test_fresh_install PASSED
tests/test_install.py::test_settings_defaults PASSED
tests/test_install.py::test_build_release PASSED
tests/test_install.py::test_data_bridge PASSED
tests/test_install.py::test_trello_disabled PASSED
tests/test_install.py::test_wizard_detection PASSED

27 passed in 0.95s
```

---

## Coverage by Area

| Area | Tests | Status |
|---|---|---|
| Database init | test_db_init | PASSED |
| Lead CRUD | test_create_lead, test_update_lead, test_delete_lead | PASSED |
| CSV import/export | test_csv_import, test_csv_deduplication, test_csv_export | PASSED |
| Lead stats | test_lead_stats | PASSED |
| Activity logging | test_activity_log | PASSED |
| Mock AI | test_mock_ai_lead_profile, test_mock_ai_outreach | PASSED |
| Lead profile agent | test_lead_profile_agent | PASSED |
| Draft workflow | test_draft_workflow | PASSED |
| Approval workflow | test_approval_workflow | PASSED |
| AdsPower (disabled) | test_adspower_disabled_mode, test_adspower_connection_failure | PASSED |
| Content analysis | test_content_analysis_agent | PASSED |
| Settings | test_settings | PASSED |
| Content service | test_content_service | PASSED |
| Full integration | test_full_workflow_integration | PASSED |
| Plan enforcer | test_plan_enforcer_stub | PASSED |
| Fresh install | test_fresh_install | PASSED |
| Settings defaults | test_settings_defaults | PASSED |
| Release build | test_build_release | PASSED |
| Data bridge | test_data_bridge | PASSED |
| Trello disabled | test_trello_disabled | PASSED |
| Wizard detection | test_wizard_detection | PASSED |

---

## Failures

None.
