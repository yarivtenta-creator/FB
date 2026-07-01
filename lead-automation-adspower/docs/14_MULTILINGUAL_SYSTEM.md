# Multilingual System Design

## Required Languages

| Code | Language | Notes |
|---|---|---|
| en | English | Default, always available |
| it | Italian | Primary market (creative studios, wedding) |
| fr | French | Secondary market |
| de | German | Secondary market |

---

## Language Layers

The system has four distinct language concerns that must not be confused:

### 1. UI Language (Interface Language)
The language of the application interface itself.
Set per user account in Phase 2. Defaults to workspace default_language.
In Phase 1: English only.

### 2. Internal Language (Data Language)
The language used for AI analysis, lead profiles, and internal notes.
Always English in Phase 1 and Phase 2 (for consistency and searchability).
AI prompts are written in English. AI responses stored in English.

### 3. Output Language (Outreach Draft Language)
The language of generated outreach messages sent to leads.
Determined by the lead's `language` field.
The agent generates the draft in the lead's language.

### 4. Lead Language
The detected or specified language of the lead's content.
Stored as ISO 639-1 code (en, it, fr, de, es, pt, etc.) on the lead record.
Used to select the correct output prompt variant.

---

## Translation Workflow

### Outreach Draft Generation (Phase 1 + 2)

```
1. Lead has language = "it"
2. OutreachDraftAgent receives language from lead record
3. Agent loads prompt: prompts/outreach/[channel]_[tone]_[lang].md
   OR falls back to: prompts/outreach/[channel]_[tone]_en.md + translation instruction
4. AI generates draft in Italian
5. Draft saved with language_code = "it"
```

### Prompt Localization Strategy

Two options (configurable per workspace):

**Option A — Native Prompts (preferred for quality)**
Separate prompt files per language:
```
prompts/
  outreach_draft_prompt_en.md
  outreach_draft_prompt_it.md
  outreach_draft_prompt_fr.md
  outreach_draft_prompt_de.md
```

**Option B — Translation Instruction Append (fallback)**
Single English prompt with appended instruction:
```
[English prompt content]
...
IMPORTANT: Generate the output in Italian (it). 
Match the cultural tone appropriate for Italian creative businesses.
```

Phase 1 uses Option B (simpler). Phase 2 migrates to Option A for quality.

---

## Country-Specific Outreach Variations

Different cultures require different outreach approaches.

| Country/Language | Recommended Tone | Key Notes |
|---|---|---|
| English (US/UK/AU) | Direct or Professional | Value-first, clear CTA |
| Italian | Soft or Professional | Relationship-first, less direct, use "tu" informally |
| French | Professional | Formal, avoid overly casual |
| German | Professional | Precise, factual, respect for professionalism |
| Spanish | Soft or Direct | Warm, personal connection valued |

These variations are encoded in language-specific prompt files, not in application logic.

---

## Lead Language Detection

In Phase 1: manually set by user on lead record.
In Phase 2: auto-detect from lead content using:
1. Python `langdetect` library on pasted website/social content
2. Country → default language mapping as fallback:
   - IT → it, FR → fr, DE → de, ES → es, default → en

---

## Multilingual Tables (Phase 2)

### New Table: prompt_templates
| Field | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK nullable | null = system default |
| template_type | TEXT | lead_profile/content_analysis/outreach_draft/compliance |
| channel | TEXT | email/dm/comment/null |
| tone | TEXT | soft/direct/professional/null |
| language_code | TEXT | en/it/fr/de |
| content | TEXT | Prompt markdown content |
| is_active | BOOLEAN | |
| created_at | DATETIME | |

This allows workspaces to override system prompts in any language.

---

## UI Localization (Phase 2)

UI strings stored in:
```
locales/
  en.json
  it.json
  fr.json
  de.json
```

Format: flat key-value JSON.
```json
{
  "leads.add_button": "Add Lead",
  "approval.approve": "Approve",
  "approval.reject": "Reject"
}
```

Framework: i18next (if React frontend) or Python gettext (if Streamlit extended).

---

## Phase 1 Implementation

Phase 1 implements only:
- `language` field on lead record (freetext, defaults to "en")
- Prompt append strategy (Option B) for output language
- English UI only
- No auto-detection

All localization infrastructure is documented here for Phase 2 implementation.
