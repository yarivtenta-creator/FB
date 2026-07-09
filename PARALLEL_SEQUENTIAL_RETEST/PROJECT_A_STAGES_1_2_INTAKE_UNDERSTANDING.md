# PROJECT A — Stages 1–2: Intake & Understanding

**Scope of this document:** Thin planning logic for *receiving and understanding* an incoming request.
**Example request being processed:** "Build a Desktop Organizer module."
**Upstream context:** NONE. This is the first document in the chain. Nothing is inherited.
**What this document produces:** A structured, classified understanding of the request plus an output contract for Stages 3–4.

> This is a planning/build-package artifact only. It does not build the Desktop Organizer, write production code, or approve any action.

---

## 0. Classification legend (used throughout every file)

| Tag | Meaning |
|-----|---------|
| **CONFIRMED** | Explicitly stated by the owner in this request. Treated as fact. |
| **ASSUMED FOR RETEST** | Placeholder context injected only to run this retest. Not truth. |
| **PROPOSED DEFAULT** | A suggested value the planner offers; requires owner approval. |
| **UNKNOWN** | Not stated, not derivable. Must be preserved, never guessed. |
| **OWNER REVIEW REQUIRED** | A decision only the owner may make. |
| **DEFERRED** | Deliberately postponed to a later stage. |

Stage 1–2 rule: When in doubt, tag **UNKNOWN**, never invent a value.

---

## 1. Intake questions (asked of the owner)

These are the questions the intake logic must surface. Each maps to a field the owner can fill.

**Request identity**
1. What are you asking for in one sentence?
2. Is the deliverable *the working software* or *a plan/package to build it later*?
3. Who is the end user of the deliverable (you, a developer, an AI coder like Claude/Codex)?

**Target & environment**
4. What operating system(s) must this run on?
5. Where does it operate (which folder, drive, or path)?
6. Is there an existing codebase, or is this greenfield?

**Behavior intent**
7. What should the module *do*, in plain language?
8. What must it *never* do?
9. Are there destructive actions involved (move, rename, delete, overwrite)?

**Constraints**
10. Any required language/tool (Python, PowerShell, CMD, other)?
11. Any deadline, size, or performance constraint?
12. Any prior attempt or reference to reuse?

> Intake does not answer these questions. It only records the owner's answers or marks them **UNKNOWN**.

---

## 2. Owner input fields (the intake form)

| Field | Type | Default state if empty |
|-------|------|------------------------|
| `request_sentence` | text | UNKNOWN |
| `deliverable_type` | {software, build_package, plan, unclear} | UNKNOWN |
| `deliverable_consumer` | {owner, developer, ai_coder, unclear} | UNKNOWN |
| `operating_system` | text | UNKNOWN |
| `target_path` | text | UNKNOWN |
| `codebase_state` | {greenfield, existing, unclear} | UNKNOWN |
| `intended_behavior` | text | UNKNOWN |
| `forbidden_behavior` | text | UNKNOWN |
| `destructive_actions_involved` | {yes, no, unclear} | UNKNOWN |
| `required_tooling` | text | UNKNOWN |
| `constraints` | text | UNKNOWN |
| `prior_work_reference` | text | UNKNOWN |

Rule: An empty field is **UNKNOWN**, not blank, not a guessed default.

---

## 3. Request summary structure

The intake stage emits a summary with exactly these sections:

```
REQUEST SUMMARY
- Raw request (verbatim): <owner text>
- Restated intent (planner's paraphrase): <one sentence>  [MUST be flagged if paraphrase adds meaning]
- Deliverable type: <CONFIRMED | UNKNOWN>
- Consumer of deliverable: <CONFIRMED | UNKNOWN>
- Confirmed facts: <list, each tagged CONFIRMED>
- Open questions: <list, each tagged UNKNOWN or OWNER REVIEW REQUIRED>
- Detected request category: <software / module / build-package / other> + confidence
- Explicit non-goals stated by owner: <list or "none stated">
```

The restated intent must not introduce any detail the owner did not say. If the paraphrase would require adding a fact, that fact is split out as **UNKNOWN**.

---

## 4. Project understanding rules

1. **Understand before scoping.** This stage produces meaning, not solutions.
2. **Verbatim first.** Keep the owner's exact words before paraphrasing.
3. **No silent enrichment.** Any detail not spoken is UNKNOWN.
4. **Separate "what" from "how."** Capture *what* is wanted; do not choose *how* (that is later stages).
5. **Flag ambiguity, don't resolve it.** Two plausible readings → record both, mark OWNER REVIEW REQUIRED.
6. **Deliverable ≠ subject.** "Build a Desktop Organizer" as a *build-package request* means the deliverable is a package, not the organizer — but this must be confirmed, not assumed.
7. **Preserve non-goals.** If the owner says "not X," record X as an explicit forbidden item.

---

## 5. How to detect a software / module / build-package request

Detection is a signal check, not a guarantee. Emit a category **with confidence**, and if signals conflict, mark **OWNER REVIEW REQUIRED**.

**Signals it is a software/module request**
- Verbs: build, create, develop, code, implement, script, automate.
- Nouns: module, tool, app, script, function, component, "organizer."
- Mentions of files, folders, OS, languages, or automation of a computer task.

**Signals it is specifically a build-package request (deliverable = plan/package, not the running tool)**
- Owner says "package," "plan," "spec," "for Claude/Codex/developer," "so someone can build it."
- Context establishes the current phase is planning, not execution.
- The owner asks *how to build* rather than asking the tool to *do the thing now*.

**Signals it is NOT software** (route elsewhere)
- Pure question, research ask, creative writing, or a request with no build/automate verb.

**Detection output**
```
DETECTED CATEGORY: build-package request (subject: Desktop Organizer)
CONFIDENCE: <low/med/high>
BASIS: <which signals fired>
IF LOW CONFIDENCE OR CONFLICT → OWNER REVIEW REQUIRED
```

> In this retest, the global accepted goal (Part 1 = Software Build Package Mini-System) tells us the *deliverable* is a Build Package. That framing is CONFIRMED at the program level, but the *specifics* of this Desktop Organizer request are still UNKNOWN until owner answers intake.

---

## 6. How to preserve unclear items as UNKNOWN

- Every input field defaults to **UNKNOWN** until an owner value arrives.
- UNKNOWN items are carried forward verbatim into the output contract — never dropped, never filled by inference.
- If a downstream stage "needs" an UNKNOWN value, that is a blocker to raise, not a gap to guess.
- UNKNOWN may be paired with a **PROPOSED DEFAULT** only when clearly labeled as a suggestion pending **OWNER REVIEW REQUIRED**. The UNKNOWN status remains until approved.

---

## 7. What must NOT be assumed at Stages 1–2

- The operating system (Windows/macOS/Linux).
- The target folder or path ("Desktop" is a name, not a confirmed path).
- Whether files may be moved, renamed, or deleted.
- Grouping/sorting rules (by type? by date? by project?).
- Duplicate-detection approach.
- Backup/quarantine preference.
- The implementation language or tool.
- That "organize" means "delete clutter" (it may mean move, tag, or index).
- That the owner wants the module built *now* rather than packaged.

Each of the above is **UNKNOWN** at this stage.

---

## 8. Desktop Organizer–specific examples (Stage 1–2)

**Example A — safe intake**
- Owner text: "Build a Desktop Organizer module."
- Restated intent: "Owner wants a build package for a module that organizes files on a desktop." → paraphrase adds "build package" and "files"; both split out.
- `deliverable_type`: build_package **[program-level CONFIRMED; request-level to verify]**
- `operating_system`: **UNKNOWN**
- `intended_behavior`: "organize a desktop" — too vague; **UNKNOWN specifics**, OWNER REVIEW REQUIRED.
- `destructive_actions_involved`: **UNKNOWN** (organizing *might* move/delete).

**Example B — ambiguity flagged, not resolved**
- "Organizer" could mean: (a) sort files into folders, (b) delete duplicates/clutter, (c) build a launcher UI. → Record all three readings; **OWNER REVIEW REQUIRED**.

**Example C — what NOT to do**
- ❌ Assume "Desktop" = `C:\Users\<name>\Desktop` on Windows.
- ✅ Record `target_path = UNKNOWN`, note "Desktop" is a label whose path/OS is unconfirmed.

---

## 9. Output contract for the next stage (Stages 3–4)

Stage 3–4 (Scope & Missing Inputs) will receive exactly this package:

```
OUTPUT CONTRACT — Stage 1–2 → Stage 3–4
1. Raw request (verbatim)
2. Restated intent (paraphrase, with any added meaning split into UNKNOWNs)
3. Deliverable type + consumer (tagged)
4. Detected category + confidence + basis
5. Confirmed facts list (each CONFIRMED)
6. UNKNOWN register (every unfilled/unclear field, verbatim)
7. Explicit non-goals (or "none stated")
8. Flags: OWNER REVIEW REQUIRED items, ambiguities with all readings
9. Handoff note: "UNKNOWNs are preserved, not defaults. Scope stage must not invent values."
```

**Guarantee of this stage:** No UNKNOWN was converted to a value. No behavior was chosen. No action was approved.

---

*End of standalone planning document — PROJECT A (Stages 1–2).*
