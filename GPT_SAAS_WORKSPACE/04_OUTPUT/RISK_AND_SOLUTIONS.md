# RISK_AND_SOLUTIONS

Format per EXECUTION_PROTOCOL. Every risk carries its implementation.

## R-01 — State drift (state file stops reflecting reality)
- **Impact:** Agents act on stale state; wrong work gets done; trust in the system collapses.
- **Solution:** End-of-session state update is mandatory and last; weekly audit checks version/AUDIT parity.
- **Implementation:** Shared contract rule 2 (AGENT_ASSIGNMENTS §1) + P-06 check 1. STALE flag forces refresh before new work.
- **Owner:** All agents; Higgsfield enforces.
- **Phase:** 1 onward.
- **Verification:** V-06.

## R-02 — Import flood (dozens of old chats overwhelm the pipeline)
- **Impact:** Inbox becomes a second graveyard; enrichment never happens.
- **Solution:** Batch cap — classify max 5 items per session, oldest first; unclassifiable items don't block the batch.
- **Implementation:** Add cap line to P-03 usage; inbox count reported in weekly audit.
- **Owner:** ChatGPT.
- **Phase:** 2.
- **Verification:** Inbox count trend decreases across two audits.

## R-03 — Token blowup on resume (agent rereads history anyway)
- **Impact:** Costs and context drift return; TOKEN_RULES become decorative.
- **Solution:** P-02 hard-scopes reading to PROJECT_STATE.md; 400-line cap keeps that read small.
- **Implementation:** TOKEN_OPTIMIZATION.md budgets; cap enforcement in P-06 check 5.
- **Owner:** All agents.
- **Phase:** 1.
- **Verification:** V-07.

## R-04 — Single-point storage failure (Drive edit/sync loss)
- **Impact:** Violates "preserve all future work"; unrecoverable state loss.
- **Solution:** Two mirrors: versioned ZIP snapshots in 07_ARCHIVE + git repository mirror (this branch).
- **Implementation:** Blueprint 0.3/0.4; snapshot at every milestone; restore drill.
- **Owner:** Higgsfield (Export), Co-worker.
- **Phase:** 0.
- **Verification:** V-08 restore drill.

## R-05 — Agent contract bleed (an agent edits what it doesn't own)
- **Impact:** GOAL silently rewritten; vision drifts; audits can't assign responsibility.
- **Solution:** "May not" lists per agent; audit flags edits outside contract via AUDIT line attribution.
- **Implementation:** AGENT_ASSIGNMENTS §2; every AUDIT line names the agent.
- **Owner:** Higgsfield.
- **Phase:** 1.
- **Verification:** Planted out-of-contract edit is caught in audit (extension of V-06).

## R-06 — DONE inflation (projects declared finished without evidence)
- **Impact:** System reports success while deliverables are unusable.
- **Solution:** DONE reachable only through REVIEW gate with P-07 evidence-based checklist; EXPORT required.
- **Implementation:** Lifecycle §5 of spec; P-07.
- **Owner:** ChatGPT (Validation) + Higgsfield (Export).
- **Phase:** 3.
- **Verification:** V-02.

## R-07 — Decision backlog (DECISION_REQUIRED.md grows unanswered)
- **Impact:** Defaults compound silently; operator loses control of direction.
- **Solution:** Every decision entry carries an assumed default + date; audit reports decisions open >7 days; blueprint step 1.5 forces first triage.
- **Implementation:** DECISION_REQUIRED.md format (this package) + audit addition.
- **Owner:** Operator; Higgsfield reports.
- **Phase:** 1 onward.
- **Verification:** Audit report lists open-decision age; zero >14 days.

## R-08 — Tool lock-in / link rot in SOURCES
- **Impact:** SOURCES lines point at chats/links that die; enrichment evaporates.
- **Solution:** SOURCES store extracted content files in the project folder, not bare links; links allowed only in addition to a saved extract.
- **Implementation:** P-04 step 2 saves the extract as a file; hash proves presence.
- **Owner:** ChatGPT.
- **Phase:** 2.
- **Verification:** Random SOURCES sample opens offline from the folder alone.
