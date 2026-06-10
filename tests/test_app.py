"""Test suite for EDIT VALUE LOCAL SDR MINI."""
import sys
import os
import json
import tempfile

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

# Use temp DB for tests
os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test_sdr.db")


def test_db_init():
    from app.database.db import init_db
    init_db()
    assert os.path.exists(os.environ["DB_PATH"])


def test_create_lead():
    from app.database.db import init_db
    from app.services.lead_service import create_lead, get_lead
    init_db()
    lead_id = create_lead({
        "business_name": "Test Studio",
        "contact_name": "Jane Doe",
        "niche": "wedding_video",
        "status": "New",
        "email": "jane@teststudio.com",
    })
    assert lead_id > 0
    lead = get_lead(lead_id)
    assert lead["business_name"] == "Test Studio"
    assert lead["email"] == "jane@teststudio.com"


def test_update_lead():
    from app.database.db import init_db
    from app.services.lead_service import create_lead, update_lead, get_lead
    init_db()
    lead_id = create_lead({"business_name": "Update Test", "status": "New"})
    update_lead(lead_id, {"status": "Reviewed", "lead_score": 75})
    lead = get_lead(lead_id)
    assert lead["status"] == "Reviewed"
    assert lead["lead_score"] == 75


def test_delete_lead():
    from app.database.db import init_db
    from app.services.lead_service import create_lead, delete_lead, get_lead
    init_db()
    lead_id = create_lead({"business_name": "Delete Test", "status": "New"})
    result = delete_lead(lead_id)
    assert result is True
    assert get_lead(lead_id) is None


def test_csv_import():
    from app.database.db import init_db
    from app.services.lead_service import import_leads_csv
    init_db()
    csv_data = "business_name,email,niche,country\nCSV Studio,csv@test.com,photography,USA\n"
    result = import_leads_csv(csv_data)
    assert result["imported"] == 1
    assert result["skipped"] == 0


def test_csv_deduplication():
    from app.database.db import init_db
    from app.services.lead_service import import_leads_csv
    init_db()
    csv_data = "business_name,email,niche,country\nDupe Studio,dupe@test.com,photography,USA\n"
    result1 = import_leads_csv(csv_data)
    result2 = import_leads_csv(csv_data)
    assert result1["imported"] == 1
    assert result2["skipped"] == 1


def test_csv_export():
    from app.database.db import init_db
    from app.services.lead_service import create_lead, get_all_leads, export_leads_csv
    init_db()
    create_lead({"business_name": "Export Test", "status": "New"})
    leads = get_all_leads()
    csv_out = export_leads_csv(leads)
    assert "business_name" in csv_out
    assert "Export Test" in csv_out


def test_lead_stats():
    from app.database.db import init_db
    from app.services.lead_service import create_lead, get_lead_stats
    init_db()
    create_lead({"business_name": "Stats Lead", "status": "New"})
    stats = get_lead_stats()
    assert stats["total"] >= 1
    assert "New" in stats["by_status"]


def test_activity_log():
    from app.database.db import init_db
    from app.services.activity_service import log_activity, get_recent_activities
    init_db()
    log_activity("unique_test_action_xyz", {"key": "value"})
    acts = get_recent_activities(200)
    assert any(a["action"] == "unique_test_action_xyz" for a in acts)


def test_mock_ai_lead_profile():
    from app.adapters.ai_client import _mock_response
    response = _mock_response("analyze this lead profile")
    data = json.loads(response)
    assert "summary" in data
    assert "score" in data
    assert "recommended_channel" in data


def test_mock_ai_outreach():
    from app.adapters.ai_client import _mock_response
    response = _mock_response("generate an outreach draft email")
    assert len(response) > 10


def test_lead_profile_agent():
    from app.database.db import init_db
    from app.services.lead_service import create_lead
    from app.agents.lead_profile_agent import analyze_lead, save_profile, get_profile
    init_db()
    lead_id = create_lead({
        "business_name": "Profile Test Studio",
        "niche": "wedding_video",
        "status": "New",
    })
    lead = {"id": lead_id, "business_name": "Profile Test Studio", "niche": "wedding_video",
            "contact_name": "", "country": "", "city": "", "website_url": "", "instagram_url": "",
            "email": "", "notes": ""}
    profile = analyze_lead(lead)
    assert "score" in profile
    save_profile(lead_id, profile)
    saved = get_profile(lead_id)
    assert saved is not None
    assert saved["lead_id"] == lead_id


def test_draft_workflow():
    from app.database.db import init_db
    from app.services.lead_service import create_lead
    from app.services.outreach_service import save_draft, get_drafts, update_draft
    init_db()
    lead_id = create_lead({"business_name": "Draft Test", "status": "New"})
    draft_id = save_draft(lead_id, "email", "professional", "Test draft content")
    drafts = get_drafts(lead_id=lead_id)
    assert len(drafts) >= 1
    assert drafts[0]["content"] == "Test draft content"
    update_draft(draft_id, status="approved")
    drafts_updated = get_drafts(lead_id=lead_id, status="approved")
    assert any(d["id"] == draft_id for d in drafts_updated)


def test_approval_workflow():
    from app.database.db import init_db
    from app.services.lead_service import create_lead
    from app.services.outreach_service import save_draft
    from app.services.approval_service import approve_draft, get_approval_history
    init_db()
    lead_id = create_lead({"business_name": "Approval Test", "status": "New"})
    draft_id = save_draft(lead_id, "email", "soft", "Approval test draft")
    approval_id = approve_draft(
        draft_id=draft_id, lead_id=lead_id,
        edited_content="Edited content", next_action="Send tomorrow"
    )
    assert approval_id > 0
    history = get_approval_history(lead_id=lead_id)
    assert len(history) >= 1
    assert history[0]["decision"] == "approved"


def test_adspower_disabled_mode():
    from app.adapters.adspower_client import AdsPowerClient
    os.environ.get("DB_PATH")
    from app.database.db import init_db, set_setting
    init_db()
    set_setting("adspower_enabled", "false")
    client = AdsPowerClient()
    result = client.health_check()
    assert result["status"] == "disconnected"
    profiles = client.list_profiles()
    assert profiles == []


def test_adspower_connection_failure():
    from app.database.db import init_db, set_setting
    init_db()
    set_setting("adspower_enabled", "true")
    set_setting("adspower_base_url", "http://localhost:99999")
    from app.adapters.adspower_client import AdsPowerClient
    client = AdsPowerClient()
    result = client.health_check()
    assert result["status"] == "disconnected"


def test_content_analysis_agent():
    from app.agents.content_analysis_agent import analyze_text
    result = analyze_text("We are a wedding photography studio based in New York.", "website")
    assert isinstance(result, dict)
    assert "key_themes" in result or "raw" in result


def test_settings():
    from app.database.db import init_db, get_setting, set_setting
    init_db()
    set_setting("test_key", "test_value")
    assert get_setting("test_key") == "test_value"


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
