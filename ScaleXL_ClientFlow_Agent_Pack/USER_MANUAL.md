# ScaleXL ClientFlow Agent Pack — User Manual

Version 1.0 | Node.js | No database required

---

## Table of Contents

1. [What Is This System?](#1-what-is-this-system)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Starting the Server](#4-starting-the-server)
5. [Using the Dashboard](#5-using-the-dashboard)
6. [The 10 Agents — What Each One Does](#6-the-10-agents)
7. [The Pipeline — How Messages Flow](#7-the-pipeline)
8. [Running the Tests](#8-running-the-tests)
9. [API Reference](#9-api-reference)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What Is This System?

The **ScaleXL ClientFlow Agent Pack** is a BotCommerce-style automation system.

It processes incoming customer messages through 10 specialized AI agents that decide:
- Is this a buyer? A support request? A booking?
- Should we escalate to a human?
- Is this spam?
- When should we follow up?

**It does NOT connect to real WhatsApp, Telegram, or any live system.**
Everything runs locally on your machine. All data is mock/test data.

---

## 2. Requirements

| Software | Version | Download |
|----------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| Git | Any | https://git-scm.com (optional) |

To check if Node.js is installed, open CMD and type:
```cmd
node --version
```
You should see something like `v24.14.0`.

---

## 3. Installation

### Option A — Download ZIP (easiest)

1. Go to: `https://github.com/yarivtenta-creator/FB`
2. Click **Code** → **Download ZIP**
3. Extract the ZIP
4. Navigate into the folder:
   ```
   FB-claude-serene-noether-ztaiws\ScaleXL_ClientFlow_Agent_Pack\
   ```

### Option B — Git Clone

Open CMD and run:
```cmd
cd C:\Users\Local PC\Desktop
git clone https://github.com/yarivtenta-creator/FB.git
cd FB\ScaleXL_ClientFlow_Agent_Pack
```

---

## 4. Starting the Server

Open CMD, navigate to the project folder, then run:

```cmd
node server.js
```

You should see:
```
ScaleXL ClientFlow OS running at http://localhost:2222
```

**The server runs on port 2222.**
Leave this CMD window open — closing it stops the server.

---

## 5. Using the Dashboard

Once the server is running, open your browser and go to:

```
http://localhost:2222
```

You will see the **ScaleXL ClientFlow OS** dark dashboard with two panels:

---

### Panel 1 — Single Agent Tester

Use this to test any one agent individually.

**Steps:**
1. Click an agent name in the left sidebar (e.g. `sales agent`)
2. The JSON input box fills automatically with an example
3. Edit the `message` field if you want to test your own text
4. Click **▶ Run Agent**
5. The output appears below in green

**Example — testing the Sales Agent:**
```json
{
  "message": "I want to buy now, what is the price?",
  "lead_profile": { "name": "John" },
  "channel": "whatsapp"
}
```

Expected output:
```json
{
  "action": "pitch",
  "intent_score": 70,
  "reason": "Hot keywords detected: buy, price",
  "next_step": "send_pricing_info"
}
```

---

### Panel 2 — Pipeline Tester

Use this to simulate a real customer message going through the full system.

**Steps:**
1. Type a message in the **Message** field
2. Select a channel (whatsapp / instagram / email / messenger)
3. Click **⚡ Run Pipeline**
4. Watch all 6 pipeline steps appear with colored badges

**Example messages to try:**

| Message | Expected Agent Used |
|---------|-------------------|
| `I want to buy now` | ecommerce_order_agent |
| `I need help with my refund` | support_agent |
| `I want to book an appointment` | booking_agent |
| `Speak to your manager now!` | human_handoff_agent |
| `just browsing` | sales_agent |

---

## 6. The 10 Agents

### Sales Agent
**Purpose:** Qualify leads and detect buying intent.

**Triggers:** Words like `buy`, `price`, `purchase`, `how much`, `order`, `deal`

**Output:**
- `action`: `qualify` / `pitch` / `close` / `disqualify`
- `intent_score`: 0–100
- `next_step`: what to do next

---

### Support Agent
**Purpose:** Classify customer support requests.

**Triggers:** `refund`, `charge`, `broken`, `error`, `angry`, `lawsuit`

**Output types:**
- `billing` — payment or refund issue
- `technical` — product/software not working
- `complaint` — angry customer (auto-escalates)
- `faq` — general question

---

### Booking Agent
**Purpose:** Collect booking fields and confirm appointments.

**Required fields:** `name`, `date`, `time`, `service_type`

**Output status:**
- `missing_fields` — still needs info
- `collecting` — partially filled
- `confirmed` — all fields present, booking created with ID

---

### Lead Scoring Agent
**Purpose:** Score leads by buying readiness.

**Scores:**
- `hot` — urgent, ready to buy (score 70–100)
- `warm` — interested but not urgent (score 45–69)
- `cold` — low intent (score 0–44)
- `spam` — suspicious message
- `needs-human` — requires human attention

---

### Follow-Up Agent
**Purpose:** Decide when and how to follow up.

**Delays by score:**
| Score | Delay | Method |
|-------|-------|--------|
| hot | 1 hour | WhatsApp |
| warm | 24 hours | Email |
| cold | 72 hours | Email |
| spam | Never | — |

---

### Human Handoff Agent
**Purpose:** Detect when a human operator must take over.

**Triggers:**
- `speak to your manager` / `talk to manager`
- `lawsuit` / `legal action` / `sue`
- `angry` / `furious` / `disgusting`
- 3+ failed bot responses

**Urgency levels:** `immediate` / `high` / `normal`

---

### Ecommerce Order Agent
**Purpose:** Handle product inquiries and create mock orders.

**Intents detected:**
- `browse` — looking around
- `inquire` — asking about a product
- `add_to_cart` — wants to buy
- `checkout` — ready to pay
- `order_status` — checking delivery

**Payment link format:** `https://pay.mock/ORD-[timestamp]`

---

### Campaign Router Agent
**Purpose:** Route leads to the right campaign and funnel.

**Sources supported:** `facebook_ad`, `instagram`, `referral`, `website`

**Business types:** `ecommerce`, `saas`, `services`, `real_estate`

**Output:** `campaign_id`, `funnel_stage`, `next_action`

---

### Inbox Triage Agent
**Purpose:** Classify conversations by urgency.

**Urgency levels:**
- `critical` — fraud, payment issue, legal threat, furious customer
- `high` — urgent request or unread for 24+ hours
- `medium` — standard support
- `low` — resolved or waiting

---

### Safety & Compliance Agent
**Purpose:** Block unsafe messages and opt-out violations.

**Blocks:**
- Broadcasts to opted-out users
- Profanity
- Spam patterns (`free money`, `click here`, `win prize`)
- Mass message abuse

**Actions:** `allow` / `block` / `flag` / `require_approval`

---

## 7. The Pipeline

When a message enters the system, it passes through 6 steps automatically:

```
Message In
    │
    ▼
Step 1: safety_compliance_agent  ──► BLOCKED? → Stop here
    │
    ▼
Step 2: inbox_triage_agent       ──► urgency level
    │
    ▼
Step 3: lead_scoring_agent       ──► hot / warm / cold / spam
    │
    ▼
Step 4: campaign_router_agent    ──► campaign + funnel stage
    │
    ▼
Step 5: (route to best agent)
    ├── critical/needs-human  → human_handoff_agent
    ├── support keywords      → support_agent
    ├── booking keywords      → booking_agent
    ├── ecommerce keywords    → ecommerce_order_agent
    └── default               → sales_agent
    │
    ▼
Step 6: follow_up_agent          ──► schedule follow-up
    │
    ▼
Final Decision Output
```

---

## 8. Running the Tests

To verify all 10 agents work correctly:

```cmd
node tests/test_runner.js
```

Expected output:
```
✅ PASS [1] Hot sales lead detected
✅ PASS [2] Support billing issue
✅ PASS [3] Booking confirmed
✅ PASS [4] Cold lead scored
✅ PASS [5] Warm follow-up scheduled
✅ PASS [6] Human handoff triggered
✅ PASS [7] Ecommerce order intent
✅ PASS [8] Campaign routed facebook_ad ecommerce
✅ PASS [9] Inbox urgency critical
✅ PASS [10] Safety block spam broadcast

10/10 tests passed
ALL TESTS PASSED
```

---

## 9. API Reference

The server exposes these endpoints at `http://localhost:2222`:

### GET /api/health
Check if server is running.
```json
{ "status": "ok", "agents": 10, "version": "1.0.0" }
```

### GET /api/agents
List all available agents.
```json
{ "agents": ["sales_agent", "support_agent", ...] }
```

### POST /api/run
Run a single agent.
```json
// Request:
{ "agent": "sales_agent", "input": { "message": "I want to buy", "lead_profile": {}, "channel": "whatsapp" } }

// Response:
{ "agent": "sales_agent", "result": { "action": "pitch", "intent_score": 70, ... } }
```

### POST /api/pipeline
Run the full 6-step pipeline.
```json
// Request:
{ "message": "I need help with my order", "channel": "whatsapp", "lead_profile": {} }

// Response:
{ "pipeline_steps": [...], "final_decision": {...}, "agent_used": "support_agent", "follow_up": {...} }
```

---

## 10. Troubleshooting

### "Cannot find module" error
Make sure you are in the correct folder:
```cmd
cd "E:\1 D\FB-...\ScaleXL_ClientFlow_Agent_Pack"
node server.js
```

### Port already in use
Another process is using port 2222. Close it or restart your computer.

### Dashboard shows "Cannot connect to server"
Make sure `node server.js` is running in a separate CMD window.

### curl SSL error on Windows
Add `-k` flag:
```cmd
curl -k -o filename.js "https://..."
```

### Tests show PARTIAL instead of PASS
Download the latest `sales_agent/agent.js`:
```cmd
curl -k -o agents\sales_agent\agent.js "https://raw.githubusercontent.com/yarivtenta-creator/FB/claude/serene-noether-ztaiws/ScaleXL_ClientFlow_Agent_Pack/agents/sales_agent/agent.js"
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Start server | `node server.js` |
| Open dashboard | Browser → `http://localhost:2222` |
| Run all tests | `node tests/test_runner.js` |
| Run one test | `node -e "const a=require('./agents/sales_agent/agent'); console.log(a.run({message:'buy now',lead_profile:{},channel:'web'}))"` |

---

*ScaleXL ClientFlow Agent Pack v1.0 — Built with Node.js — No external dependencies*
