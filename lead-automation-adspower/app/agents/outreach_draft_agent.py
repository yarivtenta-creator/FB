import json
from pathlib import Path
from app.adapters.ai_client import call_ai

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "outreach_draft_prompt.md"

CHANNELS = ["email", "dm", "comment"]
TONES = ["soft", "direct", "professional"]


def _load_prompt() -> str:
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text()
    return "Generate an outreach message for this lead."


def generate(lead: dict, profile: dict, channel: str, tone: str) -> str:
    system = _load_prompt()
    opportunities = profile.get("opportunities", []) if profile else []
    pain_points = profile.get("pain_points", []) if profile else []

    prompt = f"""Write a {tone} {channel} outreach message for this creative business lead:

Business: {lead.get('business_name')}
Contact: {lead.get('contact_name', 'there')}
Niche: {lead.get('niche')}
City: {lead.get('city')}, {lead.get('country')}
Language: {lead.get('language', 'en')}

Profile summary: {profile.get('summary', '') if profile else ''}
Opportunities: {', '.join(opportunities[:3])}
Pain points: {', '.join(pain_points[:3])}

Channel: {channel}
Tone: {tone}

Write ONLY the message. No explanations. Keep it concise and personal.
"""
    return call_ai(prompt, system).strip()


def generate_all_variants(lead: dict, profile: dict) -> list:
    variants = []
    for channel in CHANNELS:
        for tone in TONES:
            content = generate(lead, profile, channel, tone)
            variants.append({"channel": channel, "tone": tone, "content": content})
    return variants
