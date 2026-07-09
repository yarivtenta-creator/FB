# PROJECT D — Stages 7–8: Tools, Risks, Forbidden Actions & Safety

**Scope of this document:** Thin planning logic for *tool requirements*, *risk*, *forbidden actions*, and *safety rules*.
**Subject:** Desktop Organizer Build Package.
**What this document produces:** A candidate-tool list, a risk register, forbidden-action rules, safe-mode principles, and an output contract for Stages 9–10.

> Planning artifact only. Nothing here executes, scripts, or approves any file operation.

---

## 0. Upstream context (ASSUMED FOR RETEST — not final truth)

Injected for this retest; **ASSUMED FOR RETEST** unless marked CONFIRMED:
- The request is for a Desktop Organizer **Build Package**. *(ASSUMED FOR RETEST)*
- The module may involve scanning, grouping, renaming, moving, duplicate detection, or deletion candidates. *(ASSUMED FOR RETEST — a possibility set, not a committed feature set)*
- **None** of these actions are approved for execution. *(CONFIRMED constraint)*
- OS / path / tool choices remain **UNKNOWN** unless explicitly provided. *(carried forward)*
- Knowledge is references/scope only. *(carried forward from Stage 5–6)*
- No implementation is allowed yet. *(CONFIRMED constraint)*

**Handling rule:** Enumerate *candidate* tools and risks. Do not confirm a tool without a CONFIRMED input. Do not approve any action.

---

## 1. Likely tool requirements (by capability, tool-agnostic)

Described as *capabilities the eventual build might need*, not chosen tools:
- Directory scanning / file enumeration.
- Metadata reading (name, extension, size, timestamps).
- File classification / grouping logic.
- (Conditional) move / rename operations.
- (Conditional) duplicate detection (name / size+date / content hash).
- (Conditional) deletion *candidate* identification (identify ≠ delete).
- (Conditional) backup / quarantine staging.
- Logging / dry-run reporting.

> Every "conditional" capability is gated on a CONFIRMED owner permission.

## 2. Candidate tools (NOT confirmed unless a CONFIRMED input justifies)

| Candidate tool | Capability it would serve | Justified only if… | Status |
|----------------|---------------------------|---------------------|--------|
| **Python** (stdlib file/OS ops) | scan, classify, move, hash | owner confirms Python + OS | CANDIDATE |
| **PowerShell** | scan, move, dedupe on Windows | owner confirms Windows + PS | CANDIDATE |
| **CMD / batch** | simple Windows file ops | owner confirms Windows + CMD | CANDIDATE |
| **OS filesystem APIs** | native move/rename/delete | OS confirmed | CANDIDATE |
| **Hashing utility/lib** | content-based dedupe | dedupe confirmed as content-based | CANDIDATE |
| **Dry-run / logging harness** | safe preview of actions | always advisable | PROPOSED DEFAULT |

**Rule:** No tool graduates from CANDIDATE to CONFIRMED without a matching CONFIRMED input (OS + tool choice). Currently all are CANDIDATE because OS and tool are UNKNOWN.

## 3. CMD / PowerShell / Python / Windows filesystem references (relevance only)

- **Windows filesystem** — relevant *if* OS = Windows; note path/casing/permission differences exist. (reference-only, not documented here)
- **PowerShell** — relevant *if* Windows shell chosen; capable of move/remove; requires safe-flags discipline. (reference-only)
- **CMD** — relevant *if* minimal Windows scripting chosen; blunt, harder to make safe/reversible. (reference-only)
- **Python** — relevant *if* cross-platform or explicit Python chosen; good for dry-run + logging. (reference-only)

> These are pointers so Stages 9–10 know *what* would be specified once OS/tool are CONFIRMED. No API content is authored here.

---

## 4. Risk register

| Risk | Trigger | Severity | Mitigation (proposed, unapproved) |
|------|---------|----------|-----------------------------------|
| **Data loss from deletion** | delete candidates removed | Critical | Never delete without approval; quarantine first |
| **Wrong-file move/rename** | grouping rule misapplied | High | Dry-run preview; require confirmation |
| **Acting on wrong path** | target path UNKNOWN/guessed | Critical | Block until path CONFIRMED |
| **OS mismatch** | script assumes wrong OS | High | Block until OS CONFIRMED |
| **False-positive duplicates** | weak dedupe (name-only) | High | Prefer stronger signal; report-only first |
| **Irreversible action, no backup** | mutate with no quarantine | Critical | Require backup/quarantine before mutation |
| **Silent scope creep** | tool does more than specified | Medium | Explicit forbidden-action list; least privilege |
| **Assuming assumed context is truth** | ASSUMED-FOR-RETEST treated as CONFIRMED | High | Keep classification tags; re-verify with owner |

---

## 5. Destructive actions to watch for

- **Delete / remove** files (any form: recycle, permanent, overwrite).
- **Move** across folders/drives (can orphan references).
- **Rename** (breaks links, can collide).
- **Overwrite** on move/copy collision.
- **Bulk operations** applied without preview.
- **Duplicate "cleanup"** that removes the wrong copy.

Each is treated as destructive-until-proven-safe.

## 6. Forbidden actions (this phase, and defaults for the eventual build)

**Forbidden now (planning phase):**
- Executing or scripting any real file operation.
- Selecting an OS, path, or tool as if CONFIRMED.
- Treating ASSUMED-FOR-RETEST context as owner truth.

**Forbidden by default in the eventual build (unless explicitly approved):**
- Deleting any file.
- Moving/renaming outside the CONFIRMED target path.
- Operating without a dry-run/preview option.
- Operating without backup/quarantine when mutating.
- Emptying recycle bin / permanent deletion.
- Acting on system/hidden files.

---

## 7. Backup / quarantine requirements (PROPOSED DEFAULTS — not confirmed)

Offered as **PROPOSED DEFAULT**, pending **OWNER REVIEW REQUIRED**:
- Before any move/delete, stage affected items in a timestamped **quarantine** folder.
- Keep a manifest/log mapping original → new location for rollback.
- Deletion = move-to-quarantine, never immediate removal, until owner confirms hard-delete.
- Retain quarantine for a confirmable retention window (value UNKNOWN — owner sets it).

> These are suggestions. None is a confirmed fact. The UNKNOWN "backup preference" remains UNKNOWN.

## 8. "Do not delete without approval" rule

**Absolute rule for the eventual build:**
> The organizer must never delete a file without explicit, per-run or per-policy owner approval. Absent approval, deletion is downgraded to *quarantine* (reversible). Deletion candidates are *identified and reported*, never removed automatically.

This rule is CONFIRMED as a safety invariant of the method, independent of any UNKNOWN.

## 9. Safe-mode principles

1. **Report before act.** Default behavior is scan + report; mutation is opt-in.
2. **Dry-run first.** Every mutating capability must support a no-op preview.
3. **Least privilege.** Touch only the CONFIRMED target path; nothing system-wide.
4. **Reversibility.** Prefer quarantine/move over delete; keep a rollback manifest.
5. **Fail safe.** On ambiguity or UNKNOWN, stop and ask — do not proceed.
6. **No guessing.** UNKNOWN OS/path/tool blocks the corresponding action.
7. **Approval gates.** Destructive actions require explicit owner approval each time or by confirmed policy.

---

## 10. Desktop Organizer–specific examples (Stage 7–8)

**Example A — delete downgraded**
- "Remove duplicate screenshots" → build package specifies: *identify* duplicates, *move* the redundant copy to quarantine, *report*; never hard-delete without approval.

**Example B — tool stays candidate**
- OS is UNKNOWN, so "use PowerShell" cannot be confirmed. Package lists PowerShell as CANDIDATE and states it is selectable only once Windows + PS are CONFIRMED.

**Example C — path guard**
- Target path UNKNOWN → package forbids any operation and marks path a blocking UNKNOWN; no default like `~/Desktop` is chosen.

**Example D — dry-run mandated**
- Grouping "by file type" → package requires a dry-run listing planned moves for owner review before any real move.

---

## 11. Output contract for the next stage (Stages 9–10)

```
OUTPUT CONTRACT — Stage 7–8 → Stage 9–10
1. Capability list (tool-agnostic), with conditional capabilities gated
2. Candidate tools table (all CANDIDATE until OS/tool CONFIRMED)
3. Risk register (with proposed, unapproved mitigations)
4. Destructive-action watch-list
5. Forbidden-action list (now + eventual-build defaults)
6. Backup/quarantine PROPOSED DEFAULTS (labeled, unconfirmed)
7. "Do-not-delete-without-approval" invariant (CONFIRMED safety rule)
8. Safe-mode principles
9. Handoff note: "QA/final stage must not mark ready while blocking UNKNOWNs or unapproved destructive actions remain. Tools stay candidates; defaults stay labeled."
```

**Guarantee of this stage:** No tool confirmed, no action approved, no UNKNOWN resolved, no backup system built.

---

*End of standalone planning document — PROJECT D (Stages 7–8).*
