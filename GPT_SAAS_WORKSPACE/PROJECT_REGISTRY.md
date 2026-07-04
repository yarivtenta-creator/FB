# PROJECT REGISTRY

MODE: SYSTEM · UPDATED: 2026-07-03 by Claude (Chief System Reviewer)
SCOPE: Real coding / build projects only. Casual chats, general ideas, personal notes, and
non-build discussions are **excluded**.

Source evidence key:
- **Git** = a real branch exists in `yarivtenta-creator/FB` (strongest evidence).
- **Claude** = Claude projects / chats / code workers.
- **Drive** = files in `GPT_SAAS_WORKSPACE/` Drive mirror.
- **ChatGPT** = originated in / discussed in ChatGPT (pending import to confirm).

Estimates are honest first-pass figures. **Recovery %** = how much of the project's material
is already captured in the system. **Completion %** = how close the actual deliverable is to
DONE_WHEN.

---

## P001 — 247tiket / Travel Layout

- **Project ID:** P001
- **Priority:** P0 (operator's highest-priority, self-contained build)
- **Status:** ACTIVE
- **Source platforms:** Claude (chats/workers), Git (`claude/tenta-launch-setup-l4h420`, html build branches — to confirm), Drive (`GPT_SAAS_WORKSPACE_v1/…/P001-247tiket-travel-layout`), ChatGPT (historical, pending import)
- **Estimated recovery %:** 70
- **Estimated completion %:** 45
- **Known paths:** Drive `P001-247tiket-travel-layout/` (PROJECT_STATE, SOURCES, ARCHIVE, EXPORTS); git repo branches (travel/tenta); local paths — TBD by operator
- **Current blocker:** Current working materials (repo/files/links) not yet dropped into `05_IMPORT_INBOX` marked CURRENT (D-5/D-6)
- **Next action:** Operator drops current Travel Layout materials into import inbox → builder produces increment-1 build plan
- **Recommended first recovery step:** Fetch the tenta/travel git branch(es) into `SOURCES/`, hash them, and reconcile against the Drive P001 folder

## P002 — Marketing AI Growth OS (AI Business Growth Platform landing)

- **Project ID:** P002
- **Priority:** P1
- **Status:** REVIEW
- **Source platforms:** Claude, Git (`main` / `claude/ai-growth-platform-landing-vo6noa`)
- **Estimated recovery %:** 90
- **Estimated completion %:** 80
- **Known paths:** git repo root — `index.html`, `assets/{app.js,styles.css,translations.js}` (6-language landing page)
- **Current blocker:** None — needs verification pass + deploy decision
- **Next action:** Verify multilingual landing page renders in all 6 languages, then deploy to Vercel
- **Recommended first recovery step:** Import this repo's `README.md` + assets as SOURCES; open `index.html` locally to confirm

## P003 — Project 770

- **Project ID:** P003
- **Priority:** P1
- **Status:** ACTIVE
- **Source platforms:** Claude, Git (`claude/project-770-module-jp6vfw`, `claude/project770-complete-n8k3yb`)
- **Estimated recovery %:** 65
- **Estimated completion %:** 40
- **Known paths:** two git branches (module + complete)
- **Current blocker:** Two parallel branches not consolidated into one project folder/state
- **Next action:** Consolidate the 770 module + complete branches into one `06_PROJECTS/P003_Project_770/` with a single PROJECT_STATE
- **Recommended first recovery step:** Diff the two 770 branches; pick the newer as base; import both into ARCHIVE

## P004 — The Vinyl Lab

- **Project ID:** P004
- **Priority:** P2
- **Status:** ACTIVE
- **Source platforms:** Claude, Git (`claude/vinyl-lab-html-preview-rs0x2b`)
- **Estimated recovery %:** 60
- **Estimated completion %:** 35
- **Known paths:** git branch (HTML preview)
- **Current blocker:** No project folder/state yet
- **Next action:** Recover the vinyl-lab HTML preview branch into a project folder + PROJECT_STATE
- **Recommended first recovery step:** Fetch branch tree, import HTML into SOURCES, define GOAL/DONE_WHEN

## P005 — ClientFlow Agent Pack

- **Project ID:** P005
- **Priority:** P1
- **Status:** ACTIVE
- **Source platforms:** Claude, Git (`claude/crm-client-bulk-leads-9iic59`)
- **Estimated recovery %:** 55
- **Estimated completion %:** 30
- **Known paths:** git branch (CRM / bulk leads)
- **Current blocker:** Scope + DONE_WHEN undefined
- **Next action:** Recover CRM bulk-leads branch → define DONE_WHEN and first tasks
- **Recommended first recovery step:** Fetch branch, inventory files, write PROJECT_STATE

## P006 — SDR Mini

- **Project ID:** P006
- **Priority:** P2
- **Status:** ACTIVE
- **Source platforms:** Claude, Git (`claude/before-you-call-page-16g09z`)
- **Estimated recovery %:** 50
- **Estimated completion %:** 25
- **Known paths:** git branch (before-you-call page)
- **Current blocker:** Scope undefined; relationship to ClientFlow unclear
- **Next action:** Recover before-you-call page branch → scope as standalone or fold into P005
- **Recommended first recovery step:** Fetch branch; decide standalone vs. sub-module of ClientFlow

## P007 — GPT SAAS (this system)

- **Project ID:** P007
- **Priority:** P0
- **Status:** REVIEW
- **Source platforms:** Claude, Git (`claude/workspace-mission-mode-tdxgqs`, `system-architecture-audit-4i0u1h`, `project-memory-automation-vcvmj4`, `data-collection-chat-consolidation-qpkvh7`, `download-chatgpt-prompts-rtizje`, `claude/gpt-saas-v1-build-x1pq5x`), Drive (`GPT_SAAS_WORKSPACE_v1`)
- **Estimated recovery %:** 95
- **Estimated completion %:** 85
- **Known paths:** `GPT_SAAS_WORKSPACE/` (git + Drive); v2 SYSTEM_SPECIFICATION, EXECUTION_BLUEPRINT
- **Current blocker:** v1 needs verification pass (this build) before finish workflows run
- **Next action:** Run `09_AUDIT/VERIFICATION_REPORT.md` checks, then execute P001 finish workflow
- **Recommended first recovery step:** Reconcile Drive v2 spec with this git build (already aligned)

## P008 — Sale XL / Scale XL

- **Project ID:** P008
- **Priority:** P2
- **Status:** DORMANT
- **Source platforms:** ChatGPT, Claude (chats)
- **Estimated recovery %:** 25
- **Estimated completion %:** 15
- **Known paths:** None in workspace yet (chat-only)
- **Current blocker:** Source chats not imported; unclear if Sale XL and Scale XL are one project or two
- **Next action:** Locate source chats → drop into `05_IMPORT_INBOX` → classify → registry entry
- **Recommended first recovery step:** Export the Sale XL / Scale XL ChatGPT threads to the import inbox

## P009 — Broker AI OS

- **Project ID:** P009
- **Priority:** P2
- **Status:** DORMANT
- **Source platforms:** ChatGPT
- **Estimated recovery %:** 20
- **Estimated completion %:** 10
- **Known paths:** None in workspace yet
- **Current blocker:** No build materials imported
- **Next action:** Locate Broker AI OS chats → import inbox → classify
- **Recommended first recovery step:** Export Broker OS threads; identify any code/assets produced

## P010 — Broker World System

- **Project ID:** P010
- **Priority:** P3
- **Status:** DORMANT
- **Source platforms:** ChatGPT
- **Estimated recovery %:** 15
- **Estimated completion %:** 8
- **Known paths:** None in workspace yet
- **Current blocker:** No build materials imported; may overlap with Broker AI OS
- **Next action:** Locate source chats → import → decide relationship to P009
- **Recommended first recovery step:** Export threads; check for overlap with Broker AI OS

## P011 — Innovation Tools

- **Project ID:** P011
- **Priority:** P3
- **Status:** DORMANT
- **Source platforms:** ChatGPT
- **Estimated recovery %:** 15
- **Estimated completion %:** 5
- **Known paths:** None in workspace yet
- **Current blocker:** No build materials imported
- **Next action:** Locate source chats → import inbox
- **Recommended first recovery step:** Export threads; confirm this is a build project, not an idea list

## P012 — Ableton Tools

- **Project ID:** P012
- **Priority:** P3
- **Status:** DORMANT
- **Source platforms:** ChatGPT
- **Estimated recovery %:** 15
- **Estimated completion %:** 5
- **Known paths:** None in workspace yet
- **Current blocker:** No build materials imported
- **Next action:** Locate source chats → import inbox
- **Recommended first recovery step:** Export threads; inventory any scripts/devices produced

## P013 — Filmora Tools

- **Project ID:** P013
- **Priority:** P3
- **Status:** DORMANT
- **Source platforms:** ChatGPT
- **Estimated recovery %:** 15
- **Estimated completion %:** 5
- **Known paths:** None in workspace yet
- **Current blocker:** No build materials imported
- **Next action:** Locate source chats → import inbox
- **Recommended first recovery step:** Export threads; inventory any presets/scripts produced

---

## REGISTRY SUMMARY

| ID | Project | Prio | Status | Rec% | Done% | Primary source |
|----|---------|------|--------|------|-------|----------------|
| P001 | 247tiket / Travel Layout | P0 | ACTIVE | 70 | 45 | Claude+Git+Drive |
| P002 | Marketing AI Growth OS | P1 | REVIEW | 90 | 80 | Git |
| P003 | Project 770 | P1 | ACTIVE | 65 | 40 | Git |
| P004 | The Vinyl Lab | P2 | ACTIVE | 60 | 35 | Git |
| P005 | ClientFlow Agent Pack | P1 | ACTIVE | 55 | 30 | Git |
| P006 | SDR Mini | P2 | ACTIVE | 50 | 25 | Git |
| P007 | GPT SAAS (system) | P0 | REVIEW | 95 | 85 | Git+Drive |
| P008 | Sale XL / Scale XL | P2 | DORMANT | 25 | 15 | ChatGPT |
| P009 | Broker AI OS | P2 | DORMANT | 20 | 10 | ChatGPT |
| P010 | Broker World System | P3 | DORMANT | 15 | 8 | ChatGPT |
| P011 | Innovation Tools | P3 | DORMANT | 15 | 5 | ChatGPT |
| P012 | Ableton Tools | P3 | DORMANT | 15 | 5 | ChatGPT |
| P013 | Filmora Tools | P3 | DORMANT | 15 | 5 | ChatGPT |

**Excluded from registry** (not build projects): casual chats, general ideas, personal notes,
one-off Q&A, and any thread with no code/asset/deliverable output.

**Note on estimates:** projects with only ChatGPT sources (P008–P013) cannot be confirmed until
their threads are exported into `05_IMPORT_INBOX`. Their recovery % stays low by design until
that import happens — see each project's recommended first recovery step.
