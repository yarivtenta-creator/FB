import json
from app.adapters.ai_client import call_ai


def check_compliance(lead: dict, draft_content: str) -> dict:
    prompt = f"""Check this outreach draft for compliance issues:

Lead: {lead.get('business_name')} ({lead.get('country')})
Draft:
{draft_content[:1000]}

Return JSON with: safe (bool), warnings (list of strings)
Focus on: spam signals, aggressive language, false claims, privacy concerns.
"""
    response = call_ai(prompt, "compliance check")
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(response[start:end])
    except Exception:
        pass
    return {"safe": True, "warnings": []}


def suggest_next_action(lead: dict, approval: dict) -> str:
    status = lead.get("status", "New")
    channel = approval.get("channel", "email")
    suggestions = {
        "New": f"Schedule initial {channel} outreach",
        "Reviewed": f"Send approved {channel} message",
        "Approved": f"Send via {channel} within 24h",
        "Contacted": "Follow up in 3-5 days if no reply",
        "Replied": "Schedule discovery call",
        "Interested": "Book 30-minute call",
        "Call Booked": "Prepare proposal",
    }
    return suggestions.get(status, "Review lead status and plan next step")
