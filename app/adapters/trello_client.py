"""
Trello API client.
Disabled by default (trello_enabled=false in settings).
All methods fail gracefully when disabled or unreachable.
"""
import requests
from app.database.db import get_setting

TRELLO_BASE = "https://api.trello.com/1"


class TrelloClient:
    def __init__(self):
        self._enabled = get_setting("trello_enabled", "false").lower() == "true"
        self._api_key = get_setting("trello_api_key", "")
        self._token = get_setting("trello_token", "")
        self._board_id = get_setting("trello_board_id", "")

    def _auth(self) -> dict:
        return {"key": self._api_key, "token": self._token}

    def _get(self, path: str, extra_params: dict = None) -> dict | list | None:
        if not self._enabled or not self._api_key or not self._token:
            return None
        params = {**self._auth(), **(extra_params or {})}
        try:
            r = requests.get(f"{TRELLO_BASE}{path}", params=params, timeout=5)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        return None

    def _post(self, path: str, data: dict = None) -> dict | None:
        if not self._enabled or not self._api_key or not self._token:
            return None
        try:
            r = requests.post(
                f"{TRELLO_BASE}{path}",
                params=self._auth(),
                json=data or {},
                timeout=5,
            )
            if r.status_code in (200, 201):
                return r.json()
        except Exception:
            pass
        return None

    def _put(self, path: str, data: dict = None) -> dict | None:
        if not self._enabled or not self._api_key or not self._token:
            return None
        try:
            r = requests.put(
                f"{TRELLO_BASE}{path}",
                params=self._auth(),
                json=data or {},
                timeout=5,
            )
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        return None

    def health_check(self) -> dict:
        if not self._enabled:
            return {"status": "disabled", "message": "Trello integration is disabled"}
        if not self._api_key or not self._token:
            return {"status": "misconfigured", "message": "API key or token not set"}
        result = self._get("/members/me")
        if result:
            return {"status": "connected", "message": f"Connected as {result.get('fullName', 'unknown')}"}
        return {"status": "disconnected", "message": "Cannot reach Trello API"}

    def get_boards(self) -> list:
        result = self._get("/members/me/boards", {"fields": "id,name,url"})
        return result if isinstance(result, list) else []

    def get_lists(self, board_id: str) -> list:
        result = self._get(f"/boards/{board_id}/lists", {"fields": "id,name"})
        return result if isinstance(result, list) else []

    def create_card(self, list_id: str, name: str, desc: str = "", due: str = None) -> dict:
        data = {"idList": list_id, "name": name, "desc": desc}
        if due:
            data["due"] = due
        result = self._post("/cards", data)
        return result or {}

    def update_card(self, card_id: str, list_id: str = None, name: str = None) -> dict:
        data = {}
        if list_id:
            data["idList"] = list_id
        if name:
            data["name"] = name
        result = self._put(f"/cards/{card_id}", data)
        return result or {}

    def find_card_by_lead_id(self, board_id: str, lead_id: int) -> dict | None:
        """Search for a card whose description contains lead_id marker."""
        lists = self.get_lists(board_id)
        for lst in lists:
            cards = self._get(f"/lists/{lst['id']}/cards", {"fields": "id,name,desc"})
            if not cards:
                continue
            for card in cards:
                if f"lead_id:{lead_id}" in (card.get("desc") or ""):
                    return card
        return None
