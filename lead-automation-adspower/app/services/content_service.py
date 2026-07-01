import json
from app.database.db import get_conn, rows_to_list, row_to_dict
from app.services.activity_service import log_activity


def save_content_item(lead_id: int, content_type: str, raw_content: str, analysis: dict = None) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO content_items (lead_id, content_type, raw_content, analysis) VALUES (?, ?, ?, ?)",
            (lead_id, content_type, raw_content, json.dumps(analysis or {})),
        )
        item_id = cur.lastrowid
    log_activity("content_added", {"type": content_type}, lead_id)
    return item_id


def get_content_items(lead_id: int) -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM content_items WHERE lead_id = ? ORDER BY created_at DESC",
            (lead_id,),
        ).fetchall()
    items = rows_to_list(rows)
    for item in items:
        if item.get("analysis"):
            try:
                item["analysis"] = json.loads(item["analysis"])
            except Exception:
                pass
    return items


def delete_content_item(item_id: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM content_items WHERE id = ?", (item_id,))
    return True
