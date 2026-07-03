# DECISION_REQUIRED

Open decisions found while processing the workspace. Per 00_READ_FIRST.md, work continued using the assumed defaults below. Answer each with ANSWERED: {choice} or DEFAULT-ACCEPTED; unanswered entries are re-reported by the weekly audit after 7 days.

## D-1 — Canonical live location of the workspace
- **Question:** Where does the live (unzipped) workspace tree reside day-to-day?
- **Options:** (a) Google Drive folder next to the current ZIP; (b) the git repository; (c) both, Drive primary + git mirror.
- **Assumed default:** (c) — Drive folder `GPT_SAAS_WORKSPACE/` as the working copy, git branch as mirror/backup. Blueprint Phase 0 is written for this.
- **Blocked without answer:** nothing; snapshots cover either choice.
- **Status:** OPEN (opened 2026-07-03)

## D-2 — Who is "Co-worker"?
- **Question:** AGENT_ROLES.md defines "Co-worker: Execution" with no identity or channel. Human collaborator? Another AI session? A hired freelancer?
- **Assumed default:** the human operator executing TASKS. Contract written accordingly (AGENT_ASSIGNMENTS §2.4) and transfers unchanged to any future person.
- **Blocked without answer:** nothing now; revisit before delegating execution to a third party.
- **Status:** OPEN (opened 2026-07-03)

## D-3 — Pilot project for Phase 2
- **Question:** Which real project becomes P001 to prove the system end-to-end?
- **Assumed default:** the FB landing-page project (already active in the git repository, has a clear DONE_WHEN candidate: "site deployed to production with all 6 languages verified").
- **Blocked without answer:** Phase 2 start uses the default.
- **Status:** OPEN (opened 2026-07-03)

## D-4 — Higgsfield's "Secondary Engineering" scope
- **Question:** The role includes "Secondary Engineering" — does this mean generated media/assets (Higgsfield's product domain), or general second-line engineering work?
- **Assumed default:** asset/collateral generation when a task calls for it; audit + export remain its primary duties. Contract written to this reading.
- **Blocked without answer:** nothing in Phases 0–3.
- **Status:** OPEN (opened 2026-07-03)
