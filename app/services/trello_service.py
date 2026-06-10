"""
Trello Service — syncs leads to Trello.
Privacy: never sends email, phone, draft content, or compliance data.
All syncs are logged to the activities table.
"""
from app.adapters.trello_client import TrelloClient
from app.services.lead_service import get_all_leads, get_lead
from app.services.activity_service import log_activity
from app.database.db import get_setting

# Map pipeline status → Trello list name
STATUS_TO_LIST = {
    "New": "New Leads",
    "Reviewed": "Under Review",
    "Approved": "Approved",
    "Contacted": "Contacted",
    "Replied": "Replied",
    "Interested": "Interested",
    "Call Booked": "Call Booked",
    "Not Relevant": "Not Relevant",
    "Do Not Contact": "Do Not Contact",
}

# Fields safe to sync (no PII)
SAFE_FIELDS = ["id", "business_name", "niche", "city", "country", "status", "lead_score", "best_channel"]


def _safe_lead(lead: dict) -> dict:
    """Return only privacy-safe fields."""
    return {k: lead.get(k) for k in SAFE_FIELDS}


def _card_name(lead: dict) -> str:
    parts = [lead.get("business_name", "Unknown")]
    if lead.get("city"):
        parts.append(f"({lead['city']})")
    if lead.get("lead_score"):
        parts.append(f"[{lead['lead_score']}]")
    return " ".join(parts)


def _card_desc(lead: dict) -> str:
    safe = _safe_lead(lead)
    lines = [
        f"lead_id:{safe['id']}",
        f"Niche: {safe.get('niche', '')}",
        f"Location: {safe.get('city', '')}, {safe.get('country', '')}",
        f"Score: {safe.get('lead_score', '')}",
        f"Best Channel: {safe.get('best_channel', '')}",
        f"Status: {safe.get('status', '')}",
    ]
    return "\n".join(lines)


def get_sync_status() -> dict:
    client = TrelloClient()
    health = client.health_check()
    return {
        "enabled": get_setting("trello_enabled", "false").lower() == "true",
        "health": health,
        "board_id": get_setting("trello_board_id", ""),
    }


def sync_lead_to_trello(lead: dict) -> dict:
    """Sync a single lead to Trello. Returns result dict."""
    client = TrelloClient()
    health = client.health_check()
    if health["status"] not in ("connected",):
        return {"success": False, "reason": health["message"]}

    board_id = get_setting("trello_board_id", "")
    if not board_id:
        return {"success": False, "reason": "No board ID configured"}

    # Find matching list
    target_list_name = STATUS_TO_LIST.get(lead.get("status", "New"), "New Leads")
    lists = client.get_lists(board_id)
    target_list_id = None
    for lst in lists:
        if lst.get("name") == target_list_name:
            target_list_id = lst["id"]
            break

    if not target_list_id and lists:
        target_list_id = lists[0]["id"]

    if not target_list_id:
        return {"success": False, "reason": "No matching list found on Trello board"}

    lead_id = lead.get("id")
    existing_card = client.find_card_by_lead_id(board_id, lead_id)

    if existing_card:
        result = client.update_card(
            card_id=existing_card["id"],
            list_id=target_list_id,
            name=_card_name(lead),
        )
        action = "trello_card_updated"
    else:
        result = client.create_card(
            list_id=target_list_id,
            name=_card_name(lead),
            desc=_card_desc(lead),
        )
        action = "trello_card_created"

    if result:
        log_activity(action, {"trello_card_id": result.get("id"), "list": target_list_name}, lead_id)
        return {"success": True, "card_id": result.get("id"), "action": action}
    return {"success": False, "reason": "Trello API call failed"}


def sync_all_leads() -> dict:
    """Sync all leads to Trello. Returns summary dict."""
    leads = get_all_leads()
    count = 0
    errors = []
    for lead in leads:
        result = sync_lead_to_trello(lead)
        if result["success"]:
            count += 1
        else:
            errors.append({"lead": lead.get("business_name"), "error": result.get("reason")})
    return {"synced": count, "total": len(leads), "errors": errors}
