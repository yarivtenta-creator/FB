"""
Phase 1 stub. Always permits all operations.
Phase 2: replace with real limit checks against subscriptions + usage_records tables.
"""


def can_create_lead(workspace_id=None) -> bool:
    return True


def can_generate_draft(workspace_id=None) -> bool:
    return True


def can_invite_user(workspace_id=None) -> bool:
    return True


def get_plan_limits(workspace_id=None) -> dict:
    return {"leads": -1, "drafts": -1, "seats": -1}  # -1 = unlimited


def increment_usage(workspace_id=None, metric: str = "", count: int = 1):
    pass  # Phase 2: write to usage_records table
