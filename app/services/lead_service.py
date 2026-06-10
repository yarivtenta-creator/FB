import csv
import io
from typing import Optional, List
from app.database.db import get_conn, rows_to_list, row_to_dict
from app.services.activity_service import log_activity

PIPELINE_STATUSES = [
    "New", "Reviewed", "Approved", "Contacted", "Replied",
    "Interested", "Call Booked", "Not Relevant", "Do Not Contact"
]

NICHE_OPTIONS = ["wedding_video", "photography", "studio", "content_creator", "other"]

LEAD_FIELDS = [
    "business_name", "contact_name", "niche", "country", "city", "language",
    "website_url", "instagram_url", "facebook_url", "vimeo_url",
    "email", "phone", "source", "status", "lead_score", "best_channel", "notes",
]


def get_all_leads(status: str = None, niche: str = None, search: str = None) -> list:
    with get_conn() as conn:
        query = "SELECT * FROM leads WHERE 1=1"
        params = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if niche:
            query += " AND niche = ?"
            params.append(niche)
        if search:
            query += " AND (business_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        query += " ORDER BY created_at DESC"
        return rows_to_list(conn.execute(query, params).fetchall())


def get_lead(lead_id: int) -> Optional[dict]:
    with get_conn() as conn:
        return row_to_dict(conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone())


def create_lead(data: dict) -> int:
    fields = [f for f in LEAD_FIELDS if f in data]
    placeholders = ", ".join(["?" for _ in fields])
    cols = ", ".join(fields)
    values = [data[f] for f in fields]
    with get_conn() as conn:
        cur = conn.execute(
            f"INSERT INTO leads ({cols}) VALUES ({placeholders})", values
        )
        lead_id = cur.lastrowid
    log_activity("lead_created", {"business_name": data.get("business_name")}, lead_id)
    return lead_id


def update_lead(lead_id: int, data: dict) -> bool:
    fields = [f for f in LEAD_FIELDS if f in data]
    if not fields:
        return False
    sets = ", ".join([f"{f} = ?" for f in fields])
    values = [data[f] for f in fields] + [lead_id]
    with get_conn() as conn:
        conn.execute(
            f"UPDATE leads SET {sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values
        )
    log_activity("lead_updated", {"fields": fields}, lead_id)
    return True


def delete_lead(lead_id: int) -> bool:
    lead = get_lead(lead_id)
    if not lead:
        return False
    with get_conn() as conn:
        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    log_activity("lead_deleted", {"business_name": lead.get("business_name")})
    return True


def get_lead_stats() -> dict:
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) as c FROM leads").fetchone()["c"]
        by_status = conn.execute(
            "SELECT status, COUNT(*) as c FROM leads GROUP BY status"
        ).fetchall()
        pending_drafts = conn.execute(
            "SELECT COUNT(*) as c FROM outreach_drafts WHERE status = 'pending'"
        ).fetchone()["c"]
        return {
            "total": total,
            "by_status": {r["status"]: r["c"] for r in by_status},
            "pending_drafts": pending_drafts,
        }


def import_leads_csv(csv_text: str) -> dict:
    reader = csv.DictReader(io.StringIO(csv_text))
    imported = 0
    skipped = 0
    errors = []
    for i, row in enumerate(reader, 1):
        try:
            if not row.get("business_name"):
                skipped += 1
                continue
            existing = _find_duplicate(row)
            if existing:
                skipped += 1
                continue
            data = {k: v for k, v in row.items() if k in LEAD_FIELDS and v}
            if "status" not in data:
                data["status"] = "New"
            if "source" not in data:
                data["source"] = "csv"
            create_lead(data)
            imported += 1
        except Exception as e:
            errors.append(f"Row {i}: {e}")
    log_activity("csv_import", {"imported": imported, "skipped": skipped})
    return {"imported": imported, "skipped": skipped, "errors": errors}


def _find_duplicate(row: dict) -> Optional[dict]:
    with get_conn() as conn:
        if row.get("email"):
            r = conn.execute("SELECT id FROM leads WHERE email = ?", (row["email"],)).fetchone()
            if r:
                return row_to_dict(r)
        r = conn.execute(
            "SELECT id FROM leads WHERE business_name = ? AND city = ?",
            (row.get("business_name"), row.get("city")),
        ).fetchone()
        return row_to_dict(r) if r else None


def export_leads_csv(leads: list) -> str:
    if not leads:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=LEAD_FIELDS + ["id", "created_at", "updated_at"])
    writer.writeheader()
    for lead in leads:
        writer.writerow({k: lead.get(k, "") for k in LEAD_FIELDS + ["id", "created_at", "updated_at"]})
    return output.getvalue()
