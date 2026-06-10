# Trello Integration Architecture

## Overview

Trello is used as an optional **external task board** — not as a data source.
The SDR database remains the source of truth.
Trello receives a projection of lead status and approval tasks.

---

## Board Template Design

Each workspace gets one Trello board named: `[Workspace Name] — SDR Pipeline`

### Default Lists (columns)
| List Name | Maps To |
|---|---|
| 🆕 New Leads | status = New |
| 🔍 Under Review | status = Reviewed |
| ✅ Approved | status = Approved |
| 📤 Contacted | status = Contacted |
| 💬 Replied | status = Replied |
| 🌟 Interested | status = Interested |
| 📅 Call Booked | status = Call Booked |
| 🚫 Not Relevant | status = Not Relevant |
| ⛔ Do Not Contact | status = Do Not Contact |

### Optional Second Board: `[Workspace] — Approval Queue`
Used for drafts pending approval:
| List Name | Maps To |
|---|---|
| ⏳ Pending Approval | outreach_drafts.status = pending |
| ✅ Approved Drafts | outreach_drafts.status = approved |
| ❌ Rejected | outreach_drafts.status = rejected |

---

## Card Mapping

### Lead Card
Each lead maps to exactly one Trello card in the pipeline board.

| Trello Card Field | Source |
|---|---|
| Card name | `[Business Name] — [City, Country]` |
| Description | Lead summary from AI profile (if exists) |
| Label color | Niche (green=wedding, blue=photo, yellow=studio, purple=content) |
| Due date | Next action date (from approval next_action field) |
| Custom field: Score | lead_score |
| Custom field: Channel | best_channel |
| Custom field: Lead ID | leads.id (for sync reference) |
| Checklist: Outreach | One item per approved draft |

### Sync Direction
**One-way: SDR → Trello**
The SDR database is the source of truth.
Changes in Trello do NOT write back to SDR (Phase 2 may add webhook callbacks).

---

## What Stays Inside SDR (Never Goes to Trello)

| Data | Reason |
|---|---|
| Email addresses | Privacy — Trello is a third-party cloud service |
| Phone numbers | Privacy |
| Raw outreach draft content | Sensitive — full text stays in SDR only |
| AI analysis details | Internal |
| AdsPower profile IDs | Security |
| API keys / settings | Security — never leaves the system |
| Activity log details | Internal audit |
| Compliance notes (DNC, opt-out) | Legal / GDPR |

---

## What Goes to Trello

| Data | Notes |
|---|---|
| Business name | Public-safe |
| City / Country | Public-safe |
| Niche label | Public-safe |
| Lead score | Aggregate, not personal data |
| Pipeline status | Workflow state |
| Next action date | Task management |
| Approved draft indicator (checkbox) | Status only, not content |

---

## Sync Workflow

```
User clicks "Sync to Trello" (manual trigger in Phase 2)
  OR
Approval is saved (automatic trigger, optional setting)

→ SDR backend calls Trello API
→ Find existing card by custom field Lead ID
  → If found: update list position + description + due date
  → If not found: create new card in correct list
→ Log sync event to activities table
```

---

## Data Architecture for Trello Sync

### New Table: trello_configs (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK | |
| trello_token | TEXT ENCRYPTED | OAuth token |
| pipeline_board_id | TEXT | Trello board ID |
| approval_board_id | TEXT | nullable |
| list_map | JSON | status → list_id mapping |
| auto_sync_on_approval | BOOLEAN | default false |
| last_sync_at | DATETIME | |

### New Table: trello_card_refs (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK | |
| lead_id | INTEGER/UUID FK | |
| trello_card_id | TEXT | |
| board_id | TEXT | |
| last_synced_at | DATETIME | |

---

## Future Automation Flow (Phase 3+)

Phase 3 may add Trello → SDR callbacks via Trello webhooks:
- Card moved to "Replied" in Trello → updates lead status in SDR
- Due date set in Trello → creates activity reminder in SDR
- Card archived in Trello → marks lead as Not Relevant in SDR

These are optional and require explicit user consent per workspace.

---

## Phase 1 Notes

Phase 1 (Local SDR Mini) does not include Trello integration.
The database schema for trello_configs and trello_card_refs is defined here
and will be added as a migration when Phase 2 builds the Trello module.
