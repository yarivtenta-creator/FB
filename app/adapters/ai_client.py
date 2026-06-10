"""AI client with mock fallback and optional Ollama support."""
import json
import os
from typing import Any

from app.database.db import get_setting


def get_ai_mode() -> str:
    return os.environ.get("AI_MODE", get_setting("ai_mode", "mock"))


def call_ai(prompt: str, system: str = "") -> str:
    mode = get_ai_mode()
    if mode == "ollama":
        try:
            return _call_ollama(prompt, system)
        except Exception as e:
            return _mock_response(prompt)
    return _mock_response(prompt)


def _call_ollama(prompt: str, system: str) -> str:
    import urllib.request

    base_url = get_setting("ollama_base_url", "http://localhost:11434")
    model = get_setting("ollama_model", "llama3.2")
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = json.dumps({"model": model, "messages": messages, "stream": False}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read())
        return data["message"]["content"]


def _mock_response(prompt: str) -> str:
    prompt_lower = prompt.lower()

    if "lead profile" in prompt_lower or "analyze this lead" in prompt_lower:
        return json.dumps({
            "summary": "A creative studio focused on wedding videography with strong visual storytelling.",
            "service_type": "Wedding Videography",
            "opportunities": ["Highlight reel packages", "Social media content bundles", "Same-day edit offers"],
            "pain_points": ["Inconsistent client communication", "Low online visibility", "Underpriced packages"],
            "score": 72,
            "recommended_channel": "email",
        })

    if "content analysis" in prompt_lower or "analyze this content" in prompt_lower:
        return json.dumps({
            "key_themes": ["Romance", "Cinematic style", "Emotion"],
            "tone": "Warm and personal",
            "opportunities": ["Upsell highlight films", "Offer teaser clips for social"],
            "pain_points": ["No clear pricing", "Limited testimonials"],
            "quality_signals": ["High-quality visuals", "Strong portfolio"],
        })

    if "outreach" in prompt_lower or "draft" in prompt_lower:
        channel = "email"
        tone = "professional"
        if "dm" in prompt_lower:
            channel = "DM"
        if "soft" in prompt_lower:
            tone = "soft"
        elif "direct" in prompt_lower:
            tone = "direct"

        return (
            f"Hi [Name], I came across your work and was really impressed by your storytelling. "
            f"I help creative studios like yours book more of their ideal clients. "
            f"Would you be open to a quick chat? Best, [Your Name]"
        )

    if "compliance" in prompt_lower:
        return json.dumps({
            "safe": True,
            "warnings": [],
        })

    return "Thank you for your message. I've reviewed the information and am ready to assist."
