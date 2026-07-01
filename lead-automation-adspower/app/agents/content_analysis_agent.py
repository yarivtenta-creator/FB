import json
from pathlib import Path
from app.adapters.ai_client import call_ai

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "content_analysis_prompt.md"


def _load_prompt() -> str:
    if PROMPT_PATH.exists():
        return PROMPT_PATH.read_text()
    return "Analyze this content and return a JSON analysis."


def analyze_text(text: str, content_type: str = "text") -> dict:
    system = _load_prompt()
    prompt = f"""Analyze this {content_type} content for a creative business lead:

---
{text[:3000]}
---

Return JSON with: key_themes (list), tone, opportunities (list), pain_points (list), quality_signals (list)
"""
    response = call_ai(prompt, system)
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(response[start:end])
    except Exception:
        pass
    return {
        "key_themes": [],
        "tone": "Unknown",
        "opportunities": [],
        "pain_points": [],
        "quality_signals": [],
        "raw": response[:500],
    }


def analyze_screenshot(image_path: str) -> dict:
    return {
        "key_themes": ["Visual content"],
        "tone": "Professional",
        "opportunities": ["Screenshot uploaded — manual review recommended"],
        "pain_points": [],
        "quality_signals": [],
        "note": f"Screenshot saved at {image_path}. AI image analysis requires Ollama vision model.",
    }
