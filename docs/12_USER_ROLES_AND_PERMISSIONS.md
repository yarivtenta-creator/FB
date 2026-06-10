# User Roles and Permissions

## Role Definitions

### Super Admin
System-level administrator. Can access all tenants and workspaces.
Reserved for platform operators only. Not visible to workspace users.

### Workspace Admin
Full control over a single workspace.
Can manage users, billing, settings, and all data.
Typically the agency owner or team lead.

### Manager
Can manage leads, drafts, approvals, and view all data.
Cannot manage billing, workspace settings, or user accounts.
Typically a team lead or senior operator.

### Operator
Day-to-day user. Can create and edit leads and drafts.
Cannot approve their own drafts (requires Manager or above).
Cannot delete leads (requires Manager or above).
Typically an SDR, researcher, or copywriter.

### Viewer
Read-only access to leads, profiles, drafts, and approvals.
Cannot create, edit, or delete anything.
Suitable for clients, executives, or external reviewers.

---

## Permissions Matrix

| Permission | Super Admin | Workspace Admin | Manager | Operator | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| **LEADS** | | | | | |
| View leads | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit lead | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete lead | ✅ | ✅ | ✅ | ❌ | ❌ |
| Import CSV | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export CSV | ✅ | ✅ | ✅ | ✅ | ❌ |
| **AI & CONTENT** | | | | | |
| Run AI analysis | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add content item | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete content item | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate draft | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit draft | ✅ | ✅ | ✅ | ✅* | ❌ |
| Delete draft | ✅ | ✅ | ✅ | ❌ | ❌ |
| **APPROVALS** | | | | | |
| View approval queue | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve draft | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reject draft | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit approved draft | ✅ | ✅ | ✅ | ❌ | ❌ |
| **ADSPOWER** | | | | | |
| View browser profiles | ✅ | ✅ | ✅ | ✅ | ❌ |
| Attach/detach profile | ✅ | ✅ | ✅ | ✅ | ❌ |
| Open browser | ✅ | ✅ | ✅ | ✅ | ❌ |
| Close browser | ✅ | ✅ | ✅ | ✅ | ❌ |
| **TRELLO** | | | | | |
| View Trello sync | ✅ | ✅ | ✅ | ✅ | ✅ |
| Trigger Trello sync | ✅ | ✅ | ✅ | ✅ | ❌ |
| Configure Trello | ✅ | ✅ | ❌ | ❌ | ❌ |
| **SETTINGS** | | | | | |
| View settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage AI settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage AdsPower settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage workspace settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| **USER MANAGEMENT** | | | | | |
| View members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change user roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| **BILLING** | | | | | |
| View plan | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage billing | ✅ | ✅ | ❌ | ❌ | ❌ |
| View invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| **SYSTEM** | | | | | |
| Access all tenants | ✅ | ❌ | ❌ | ❌ | ❌ |
| View platform logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Impersonate workspace | ✅ | ❌ | ❌ | ❌ | ❌ |

*Operators can edit drafts they created, before approval.

---

## Role Assignment Rules

1. First user to create a workspace is automatically Workspace Admin
2. Workspace Admin can invite and assign any role except Super Admin
3. A user can have different roles in different workspaces
4. Super Admin role is assigned directly in the database (not via UI)
5. Operators cannot approve drafts — this enforces a 4-eyes principle

---

## Phase 1 Mapping

Phase 1 (local, single user) runs as an implicit **Workspace Admin** with no enforcement.
When migrating to Phase 2, the single user becomes the Workspace Admin of their workspace.
