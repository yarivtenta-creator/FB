import json
from app.database.db import get_conn, rows_to_list, row_to_dict
from app.services.activity_service import log_activity
from app.services.outreach_service import update_draft


def approve_draft(draft_id: int, lead_id: int, edited_content: str = None,
                  next_action: str = None, opt_out: bool = False,
                  do_not_contact: bool = False, lawful_basis_note: str = "",
                  first_contact_notice_status: str = "pending") -> int:
    update_draft(draft_id, content=edited_content, status="approved")
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO approvals
               (draft_id, lead_id, decision, edited_content, next_action,
                opt_out, do_not_contact, lawful_basis_note, first_contact_notice_status)
               VALUES (?, ?, 'approved', ?, ?, ?, ?, ?, ?)""",
            (draft_id, lead_id, edited_content, next_action,
             1 if opt_out else 0, 1 if do_not_contact else 0,
             lawful_basis_note, first_contact_notice_status),
        )
        approval_id = cur.lastrowid
    log_activity("draft_approved", {"draft_id": draft_id, "next_action": next_action}, lead_id)
    return approval_id


def reject_draft(draft_id: int, lead_id: int, reason: str = "") -> int:
    update_draft(draft_id, status="rejected")
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO approvals (draft_id, lead_id, decision, next_action) VALUES (?, ?, 'rejected', ?)",
            (draft_id, lead_id, reason),
        )
        approval_id = cur.lastrowid
    log_activity("draft_rejected", {"draft_id": draft_id, "reason": reason}, lead_id)
    return approval_id


def get_pending_approvals() -> list:
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT d.*, l.business_name, l.contact_name, l.email
               FROM outreach_drafts d
               JOIN leads l ON d.lead_id = l.id
               WHERE d.status = 'pending'
               ORDER BY d.created_at ASC"""
        ).fetchall()
        return rows_to_list(rows)


def get_approval_history(lead_id: int = None) -> list:
    with get_conn() as conn:
        query = """
            SELECT a.*, d.channel, d.tone, d.content, l.business_name
            FROM approvals a
            JOIN outreach_drafts d ON a.draft_id = d.id
            JOIN leads l ON a.lead_id = l.id
            WHERE 1=1
        """
        params = []
        if lead_id:
            query += " AND a.lead_id = ?"
            params.append(lead_id)
        query += " ORDER BY a.decided_at DESC"
        return rows_to_list(conn.execute(query, params).fetchall())
