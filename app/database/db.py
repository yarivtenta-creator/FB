import sqlite3
import os
import json
from contextlib import contextmanager
from pathlib import Path

DB_PATH = os.environ.get("DB_PATH", str(Path(__file__).parent.parent.parent / "data" / "sdr.db"))
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def get_db_path() -> str:
    return DB_PATH


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())
    _seed_default_settings(conn)
    conn.commit()
    conn.close()


def _seed_default_settings(conn):
    defaults = {
        "adspower_enabled": "false",
        "adspower_base_url": "http://local.adspower.net:50325",
        "adspower_api_key": "",
        "adspower_api_version": "v2",
        "adspower_automation_allowed": "false",
        "ai_mode": "mock",
        "ollama_base_url": "http://localhost:11434",
        "ollama_model": "llama3.2",
    }
    for key, value in defaults.items():
        conn.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def row_to_dict(row) -> dict:
    if row is None:
        return None
    return dict(row)


def rows_to_list(rows) -> list:
    return [dict(r) for r in rows]


def get_setting(key: str, default: str = "") -> str:
    with get_conn() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default


def set_setting(key: str, value: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP",
            (key, value),
        )
