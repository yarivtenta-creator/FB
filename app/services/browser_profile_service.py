from app.database.db import get_conn, rows_to_list, row_to_dict
from app.services.activity_service import log_activity
from app.adapters.adspower_client import AdsPowerClient


def attach_profile(lead_id: int, adspower_profile_id: str, profile_name: str = "") -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO browser_profiles (lead_id, adspower_profile_id, profile_name) VALUES (?, ?, ?)",
            (lead_id, adspower_profile_id, profile_name),
        )
        bp_id = cur.lastrowid
    log_activity("browser_profile_attached", {"profile_id": adspower_profile_id}, lead_id)
    return bp_id


def get_profiles_for_lead(lead_id: int) -> list:
    with get_conn() as conn:
        return rows_to_list(conn.execute(
            "SELECT * FROM browser_profiles WHERE lead_id = ?", (lead_id,)
        ).fetchall())


def detach_profile(bp_id: int) -> bool:
    with get_conn() as conn:
        conn.execute("DELETE FROM browser_profiles WHERE id = ?", (bp_id,))
    return True


def open_lead_profile(lead_id: int, adspower_profile_id: str) -> dict:
    client = AdsPowerClient()
    result = client.open_profile(adspower_profile_id)
    log_activity("browser_profile_opened", {"profile_id": adspower_profile_id, "result": result}, lead_id)
    return result


def close_lead_profile(lead_id: int, adspower_profile_id: str) -> dict:
    client = AdsPowerClient()
    result = client.close_profile(adspower_profile_id)
    log_activity("browser_profile_closed", {"profile_id": adspower_profile_id, "result": result}, lead_id)
    return result
