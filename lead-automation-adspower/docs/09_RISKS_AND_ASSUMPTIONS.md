# Risks and Assumptions

## Assumptions
- User has Python 3.10+ installed
- SQLite is available (stdlib)
- Ollama is optional — mock AI works without it
- AdsPower is optional — app works without it

## Risks
- Ollama model quality varies — prompts tuned for llama3.2
- AdsPower API changes — version pinned to v2
- Large lead imports may be slow — no async processing

## Mitigations
- Mock AI always available as fallback
- AdsPower disabled by default
- CSV import validates rows before insert
