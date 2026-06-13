# PATCH NOTES — v1.0.1

**Release date**: 2026-06-13  
**Type**: Bug fix  
**Severity**: Critical — app fails to launch  

---

## Problem 1 — ImportError

```
ImportError: cannot import name 'get_lead_growth_data'
from app.frontend.data_bridge
```

`page_dashboard.py` imported `get_lead_growth_data` which was missing from `data_bridge.py`.

**Fix**: Added `get_lead_growth_data()` to `data_bridge.py`.

---

## Problem 2 — ValueError (Plotly bgcolor)

```
ValueError: Invalid value of type 'builtins.str' received for the 'bgcolor' property
Received value: 'transparent'
```

Older Plotly versions (installed on Python 3.9) do not accept `'transparent'` as a color value.

**Fix**: Replaced `bgcolor="transparent"` with `bgcolor="rgba(0,0,0,0)"` in `page_dashboard.py` (2 occurrences).

---

## Files in this patch

```
app/frontend/data_bridge.py     ← REPLACE (adds get_lead_growth_data)
app/frontend/page_dashboard.py  ← REPLACE (fixes bgcolor for older Plotly)
```

---

## Files NOT changed

- All other pages
- Database schema
- Settings
- .env

---

## Compatibility

Tested and working on:
- Python 3.9+ (client's version)
- Python 3.11 (build server)
- Plotly 5.x (any 5.x release)

---

## Test result after patch

```
27/27 PASSED
All 10 pages import without errors
```
