import json
from app.database.db import get_conn, rows_to_list, row_to_dict
from app.services.activity_service import log_activity


def save_draft(lead_id: int, channel: str, tone: str, content: str) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO outreach_drafts (lead_id, channel, tone, content, status) VALUES (?, ?, ?, ?, 'pending')",
            (lead_id, channel, tone, content),
        )
        draft_id = cur.lastrowid
    log_activity("draft_created", {"channel": channel, "tone": tone}, lead_id)
    return draft_id


def get_drafts(lead_id: int = None, status: str = None) -> list:
    with get_conn() as conn:
        query = """
            SELECT d.*, l.business_name, l.contact_name
            FROM outreach_drafts d
            JOIN leads l ON d.lead_id = l.id
            WHERE 1=1
        """
        params = []
        if lead_id:
            query += " AND d.lead_id = ?"
            params.append(lead_id)
        if status:
            query += " AND d.status = ?"
            params.append(status)
        query += " ORDER BY d.created_at DESC"
        return rows_to_list(conn.execute(query, params).fetchall())


def update_draft(draft_id: int, content: str = None, status: str = None) -> bool:
    updates = []
    values = []
    if content is not None:
        updates.append("content = ?")
        values.append(content)
    if status is not None:
        updates.append("status = ?")
        values.append(status)
    if not updates:
        return False
    updates.append("updated_at = CURRENT_TIMESTAMP")
    values.append(draft_id)
    with get_conn() as conn:
        conn.execute(f"UPDATE outreach_drafts SET {', '.join(updates)} WHERE id = ?", values)
    return True


def delete_draft(draft_id: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM outreach_drafts WHERE id = ?", (draft_id,))
    return True
