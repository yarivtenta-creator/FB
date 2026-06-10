"""
Data Bridge — connects frontend pages to real SQLite backend.
Falls back to seeding mock_data when DB is empty (first run / demo).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.db import init_db, get_setting, set_setting
from app.services.lead_service import get_all_leads, get_lead_stats, get_lead
from app.services.outreach_service import get_drafts
from app.services.activity_service import get_recent_activities
from app.services.approval_service import get_approval_history


def _ensure_db():
    """Make sure DB is initialised before any query."""
    try:
        init_db()
    except Exception:
        pass


def _seed_if_empty():
    """If the leads table is empty, insert mock leads so the app isn't blank."""
    from app.frontend.mock_data import LEADS, DRAFTS
    from app.services.lead_service import create_lead
    from app.services.outreach_service import save_draft as _save_draft
    from app.database.db import get_conn

    _ensure_db()
    try:
        with get_conn() as conn:
            count = conn.execute("SELECT COUNT(*) as c FROM leads").fetchone()["c"]
        if count == 0:
            id_map = {}
            for m in LEADS:
                data = {k: v for k, v in m.items() if k != "id"}
                new_id = create_lead(data)
                id_map[m["id"]] = new_id
            for d in DRAFTS:
                real_lead_id = id_map.get(d["lead_id"])
                if real_lead_id:
                    _save_draft(real_lead_id, d["channel"], d["tone"], d["content"])
    except Exception:
        pass


# ── Public API ──────────────────────────────────────────────────────────────

def get_leads(status=None, niche=None, search=None) -> list:
    _seed_if_empty()
    try:
        return get_all_leads(status=status, niche=niche, search=search)
    except Exception:
        from app.frontend.mock_data import LEADS
        return LEADS


def get_stats() -> dict:
    _seed_if_empty()
    try:
        raw = get_lead_stats()
        by_status = raw.get("by_status", {})
        contacted = sum(
            by_status.get(s, 0)
            for s in ["Contacted", "Replied", "Interested", "Call Booked"]
        )
        total = raw.get("total", 0)
        return {
            "total": total,
            "new": by_status.get("New", 0),
            "approved": by_status.get("Approved", 0),
            "contacted": by_status.get("Contacted", 0),
            "replied": by_status.get("Replied", 0),
            "interested": by_status.get("Interested", 0),
            "call_booked": by_status.get("Call Booked", 0),
            "pending_drafts": raw.get("pending_drafts", 0),
            "conversion_rate": round(contacted / total * 100) if total > 0 else 0,
            "by_status": by_status,
        }
    except Exception:
        from app.frontend.mock_data import get_pipeline_stats
        return get_pipeline_stats()


def get_activities(limit: int = 50, lead_id: int = None) -> list:
    _ensure_db()
    try:
        return get_recent_activities(limit=limit, lead_id=lead_id)
    except Exception:
        from app.frontend.mock_data import ACTIVITIES
        return ACTIVITIES


def get_lead_by_id(lead_id: int) -> dict:
    _ensure_db()
    try:
        return get_lead(lead_id)
    except Exception:
        return None


def get_outreach_drafts(lead_id: int = None, status: str = None) -> list:
    _ensure_db()
    try:
        return get_drafts(lead_id=lead_id, status=status)
    except Exception:
        from app.frontend.mock_data import DRAFTS
        return DRAFTS


def get_approval_list() -> list:
    _ensure_db()
    try:
        return get_approval_history()
    except Exception:
        from app.frontend.mock_data import APPROVALS
        return APPROVALS


def get_language_distribution() -> dict:
    leads = get_leads()
    dist = {}
    for lead in leads:
        lang = lead.get("language") or "en"
        dist[lang] = dist.get(lang, 0) + 1
    return dist


def get_pipeline_stats() -> dict:
    return get_stats()


def setting_get(key: str, default: str = "") -> str:
    _ensure_db()
    try:
        return get_setting(key, default)
    except Exception:
        return default


def setting_set(key: str, value: str):
    _ensure_db()
    try:
        set_setting(key, value)
    except Exception:
        pass
