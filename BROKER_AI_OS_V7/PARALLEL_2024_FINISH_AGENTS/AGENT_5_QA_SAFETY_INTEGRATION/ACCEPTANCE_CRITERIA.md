# AGENT 5 — ACCEPTANCE CRITERIA

1. `npm install` completes; `node --check server.js` → SYNTAX_OK; `node --check` clean on all changed files.
2. `node tests/run.js` runs and reports pass/fail counts (real, not fabricated).
3. `node tests/endpoints.js` boots the app, authenticates, and returns real JSON for:
   `/api/data/hub/health`, `/api/data/providers`, `/api/data/signals`, `/api/data/signals/ranked`,
   `/api/data/paper/stats`, provider status, provider test.
4. Unauthenticated request to a protected endpoint returns `401` (documented).
5. Safety scan: zero order/execution/broker methods; zero real secrets; `.env` ignored.
6. Every paper artifact shows `paper:true` and `executed:false` in captured output.
7. `FINAL_PROOF_PACKAGE/` contains all 12 documents, each evidence-based.
8. Exactly one final status assigned from the allowed list.
</content>
