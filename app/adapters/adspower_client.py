"""AdsPower Local API client. Disabled by default."""
import json
import urllib.request
import urllib.parse
from typing import Optional

from app.database.db import get_setting


class AdsPowerClient:
    def __init__(self):
        self.base_url = get_setting("adspower_base_url", "http://local.adspower.net:50325")
        self.api_key = get_setting("adspower_api_key", "")
        self.version = get_setting("adspower_api_version", "v2")
        self.enabled = get_setting("adspower_enabled", "false") == "true"

    def _get(self, path: str, params: dict = None) -> dict:
        if not self.enabled:
            return {"code": -1, "msg": "AdsPower disabled"}
        p = params or {}
        if self.api_key:
            p["serial_number"] = self.api_key
        query = urllib.parse.urlencode(p)
        url = f"{self.base_url}{path}?{query}"
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read())
        except Exception as e:
            return {"code": -1, "msg": str(e)}

    def health_check(self) -> dict:
        result = self._get(f"/api/{self.version}/user/list", {"page": 1, "page_size": 1})
        if result.get("code") == 0:
            return {"status": "connected", "msg": "OK"}
        return {"status": "disconnected", "msg": result.get("msg", "Unknown error")}

    def list_profiles(self, page: int = 1, page_size: int = 50) -> list:
        result = self._get(f"/api/{self.version}/user/list", {"page": page, "page_size": page_size})
        if result.get("code") == 0:
            return result.get("data", {}).get("list", [])
        return []

    def get_profile(self, user_id: str) -> Optional[dict]:
        result = self._get(f"/api/{self.version}/user/list", {"user_id": user_id})
        if result.get("code") == 0:
            profiles = result.get("data", {}).get("list", [])
            return profiles[0] if profiles else None
        return None

    def open_profile(self, user_id: str) -> dict:
        if not self.enabled:
            return {"success": False, "msg": "AdsPower disabled"}
        result = self._get(f"/api/{self.version}/browser/start", {"user_id": user_id})
        success = result.get("code") == 0
        return {"success": success, "msg": result.get("msg", ""), "data": result.get("data", {})}

    def close_profile(self, user_id: str) -> dict:
        if not self.enabled:
            return {"success": False, "msg": "AdsPower disabled"}
        result = self._get(f"/api/{self.version}/browser/stop", {"user_id": user_id})
        success = result.get("code") == 0
        return {"success": success, "msg": result.get("msg", "")}
