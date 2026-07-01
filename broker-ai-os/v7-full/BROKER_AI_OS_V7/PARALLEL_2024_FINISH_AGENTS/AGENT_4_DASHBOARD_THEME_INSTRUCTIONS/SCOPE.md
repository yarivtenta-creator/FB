# AGENT 4 — SCOPE

## In scope
- `public/index.html` (theme toggle, Provider Setup Center card, Paper Status card)
- `public/theme.js` (light/dark variables + persistence)
- `docs/operator/*.md` (operator guides)

## Out of scope
- Any backend module (Agents 1–3)
- Route mounting (Agent 5)

## UI safety invariant
No field that captures a key value is submitted to the server. Links open provider websites in a
new tab; the only POST is the read-only provider Test.
</content>
