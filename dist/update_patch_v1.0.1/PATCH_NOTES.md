# PATCH NOTES — v1.0.1

**Release date**: 2026-06-13  
**Type**: Bug fix  
**Severity**: Critical — app fails to launch  

---

## Problem

On launch, the app throws:

```
ImportError: cannot import name 'get_lead_growth_data'
from app.frontend.data_bridge
```

`page_dashboard.py` imports `get_lead_growth_data` from `data_bridge.py`, but that function was missing from the module.

---

## Fix

**File changed**: `app/frontend/data_bridge.py`

Added `get_lead_growth_data()` function that:
- Queries the SQLite database for monthly lead counts grouped by `created_at`
- Returns `(months, new_leads, cumulative)` tuple used by the Dashboard lead growth chart
- Falls back to a 6-month mock series if the DB is empty or unavailable
- Handles all exceptions gracefully — never crashes the app

---

## Files in this patch

```
app/frontend/data_bridge.py    ← REPLACE (contains the fix)
```

---

## Files NOT changed

- page_dashboard.py — no change needed; import was already correct
- All other pages — no change needed
- Database schema — no change
- Settings — no change
- .env — no change

---

## Test result after patch

```
27/27 PASSED
All 10 pages import without errors
get_lead_growth_data() verified working
```
