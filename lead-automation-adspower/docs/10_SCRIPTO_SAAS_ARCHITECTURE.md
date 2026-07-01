# Scripto SaaS Platform — Architecture Overview

## Product Vision

Scripto is the SaaS evolution of Edit Value Local SDR Mini.
It transforms a single-user local outreach tool into a multi-tenant,
team-based SDR platform for creative industry agencies and studios.

Target users:
- Solo operators (Phase 1 carry-over)
- Small agencies (2–10 seats)
- Mid-size studios managing multiple clients (10–50 seats)
- Outreach agencies running campaigns for creative businesses

---

## Phase 1 → Phase 2 Migration Path

### What stays the same (reuse)
| Component | Phase 1 | Phase 2 |
|---|---|---|
| Lead data model | Local SQLite | PostgreSQL per workspace |
| Agent logic | Python functions | Same functions, tenant-aware |
| Approval workflow | Single-user | Multi-user, role-gated |
| Outreach drafts | Local | Workspace-scoped |
| AdsPower integration | Local API | Same adapter, per-workspace config |
| Prompt templates | Markdown files | DB-stored, per-workspace override |

### What changes
| Concern | Phase 1 | Phase 2 |
|---|---|---|
| Storage | SQLite file | PostgreSQL + Redis |
| Auth | None | JWT + OAuth (Google, email) |
| Multi-tenancy | None | Workspace isolation |
| Billing | None | Stripe subscriptions |
| Deployment | Local | Docker + cloud |
| UI | Streamlit | React or Next.js frontend + FastAPI |
| Trello | None | Per-workspace board sync |
| Languages | English only | EN / IT / FR / DE |

### Migration strategy
1. Extract all business logic from Streamlit pages into pure service functions (already done in Phase 1)
2. Wrap services in a FastAPI layer (thin API, same functions underneath)
3. Add workspace_id foreign key to all tables
4. Replace SQLite with PostgreSQL (schema is compatible, only type adjustments needed)
5. Add auth middleware
6. Build new frontend (React) consuming the API
7. The Streamlit app can remain as a "local mode" offering (free tier equivalent)

---

## SaaS Boundaries

### What Scripto IS
- Lead management workspace per organization
- AI-assisted outreach drafting
- Approval and compliance workflow
- Trello sync for task management
- Multi-language output generation
- AdsPower profile coordination (manual)

### What Scripto is NOT
- Email sending platform (no SMTP bulk sending)
- Social media automation
- Scraping service
- CRM replacement (HubSpot/Salesforce)
- Booking system

---

## Core Domain Models

### Tenant
The top-level billing and isolation unit.
One tenant = one paying organization.
A tenant owns one or more workspaces.

### Workspace
The operational unit. All lead data, drafts, approvals, and settings
are scoped to a workspace. Most users interact with exactly one workspace.

### Organization
A client of the tenant — the business being managed.
A workspace may manage outreach for multiple organizations.

### Client (Organization Contact)
A contact record within an organization.
May map to one or more leads.

### User
A person with login access.
Belongs to one tenant.
May have access to one or more workspaces.
Has a role per workspace.

---

## SaaS Feature Tiers (future billing)

| Feature | Free/Local | Starter | Pro | Agency |
|---|---|---|---|---|
| Workspaces | 1 | 1 | 3 | Unlimited |
| Leads | 100 | 500 | 5,000 | Unlimited |
| AI drafts/month | 20 | 200 | 2,000 | Unlimited |
| Team seats | 1 | 2 | 10 | Unlimited |
| Trello sync | No | Yes | Yes | Yes |
| Languages | EN | EN | EN/IT/FR/DE | All |
| AdsPower | Yes | Yes | Yes | Yes |
| Custom prompts | No | No | Yes | Yes |
| Priority support | No | No | Yes | Yes |
