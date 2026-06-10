# Agents Documentation

## Overview

The system uses four AI agents. Each agent is a Python module in `app/agents/`.
All agents call `app/adapters/ai_client.py`, which handles mock/Ollama routing.
Agents do NOT call external services directly.

---

## 1. LeadProfileAgent (`app/agents/lead_profile_agent.py`)

**Purpose**: Analyze a lead record and generate a structured profile.

### Functions

#### `analyze_lead(lead: dict) -> dict`
Input: Lead record dict
Output: Profile dict with keys:
- `summary` — 2–3 sentence business description
- `service_type` — primary service category
- `opportunities` — list of 3–5 value opportunities
- `pain_points` — list of 2–4 business challenges
- `score` — integer 0–100
- `recommended_channel` — "email" / "dm" / "comment"

#### `save_profile(lead_id: int, profile: dict) -> int`
Saves profile to `lead_profiles` table. Replaces existing profile for the lead.
Returns the new profile ID.

#### `get_profile(lead_id: int) -> dict | None`
Returns the most recent profile for a lead, or None if no profile exists.
JSON fields (opportunities, pain_points) are deserialized to Python lists.

---

## 2. ContentAnalysisAgent (`app/agents/content_analysis_agent.py`)

**Purpose**: Analyze pasted text or screenshot content for a lead.

### Functions

#### `analyze_text(text: str, content_type: str) -> dict`
Input: Raw text content + type (website/instagram/facebook/vimeo/text)
Output: Analysis dict with keys:
- `key_themes` — list of themes detected
- `tone` — detected tone string
- `opportunities` — list of value opportunities
- `pain_points` — list of visible gaps
- `quality_signals` — list of positive signals

#### `analyze_screenshot(image_path: str) -> dict`
Input: Local file path to screenshot image
Output: Basic analysis dict. Note: full vision analysis requires Ollama vision model (llava).
Falls back to placeholder analysis in mock mode.

---

## 3. OutreachDraftAgent (`app/agents/outreach_draft_agent.py`)

**Purpose**: Generate personalized outreach messages.

### Functions

#### `generate(lead: dict, profile: dict, channel: str, tone: str) -> str`
Input: Lead dict, profile dict (can be None), channel, tone
Output: Draft message string

Channels: `email`, `dm`, `comment`
Tones: `soft`, `direct`, `professional`

The prompt includes the lead's `language` field — output is generated in the lead's language.

#### `generate_all_variants(lead: dict, profile: dict) -> list`
Generates all 9 combinations (3 channels × 3 tones).
Returns list of dicts: `[{channel, tone, content}, ...]`

---

## 4. ApprovalCRMAgent (`app/agents/approval_crm_agent.py`)

**Purpose**: Compliance checking and next-action suggestion.

### Functions

#### `check_compliance(lead: dict, draft_content: str) -> dict`
Input: Lead dict, draft content string
Output: `{safe: bool, warnings: [list of strings]}`
Checks for: spam signals, false claims, aggressive language, privacy issues.

#### `suggest_next_action(lead: dict, approval: dict) -> str`
Input: Lead dict, approval/draft dict
Output: Suggested next action string based on lead status and channel.

---

## AI Client Routing

```
call_ai(prompt, system)
  ├── AI_MODE=mock  → _mock_response(prompt)  [always available, no dependencies]
  └── AI_MODE=ollama → _call_ollama(prompt, system)
                           └── On failure → _mock_response(prompt)  [automatic fallback]
```

To switch to Ollama: set `AI_MODE=ollama` in `.env` and ensure `ollama serve` is running.
Recommended model: `llama3.2` (3B, runs on most hardware).
