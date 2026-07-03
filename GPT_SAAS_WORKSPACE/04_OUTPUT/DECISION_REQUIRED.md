# DECISION_REQUIRED

## V1.0 DECISION RECORD — approved by operator 2026-07-03

| # | Decision | Ruling |
|---|---|---|
| D-1 | Canonical workspace location | **ANSWERED:** Google Drive + local/git mirror (option c) |
| D-2 | Co-worker identity | **ANSWERED:** Claude Sonnet = Primary Builder / Co-worker |
| D-3 | Pilot project | **ANSWERED:** 247tiket / Travel Layout → `P001-247tiket-travel-layout` |
| D-4 | Higgsfield scope | **ANSWERED:** Auditor & Secondary Engineer (+ Export/Packaging) |
| V1-a | Role split | Claude Opus 5 = Chief System Reviewer (planning, architecture, audits design, execution package); Claude Sonnet = day-to-day implementation; ChatGPT = Architect & Validator, classification, cross-project consistency |
| V1-b | Historical imports | PENDING_IMPORT until available; **build first, import history later** |
| V1-c | Packaging gate | No final package until audit passes (embedded in P001 DONE_WHEN) |
| V1-d | Architecture | Frozen at v1.0 — no additional architecture changes |

## Open decisions

### D-5 — Confirm P001 DONE_WHEN
- **Question:** Assumed DONE_WHEN for the pilot: "Travel Layout approved by operator, passes Higgsfield audit, exported as versioned package in EXPORTS/". Correct, or is there a more concrete criterion (e.g. deployed URL, specific pages/flows complete)?
- **Assumed default:** the criterion above.
- **Blocked without answer:** nothing — building proceeds; only the REVIEW→DONE gate needs the final wording.
- **Status:** OPEN (opened 2026-07-03)

### D-6 — P001 current materials
- **Question:** Where are the current 247tiket / Travel Layout working files (repo, Drive folder, ZIP)? The workspace contains none yet.
- **Assumed default:** operator drops them into 05_IMPORT_INBOX marked CURRENT (project task T1). This is material intake, not historical import — V1-b does not delay it.
- **Blocked without answer:** T3/T4 (Sonnet's build) cannot start on real assets; everything else proceeds.
- **Status:** OPEN (opened 2026-07-03)
