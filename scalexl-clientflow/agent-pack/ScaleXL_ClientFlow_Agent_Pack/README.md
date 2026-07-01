# ScaleXL ClientFlow Agent Pack

A BotCommerce-style multi-client agent pack built with Node.js. Provides 10 specialized AI agents for sales, support, booking, lead scoring, follow-up, human handoff, ecommerce orders, campaign routing, inbox triage, and safety compliance.

## Quick Start

```bash
npm test
```

## Agents

| Agent | Description |
|-------|-------------|
| sales_agent | Qualify leads, detect buying intent |
| support_agent | Handle customer questions |
| booking_agent | Appointment and service booking |
| lead_scoring_agent | Score leads hot/warm/cold/spam |
| follow_up_agent | Schedule follow-ups |
| human_handoff_agent | Detect when to escalate to human |
| ecommerce_order_agent | Product inquiry and mock orders |
| campaign_router_agent | Route leads to correct campaign |
| inbox_triage_agent | Classify conversations by urgency |
| safety_compliance_agent | Block spam and opt-out violations |

## Structure

- `agents/` - 10 agent implementations
- `schemas/` - JSON schemas for all data types
- `examples/` - Sample data files
- `tests/` - Test runner and test cases
- `src/` - Shared utilities

## Test Results: 10/10 PASS
