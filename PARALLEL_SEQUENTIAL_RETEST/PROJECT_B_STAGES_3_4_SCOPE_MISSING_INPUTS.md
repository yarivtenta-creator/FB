# PROJECT B — Stages 3–4: Scope & Missing Inputs

**Scope of this document:** Thin planning logic for defining *scope* and cataloguing *missing inputs*.
**Subject:** Desktop Organizer Build Package.
**What this document produces:** A scope boundary, a missing-input checklist, blocking rules, and an output contract for Stages 5–6.

> Planning/build-package artifact only. Nothing here builds, executes, or approves the Desktop Organizer.

---

## 0. Upstream context (ASSUMED FOR RETEST — not final truth)

The following is injected to run this retest. It is **ASSUMED FOR RETEST**, not owner-approved, unless a line says CONFIRMED.

Stages 1–2 are assumed to have established:
- The user requested a Desktop Organizer module. *(ASSUMED FOR RETEST)*
- The requested artifact for now is a **Build Package**, not the module itself. *(ASSUMED FOR RETEST)*
- The system must understand the project before implementation. *(ASSUMED FOR RETEST)*
- Unclear items must remain **UNKNOWN**. *(CONFIRMED as a method rule)*

Stages 1–2 did **NOT** confirm (these remain **UNKNOWN**):
- operating system
- target folder / path
- whether files may be moved
- whether files may be deleted
- grouping rules
- duplicate detection method
- backup / quarantine preference
- whether Python, CMD, PowerShell, or another tool must be used

**Handling rule:** Treat the assumed context as a working hypothesis. Do not harden it into fact. Do not fill any of the eight UNKNOWNs.

---

## 1. Missing input checklist

Each item is a gate. Status is one of UNKNOWN / CONFIRMED / PROPOSED DEFAULT (pending approval).

| # | Missing input | Why it matters | Status | Blocking? |
|---|---------------|----------------|--------|-----------|
| 1 | Operating system | Determines paths, tools, path separators | UNKNOWN | **BLOCKS** tool selection |
| 2 | Target folder / path | Defines what gets organized | UNKNOWN | **BLOCKS** scope of operation |
| 3 | May files be **moved**? | Move is a mutating action | UNKNOWN | **BLOCKS** any move logic |
| 4 | May files be **deleted**? | Delete is destructive | UNKNOWN | **BLOCKS** any delete logic |
| 5 | Grouping rules | Defines "organized" | UNKNOWN | **BLOCKS** core behavior spec |
| 6 | Duplicate-detection method | Name? hash? size+date? | UNKNOWN | BLOCKS dedupe feature only |
| 7 | Backup / quarantine preference | Safety net before mutation | UNKNOWN | **BLOCKS** destructive features |
| 8 | Required tool/language | Python / CMD / PowerShell / other | UNKNOWN | BLOCKS implementation choice |

> The checklist is the contract's spine. Nothing on it may be silently defaulted.

---

## 2. In-scope items (for the Build Package, this phase)

The Build Package **may** specify (as planning, not code):
- The *structure* of the intake→build pipeline for this request.
- The *set of decisions* the owner must make (the checklist above).
- The *behavioral options* for "organize," each labeled and unselected.
- The *risk surface* of each candidate behavior (handoff to Stages 7–8).
- The *shape* of the final package artifact (handoff to Stages 9–10).
- Explicit UNKNOWN and OWNER REVIEW REQUIRED registers.

## 3. Out-of-scope items (this phase)

Explicitly **not** in scope now:
- Building or running the Desktop Organizer.
- Writing production Python/PowerShell/CMD.
- Choosing an OS, path, or tool on the owner's behalf.
- Performing or scripting any move/rename/delete.
- Deciding grouping rules or dedupe method.
- Deploying, scheduling, or wiring live agents.
- Selecting a backup/quarantine mechanism (only *proposing* one, labeled, is allowed later).

---

## 4. UNKNOWN rules (Stage 3–4)

1. Every item in §1 that is not CONFIRMED stays **UNKNOWN** and is carried forward verbatim.
2. An UNKNOWN may be *paired* with a PROPOSED DEFAULT, but only if labeled and marked OWNER REVIEW REQUIRED. The UNKNOWN status is not cleared by proposing.
3. No UNKNOWN may be "resolved" by copying the ASSUMED-FOR-RETEST context — assumed context is not owner truth.
4. If two UNKNOWNs interact (e.g., delete + no backup), the *combination* is flagged as a compound risk for Stages 7–8.
5. UNKNOWN count is reported; a package with unresolved **blocking** UNKNOWNs cannot be declared ready (enforced at Stages 9–10).

---

## 5. Owner clarification questions

Grouped so the owner can answer efficiently.

**Environment**
- Which OS? Which exact folder/path should the organizer act on?

**Permission to mutate**
- May the organizer **move** files? **rename** them? **delete** them? Or only *report/suggest*?

**Definition of "organized"**
- Group by file type, date, project, name pattern, or something else?
- Should empty folders / temp files be handled? How?

**Duplicates**
- Should duplicates be detected? By name, size+date, or content hash?
- On finding a duplicate: report only, quarantine, or (with approval) remove?

**Safety**
- Do you want a backup or quarantine folder before any change?
- What is the rollback expectation?

**Tooling**
- Must it be Python, PowerShell, CMD, or is the tool open?

> These are questions, not decisions. The planner records answers or keeps UNKNOWN.

---

## 6. What must NOT be assumed (Stage 3–4)

- That "organize" implies deletion. It may be report-only.
- That moving is allowed just because organizing usually moves things.
- That the OS is Windows because "Desktop" was mentioned.
- That the assumed upstream context is owner-approved.
- That a missing answer means "planner's choice." Missing = UNKNOWN.
- That duplicate detection is wanted at all.

---

## 7. What should BLOCK the build package

A build package must be **blocked from "ready"** while any of these hold:
- Target OS is UNKNOWN.
- Target path is UNKNOWN.
- Any *mutating* behavior (move/rename/delete) is in-scope but its permission is UNKNOWN.
- Core "grouping rules" (definition of organized) is UNKNOWN.
- A destructive behavior is proposed without an approved backup/quarantine.
- The deliverable type (package vs module) is not CONFIRMED at request level.

Non-blocking (may proceed as DEFERRED): dedupe method if dedupe is optional; performance tuning; UI polish.

---

## 8. Desktop Organizer–specific examples (Stage 3–4)

**Example A — move vs report**
- Owner has not said files may be moved. → Scope includes only "scan + suggest grouping." Any actual move is **out of scope / UNKNOWN permission / BLOCKS**.

**Example B — delete + no backup = compound risk**
- If "remove duplicates" is desired but backup preference is UNKNOWN → flag: "destructive action without confirmed safety net." Route to Stages 7–8, mark **BLOCKS**.

**Example C — OS-driven path ambiguity**
- "Desktop" path differs across OSes (`~/Desktop`, `C:\Users\<u>\Desktop`, `/home/<u>/Desktop`). With OS UNKNOWN, target path stays UNKNOWN. Do not pick one.

**Example D — grouping undefined**
- "Organize" with no grouping rule → present candidate schemes (by type / by date / by project) as PROPOSED DEFAULTS, all unselected, OWNER REVIEW REQUIRED.

---

## 9. Output contract for the next stage (Stages 5–6)

```
OUTPUT CONTRACT — Stage 3–4 → Stage 5–6
1. Confirmed scope boundary (in-scope / out-of-scope lists)
2. Missing-input checklist with status per item (the 8 UNKNOWNs preserved)
3. Blocking register: which UNKNOWNs currently block "ready"
4. Owner clarification questions (open)
5. Compound-risk flags (e.g., delete + no backup)
6. Candidate behavior set for "organize" (all unselected, labeled PROPOSED DEFAULT)
7. Non-goals reaffirmed
8. Handoff note: "Scope is provisional. UNKNOWNs preserved. Roles/knowledge stage must reference skills only, not resolve these UNKNOWNs."
```

**Guarantee of this stage:** No UNKNOWN converted to a value. No mutation approved. Assumed context kept as hypothesis, not fact.

---

*End of standalone planning document — PROJECT B (Stages 3–4).*
