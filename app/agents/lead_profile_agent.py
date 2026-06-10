import json
from pathlib import Path
from app.adapters.ai_client import call_ai
from app.database.db import get_conn, row_to_dict


PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "lead_profile_prompt.md"


def _load_prompt() -> str:
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text()
    return "Analyze this lead and return a JSON profile."


def analyze_lead(lead: dict) -> dict:
    system = _load_prompt()
    prompt = f"""Analyze this lead and return a JSON profile:

Business: {lead.get('business_name')}
Contact: {lead.get('contact_name')}
Niche: {lead.get('niche')}
Country: {lead.get('country')} / City: {lead.get('city')}
Website: {lead.get('website_url')}
Instagram: {lead.get('instagram_url')}
Email: {lead.get('email')}
Notes: {lead.get('notes')}

Return JSON with: summary, service_type, opportunities (list), pain_points (list), score (0-100), recommended_channel (email/dm/comment)
"""
    response = call_ai(prompt, system)
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(response[start:end])
    except Exception:
        pass
    return {
        "summary": response[:300],
        "service_type": lead.get("niche", ""),
        "opportunities": [],
        "pain_points": [],
        "score": 50,
        "recommended_channel": "email",
    }


def save_profile(lead_id: int, profile: dict) -> int:
    with get_conn() as conn:
        conn.execute("DELETE FROM lead_profiles WHERE lead_id = ?", (lead_id,))
        cur = conn.execute(
            """INSERT INTO lead_profiles
               (lead_id, summary, service_type, opportunities, pain_points, score, recommended_channel)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                lead_id,
                profile.get("summary", ""),
                profile.get("service_type", ""),
                json.dumps(profile.get("opportunities", [])),
                json.dumps(profile.get("pain_points", [])),
                profile.get("score", 0),
                profile.get("recommended_channel", "email"),
            ),
        )
        return cur.lastrowid


def get_profile(lead_id: int) -> dict:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM lead_profiles WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1",
            (lead_id,),
        ).fetchone()
        if not row:
            return None
        p = dict(row)
        for field in ("opportunities", "pain_points"):
            try:
                p[field] = json.loads(p[field]) if p[field] else []
            except Exception:
                p[field] = []
        return p
