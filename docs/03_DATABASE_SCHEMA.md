# Database Schema

## leads
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| business_name | TEXT | |
| contact_name | TEXT | |
| niche | TEXT | wedding_video/photo/studio/content |
| country | TEXT | |
| city | TEXT | |
| language | TEXT | |
| website_url | TEXT | |
| instagram_url | TEXT | |
| facebook_url | TEXT | |
| vimeo_url | TEXT | |
| email | TEXT | |
| phone | TEXT | |
| source | TEXT | manual/csv/import |
| status | TEXT | New/Reviewed/Approved/Contacted/... |
| lead_score | INTEGER | 0-100 |
| best_channel | TEXT | email/dm/comment |
| notes | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

## lead_profiles
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| lead_id | INTEGER FK | |
| summary | TEXT | |
| service_type | TEXT | |
| opportunities | TEXT | JSON array |
| pain_points | TEXT | JSON array |
| score | INTEGER | |
| recommended_channel | TEXT | |
| created_at | DATETIME | |

## content_items
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| lead_id | INTEGER FK | |
| content_type | TEXT | website/instagram/text/screenshot |
| raw_content | TEXT | |
| analysis | TEXT | JSON |
| created_at | DATETIME | |

## outreach_drafts
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| lead_id | INTEGER FK | |
| channel | TEXT | email/dm/comment |
| tone | TEXT | soft/direct/professional |
| content | TEXT | |
| status | TEXT | pending/approved/rejected/sent |
| created_at | DATETIME | |
| updated_at | DATETIME | |

## approvals
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| draft_id | INTEGER FK | |
| lead_id | INTEGER FK | |
| decision | TEXT | approved/rejected |
| edited_content | TEXT | |
| next_action | TEXT | |
| opt_out | INTEGER | 0/1 |
| do_not_contact | INTEGER | 0/1 |
| lawful_basis_note | TEXT | |
| first_contact_notice_status | TEXT | |
| decided_at | DATETIME | |

## activities
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| lead_id | INTEGER FK nullable | |
| action | TEXT | |
| details | TEXT | JSON |
| created_at | DATETIME | |

## browser_profiles
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| lead_id | INTEGER FK | |
| adspower_profile_id | TEXT | |
| profile_name | TEXT | |
| created_at | DATETIME | |

## settings
| Field | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| key | TEXT UNIQUE | |
| value | TEXT | |
| updated_at | DATETIME | |
