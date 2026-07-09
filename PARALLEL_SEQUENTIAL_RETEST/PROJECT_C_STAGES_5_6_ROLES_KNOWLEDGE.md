# PROJECT C — Stages 5–6: Roles / Skills & Knowledge References

**Scope of this document:** Thin planning logic for identifying *required roles/skills* and *knowledge references* (references/scope only).
**Subject:** Desktop Organizer Build Package.
**What this document produces:** A roles/skills map and a knowledge-reference index, plus an output contract for Stages 7–8.

> **Hard constraint for this stage:** Do NOT build full CMD, Python, Windows, PowerShell, duplicate-detection, or filesystem knowledge bases. Knowledge here is **references / scope only** — pointers to what expertise is needed, never the expertise content itself.

---

## 0. Upstream context (ASSUMED FOR RETEST — not final truth)

Injected for this retest; **ASSUMED FOR RETEST** unless marked CONFIRMED:
- The request is for a Desktop Organizer **Build Package**. *(ASSUMED FOR RETEST)*
- The module itself is **not** being built now. *(ASSUMED FOR RETEST)*
- Missing OS / path / delete / move / grouping / backup / tool choices remain **UNKNOWN**. *(carried forward)*
- The package must **not guess** missing information. *(CONFIRMED method rule)*
- Scope must separate confirmed facts from assumptions. *(CONFIRMED method rule)*

**Handling rule:** Identify *which* roles and *which* knowledge areas are implicated. Do not use role identification as a backdoor to resolve UNKNOWNs.

---

## 1. Required roles / skills (needed for this package regardless of open UNKNOWNs)

| Role / skill | Why required now | Depends on an UNKNOWN? |
|--------------|------------------|------------------------|
| **Requirements / intake analyst** | To keep the request understood and UNKNOWNs preserved | No |
| **Scope & safety planner** | To maintain in/out-of-scope and blocking rules | No |
| **Build-package author** (prompt/spec writer for Claude/Codex/dev) | Core deliverable is a package for an AI/dev consumer | No |
| **Risk / safety reviewer** | Organizing may touch destructive actions | No — role is required even while actions UNKNOWN |
| **QA / acceptance reviewer** | To test specificity and readiness at Stages 9–10 | No |

These roles are **required** to produce a *package*, and none of them require the OS/path/tool to be known.

## 2. Candidate roles / skills (may be required once UNKNOWNs resolve)

| Candidate role / skill | Becomes required IF… | Status |
|------------------------|----------------------|--------|
| **Filesystem automation engineer** | implementation phase begins (not now) | DEFERRED |
| **Python developer** | owner confirms Python tooling | UNKNOWN-gated |
| **PowerShell / CMD scripter** | owner confirms Windows shell tooling | UNKNOWN-gated |
| **Cross-platform / OS specialist** | multi-OS target confirmed | UNKNOWN-gated |
| **Duplicate-detection / hashing specialist** | dedupe confirmed in scope | UNKNOWN-gated |
| **Backup / data-safety engineer** | destructive actions + backup confirmed | UNKNOWN-gated |
| **UX designer** | a UI/launcher interpretation confirmed | UNKNOWN-gated |

> Candidate ≠ selected. Each is parked until the relevant UNKNOWN becomes CONFIRMED.

---

## 3. Required knowledge references only (NOT knowledge content)

Each entry names an area and its *relevance boundary*. No content is authored here.

| Knowledge reference | Relevance to package | Boundary (this stage) |
|---------------------|----------------------|-----------------------|
| Filesystem operation concepts (scan/move/rename/delete) | Defines the action vocabulary the package must describe | Reference the *categories* of ops; do not document APIs |
| OS path conventions (Win/macOS/Linux) | Needed to describe why path/OS are blocking UNKNOWNs | Name the difference; do not enumerate path rules |
| Destructive-action safety (backup/quarantine/rollback) | Underpins safe-mode requirements for Stages 7–8 | Reference the principle; do not design a backup system |
| Duplicate-detection approaches (name/size/hash) | Only if dedupe confirmed | Reference the *option space*; do not implement any |
| Build-package / prompt-spec authoring for AI coders | The deliverable's own format | Reference structure; content is built at Stages 9–10 |

## 4. Candidate knowledge references (pull in only when justified)

- Python stdlib file/OS modules — **only if** Python confirmed. (reference-only)
- PowerShell / CMD file cmdlets — **only if** Windows shell confirmed. (reference-only)
- Hashing libraries for content-dedupe — **only if** content-based dedupe confirmed. (reference-only)
- Scheduling / service concepts — **only if** background operation confirmed. (DEFERRED)

> Pulling a candidate reference into "required" requires a CONFIRMED input, not an assumption.

---

## 5. Required now vs deferred

**Required now (to author the package):**
- Intake analyst, scope/safety planner, build-package author, risk reviewer, QA reviewer.
- Reference-level awareness of: filesystem op categories, OS path differences, destructive-action safety, package authoring format.

**Deferred (until UNKNOWNs resolve / implementation phase):**
- All implementation engineer roles (Python/PowerShell/CMD/filesystem).
- Dedupe specialist, backup engineer, UX designer.
- Any *content-level* knowledge base for a specific tool or OS.

---

## 6. Why each role/skill may be needed (rationale, not commitment)

- **Intake analyst** — because UNKNOWNs must stay preserved and understood across stages.
- **Scope/safety planner** — because "organize" spans benign (report) to destructive (delete) behaviors.
- **Build-package author** — because the deliverable is a spec/prompt for Claude/Codex/developer, a distinct skill from coding.
- **Risk reviewer** — because move/rename/delete can cause data loss; the *possibility* alone justifies the role now.
- **QA reviewer** — because the package must pass a specificity/real-artifact test before "ready."
- **Filesystem/Python/PowerShell roles (candidate)** — because *if* implementation is approved, someone must write safe, OS-correct file operations — but that is not this phase.

---

## 7. Desktop Organizer–specific examples (Stage 5–6)

**Example A — role named, not activated**
- Package may involve deleting duplicates → a **backup/data-safety engineer** is a *candidate* role. It stays UNKNOWN-gated until "delete" and "backup" are CONFIRMED. We do not staff it now.

**Example B — knowledge kept as reference**
- The package must mention that moving files across OSes differs. We *reference* "OS path conventions differ" — we do **not** write a Windows-vs-macOS path guide (that would be building a knowledge base, forbidden here).

**Example C — candidate tool role gated**
- If the owner later confirms "use PowerShell," the **PowerShell scripter** candidate becomes required and a PowerShell *reference* moves from candidate to required. Until then: UNKNOWN-gated.

---

## 8. Output contract for the next stage (Stages 7–8)

```
OUTPUT CONTRACT — Stage 5–6 → Stage 7–8
1. Required roles/skills (active now)
2. Candidate roles/skills (UNKNOWN-gated or DEFERRED), each with its unlocking condition
3. Required knowledge references (reference-only, with boundaries)
4. Candidate knowledge references + unlocking CONFIRMED input needed
5. Required-now vs deferred split
6. Note: no knowledge base was authored; all knowledge is pointers/scope
7. Handoff note: "Tools/risk stage must treat every implementation tool as a CANDIDATE unless a CONFIRMED input justifies it. Roles do not resolve UNKNOWNs."
```

**Guarantee of this stage:** No full knowledge base built. No UNKNOWN resolved. No implementation role staffed.

---

*End of standalone planning document — PROJECT C (Stages 5–6).*
