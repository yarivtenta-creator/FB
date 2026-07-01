"""
Scripto Service — multilingual outreach draft generation.
"""
from app.database.db import get_conn, rows_to_list
from app.services.lead_service import get_lead
from app.services.outreach_service import save_draft, get_drafts
from app.agents.outreach_draft_agent import generate as agent_generate
from app.agents.lead_profile_agent import get_profile
from app.services.activity_service import log_activity


SUPPORTED_LANGUAGES = ["en", "it", "fr", "de", "es", "pt", "nl"]

COUNTRY_LANG_MAP = {
    "italy": "it", "italia": "it",
    "france": "fr",
    "germany": "de", "deutschland": "de",
    "spain": "es", "españa": "es",
    "portugal": "pt",
    "netherlands": "nl", "holland": "nl",
    "usa": "en", "uk": "en", "australia": "en",
    "canada": "en",
}


def detect_language(lead: dict) -> str:
    """Detect language from lead fields. Heuristic: check lead.language, then country."""
    lang = (lead.get("language") or "").strip().lower()
    if lang and lang in SUPPORTED_LANGUAGES:
        return lang

    # Try country
    country = (lead.get("country") or "").strip().lower()
    for key, code in COUNTRY_LANG_MAP.items():
        if key in country:
            return code

    return "en"


def generate_localized_draft(lead_id: int, channel: str, tone: str, language_code: str = None) -> dict:
    """Generate a draft for a lead in the given language. Saves to DB."""
    lead = get_lead(lead_id)
    if not lead:
        return {"success": False, "error": f"Lead {lead_id} not found"}

    if not language_code:
        language_code = detect_language(lead)

    profile = get_profile(lead_id)

    # Build a language-aware lead dict for the agent
    lead_with_lang = dict(lead)
    lead_with_lang["language"] = language_code

    try:
        content = agent_generate(lead_with_lang, profile, channel, tone)
    except Exception as e:
        return {"success": False, "error": str(e)}

    draft_id = save_draft(lead_id, channel, tone, content)

    # Store language_code on the draft
    try:
        with get_conn() as conn:
            conn.execute(
                "UPDATE outreach_drafts SET language_code = ? WHERE id = ?",
                (language_code, draft_id),
            )
    except Exception:
        pass  # language_code column may not exist in older schemas — non-fatal

    log_activity(
        "scripto_draft_generated",
        {"channel": channel, "tone": tone, "language": language_code},
        lead_id,
    )

    return {
        "success": True,
        "draft_id": draft_id,
        "language_code": language_code,
        "content": content,
        "channel": channel,
        "tone": tone,
        "lead_id": lead_id,
    }


def get_scripto_history(lead_id: int) -> list:
    """Return all drafts for a lead, including language_code."""
    try:
        drafts = get_drafts(lead_id=lead_id)
        # Enrich with language_code if available
        try:
            with get_conn() as conn:
                rows = conn.execute(
                    "SELECT id, language_code FROM outreach_drafts WHERE lead_id = ?",
                    (lead_id,),
                ).fetchall()
            lang_map = {r["id"]: r["language_code"] for r in rows}
            for d in drafts:
                d["language_code"] = lang_map.get(d["id"]) or d.get("language_code") or "en"
        except Exception:
            for d in drafts:
                if "language_code" not in d:
                    d["language_code"] = "en"
        return drafts
    except Exception:
        return []
