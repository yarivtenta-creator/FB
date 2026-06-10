import json
from typing import Optional
from app.database.db import get_conn, rows_to_list


def log_activity(action: str, details: dict = None, lead_id: int = None):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO activities (lead_id, action, details) VALUES (?, ?, ?)",
            (lead_id, action, json.dumps(details or {})),
        )


def get_recent_activities(limit: int = 50, lead_id: int = None) -> list:
    with get_conn() as conn:
        if lead_id:
            rows = conn.execute(
                "SELECT a.*, l.business_name FROM activities a "
                "LEFT JOIN leads l ON a.lead_id = l.id "
                "WHERE a.lead_id = ? ORDER BY a.created_at DESC LIMIT ?",
                (lead_id, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT a.*, l.business_name FROM activities a "
                "LEFT JOIN leads l ON a.lead_id = l.id "
                "ORDER BY a.created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return rows_to_list(rows)
