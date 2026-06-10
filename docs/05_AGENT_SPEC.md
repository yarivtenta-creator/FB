# Agent Specifications

## LeadProfileAgent
**Input**: Lead record + optional content items
**Output**: LeadProfile (summary, service_type, opportunities, pain_points, score, recommended_channel)

Functions:
- `analyze(lead)` → full profile
- `score_lead(lead)` → 0-100 integer
- `recommend_channel(lead)` → email/dm/comment

## ContentAnalysisAgent
**Input**: Raw content string + content_type
**Output**: Analysis dict with key_themes, tone, opportunities, pain_points, quality_signals

Functions:
- `analyze_text(text, content_type)` → analysis dict
- `analyze_screenshot(image_path)` → analysis dict (describes visual content)

## OutreachDraftAgent
**Input**: Lead + LeadProfile + channel + tone
**Output**: Draft string

Channels: email, dm, comment
Tones: soft, direct, professional

Functions:
- `generate(lead, profile, channel, tone)` → draft string
- `generate_all_variants(lead, profile)` → list of 9 drafts

## ApprovalCRMAgent
**Input**: Draft + Lead
**Output**: Compliance check dict

Functions:
- `check_compliance(lead, draft)` → {safe: bool, warnings: list}
- `suggest_next_action(lead, approval)` → next_action string
