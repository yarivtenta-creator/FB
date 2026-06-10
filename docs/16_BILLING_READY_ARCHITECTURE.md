# Billing-Ready Architecture

## Principle

Phase 1 does NOT implement billing.
This document defines the architecture so that Phase 2 can add billing
without redesigning the data model or application logic.

---

## Plan Definitions

| Plan | Price | Leads | Seats | AI Drafts/mo | Workspaces |
|---|---|---|---|---|---|
| Free / Local | $0 | 100 | 1 | 20 | 1 |
| Starter | $29/mo | 500 | 2 | 200 | 1 |
| Pro | $79/mo | 5,000 | 10 | 2,000 | 3 |
| Agency | $199/mo | Unlimited | Unlimited | Unlimited | Unlimited |

All plans include: AdsPower integration, CSV import/export, approval workflow.
Trello sync: Starter+. Multi-language: Pro+. Custom prompts: Pro+.

---

## Subscription Model

One subscription per tenant (not per workspace).
Subscription determines the limits applied across all workspaces under that tenant.

---

## Table: subscriptions (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK UNIQUE | One subscription per tenant |
| plan | TEXT | free/starter/pro/agency |
| status | TEXT | trialing/active/past_due/canceled |
| stripe_subscription_id | TEXT | nullable |
| current_period_start | DATETIME | |
| current_period_end | DATETIME | |
| trial_ends_at | DATETIME | nullable |
| cancel_at_period_end | BOOLEAN | |
| created_at | DATETIME | |

## Table: usage_records (Phase 2)
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tenant_id | UUID FK | |
| workspace_id | UUID FK | |
| metric | TEXT | leads_count/ai_drafts/seats |
| period_start | DATE | Monthly billing period |
| count | INTEGER | Running total |
| updated_at | DATETIME | |

---

## Usage Limits Enforcement

A `PlanEnforcer` service checks limits before resource creation:

```
Before creating a lead:
  1. Get tenant's active plan
  2. Get current leads_count for period
  3. If count >= plan.leads_limit → raise PlanLimitError

Before generating AI draft:
  1. Get tenant's active plan
  2. Get current ai_drafts for period
  3. If count >= plan.ai_drafts_limit → raise PlanLimitError
```

In Phase 1: PlanEnforcer is a stub that always returns "allowed".
In Phase 2: PlanEnforcer reads from subscriptions + usage_records.

---

## Seat Billing

Seat count = number of active workspace_members across all workspaces.
Seat limits enforced when inviting users.
Seat billing option: per-seat pricing in addition to base plan (future).

---

## Trial Periods

Default: 14-day trial on Starter plan for new signups.
During trial: full Starter features, no credit card required.
At trial end: downgrade to Free if no payment, or activate plan.
Trial logic stored in `subscriptions.trial_ends_at`.

---

## Payment Provider Integration (Phase 2)

**Primary**: Stripe
- Stripe Checkout for plan selection
- Stripe Billing Portal for self-service subscription management
- Stripe Webhooks for subscription lifecycle events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`

**Webhook handler**: updates `subscriptions` table on every event.
**Idempotency**: all webhook handlers are idempotent (safe to replay).

---

## Phase 1 Billing Stubs

These stubs allow Phase 1 code to be written once, without billing,
and upgraded in Phase 2 without refactoring:

```python
# services/plan_enforcer.py (Phase 1 stub)
def can_create_lead(workspace_id) -> bool:
    return True  # Phase 2: check limits

def can_generate_draft(workspace_id) -> bool:
    return True  # Phase 2: check limits + increment counter

def get_plan_limits(workspace_id) -> dict:
    return {"leads": -1, "drafts": -1, "seats": -1}  # -1 = unlimited
```

---

## Invoicing

Stripe handles invoice generation.
Invoice PDF links surfaced in Workspace Admin billing page.
No custom invoice generation needed.

---

## Tax

Stripe Tax handles VAT/GST calculation for EU and other regions.
Enable on Stripe Dashboard — no application code required.
