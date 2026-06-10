# Multi-Tenant Design

## Isolation Model

Scripto uses **shared database, tenant-scoped rows** isolation.
Every table that holds business data includes a `workspace_id` foreign key.
Queries always filter by workspace_id enforced at the service layer.

This model is chosen because:
- It simplifies schema management (one migration = all tenants)
- It is sufficient for the user scale projected (< 10,000 workspaces initially)
- It can be migrated to schema-per-tenant or DB-per-tenant later with pg_partitioning

---

## Entity Hierarchy

```
Tenant (billing unit)
└── Workspace (operational unit, 1 or more per tenant)
    ├── Users (members with roles)
    ├── Settings (API keys, AdsPower, AI mode)
    ├── Leads
    │   ├── Lead Profiles (AI)
    │   ├── Content Items
    │   ├── Outreach Drafts
    │   ├── Approvals
    │   ├── Browser Profiles
    │   └── Activities
    ├── Organizations (clients being targeted)
    └── Trello Config (optional)
```

---

## Table: tenants
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT | Company name |
| slug | TEXT UNIQUE | URL-safe identifier |
| plan | TEXT | free/starter/pro/agency |
| billing_email | TEXT | |
| stripe_customer_id | TEXT | nullable |
| created_at | DATETIME | |
| is_active | BOOLEAN | |

## Table: workspaces
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| name | TEXT | |
| slug | TEXT | Unique within tenant |
| default_language | TEXT | en/it/fr/de |
| timezone | TEXT | IANA tz |
| ai_mode | TEXT | mock/ollama/openai |
| created_at | DATETIME | |
| is_active | BOOLEAN | |

## Table: workspace_members
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK | |
| user_id | UUID FK | |
| role | TEXT | super_admin/admin/manager/operator/viewer |
| invited_at | DATETIME | |
| accepted_at | DATETIME | nullable |
| is_active | BOOLEAN | |

## Table: organizations (clients)
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK | |
| name | TEXT | |
| website | TEXT | |
| country | TEXT | |
| industry | TEXT | |
| notes | TEXT | |
| created_at | DATETIME | |

All existing Phase 1 tables gain `workspace_id UUID FK NOT NULL` in Phase 2.

---

## Data Isolation Rules

1. **Service layer** always receives `workspace_id` from authenticated session context
2. **Every query** appends `AND workspace_id = $workspace_id`
3. **No cross-workspace queries** except for Super Admin reporting views
4. **File uploads** stored in `/{workspace_id}/screenshots/` path prefix
5. **Settings** are workspace-scoped (API keys are never shared across workspaces)
6. **Trello tokens** stored encrypted, per workspace

---

## Lead Ownership

In Phase 1: leads belong to the single user's local database.

In Phase 2:
- Leads belong to the **workspace**
- Each lead has `created_by_user_id` (audit)
- Each lead has `assigned_to_user_id` (optional — for team assignment)
- Approval decisions record `decided_by_user_id`
- All activities record `user_id`

---

## Security Boundaries

| Boundary | Enforcement |
|---|---|
| Tenant isolation | workspace_id on all queries |
| API auth | JWT with workspace_id claim |
| File access | Signed URLs with workspace prefix check |
| Settings | Never exposed in API responses for other workspaces |
| Billing data | Stripe webhooks, never in workspace DB |
| AdsPower API key | Stored encrypted (AES-256), decrypted only server-side |

---

## Future Scaling Model

Phase A (current): Single PostgreSQL instance, row-level isolation
Phase B (1,000+ tenants): Read replicas, connection pooling (PgBouncer)
Phase C (10,000+ tenants): Schema-per-tenant partitioning or Citus distributed tables
Phase D (enterprise): Dedicated DB instances available as premium option
