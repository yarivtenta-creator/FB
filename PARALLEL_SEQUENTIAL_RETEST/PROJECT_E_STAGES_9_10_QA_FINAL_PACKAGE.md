# PROJECT E — Stages 9–10: QA & Final Build Package Structure

**Scope of this document:** Thin planning logic for *QA* and the *final Build Package structure*.
**Subject:** Desktop Organizer Build Package.
**What this document produces:** The package skeleton, a QA checklist, acceptance/specificity/real-artifact tests, the final prompt structure for Claude/Codex/developer, and readiness/deferral rules.

> Planning artifact only. This defines what a *ready* package looks like; it does not build the Desktop Organizer.

---

## 0. Upstream context (ASSUMED FOR RETEST — not final truth)

Injected for this retest; **ASSUMED FOR RETEST** unless marked CONFIRMED:
- The artifact is a **Build Package**, not the Desktop Organizer itself. *(ASSUMED FOR RETEST)*
- Desktop Organizer behavior must be **specific but not guessed**. *(CONFIRMED method rule)*
- Missing owner decisions remain **UNKNOWN**. *(carried forward)*
- Proposed defaults must be **labeled**. *(CONFIRMED method rule)*
- Destructive actions are **not approved**. *(CONFIRMED constraint)*
- Final output must **not be a generic template**. *(CONFIRMED method rule)*
- Tools and knowledge references may be **candidates** if not owner-confirmed. *(carried forward)*

**Handling rule:** QA verifies specificity *and* honesty of classification. A package that hides UNKNOWNs or hardens assumptions fails QA.

---

## 1. Final Build Package structure

The ready package is a single document (for Claude/Codex/developer) with these sections:

```
BUILD PACKAGE — Desktop Organizer (Part 1 deliverable)
1. Request restatement (verbatim + paraphrase, paraphrase-additions flagged)
2. Classification key (CONFIRMED / ASSUMED FOR RETEST / PROPOSED DEFAULT / UNKNOWN / OWNER REVIEW REQUIRED / DEFERRED)
3. Confirmed facts (each CONFIRMED)
4. Assumed context (each ASSUMED FOR RETEST — clearly not truth)
5. Scope: in-scope / out-of-scope
6. UNKNOWN register (verbatim, with blocking flags)
7. Owner decisions required (OWNER REVIEW REQUIRED list)
8. Behavior specification (specific options; unselected ones labeled PROPOSED DEFAULT)
9. Roles/skills (required now vs candidate/deferred)
10. Knowledge references (reference-only)
11. Tools (all CANDIDATE unless CONFIRMED input justifies)
12. Risk register + destructive-action watch-list
13. Safety rules (safe-mode, do-not-delete-without-approval, backup/quarantine PROPOSED DEFAULTS)
14. Acceptance criteria
15. Deferred items
16. Final build prompt for Claude/Codex/developer (section 17 below)
17. Readiness statement (READY / BLOCKED + reasons)
```

> The package must be *specific to this Desktop Organizer request* — not a reusable blank form.

---

## 2. QA checklist

- [ ] Every important item carries exactly one classification tag.
- [ ] No ASSUMED-FOR-RETEST item is presented as CONFIRMED.
- [ ] No UNKNOWN was silently replaced by a value.
- [ ] Every PROPOSED DEFAULT is labeled and marked OWNER REVIEW REQUIRED.
- [ ] All blocking UNKNOWNs (OS, path, mutate-permission, grouping) are listed as blockers.
- [ ] No destructive action is approved or scheduled.
- [ ] "Do not delete without approval" invariant is present.
- [ ] Tools appear as CANDIDATE unless a CONFIRMED input justifies confirmation.
- [ ] Knowledge is references-only; no full knowledge base was embedded.
- [ ] The behavior spec is specific to Desktop Organizer, not generic.
- [ ] Deferred items are listed as DEFERRED, not dropped.
- [ ] Readiness statement matches reality (BLOCKED if any blocking UNKNOWN remains).

---

## 3. Acceptance criteria

A package is **acceptable** when:
1. It converts the request into a *specific* Desktop Organizer build spec (not a template).
2. Every open decision is visible as UNKNOWN / OWNER REVIEW REQUIRED (nothing hidden).
3. Safety rules make destructive actions impossible without explicit approval.
4. A competent developer or Claude/Codex could either (a) act on the CONFIRMED parts safely, or (b) know exactly which owner answers unblock the rest.
5. Classification is internally consistent across all sections.

---

## 4. Real-artifact test

> "Is this a real, usable artifact — or a generic shell?"

Pass conditions:
- Contains request-specific content (Desktop Organizer behaviors, its risks, its UNKNOWNs).
- A reader learns *what would be built* and *what is blocking it*, specifically.
- Removing the words "Desktop Organizer" would make the document read as nonsense — proving it is not a blank template.

Fail conditions:
- Reads identically for any project.
- No concrete UNKNOWNs, no concrete risks, no concrete behavior options.

## 5. Specificity test

> "Is it specific without guessing?"

- **Specific:** names the exact decisions (move? delete? group by type/date?), the exact risks (duplicate cleanup deleting wrong copy), the exact blockers (OS/path UNKNOWN).
- **Not guessing:** none of those specifics invents an owner decision. Specific *about the UNKNOWN* is required; specific *by fabrication* fails.

Both must hold: high specificity **and** zero fabricated owner decisions.

---

## 6. Final prompt structure for Claude / Codex / developer

The package ends with a build prompt shaped like:

```
BUILD PROMPT (for Claude / Codex / developer)
- Objective: Build a Desktop Organizer module per this package.
- Authoritative inputs: [CONFIRMED items only]
- Do NOT proceed on: [blocking UNKNOWNs — list]. Request owner answers first.
- Behavior to implement: [only CONFIRMED behaviors]; [PROPOSED DEFAULTS listed as "await approval"]
- Hard safety rules:
    * No deletion without explicit approval (quarantine instead).
    * Operate only within the CONFIRMED target path.
    * Dry-run/preview before any mutation.
    * Stop and ask on any UNKNOWN.
- Tools: use only a CONFIRMED tool/OS; otherwise request the choice. (candidates: …)
- Out of scope: [list]
- Definition of done: [acceptance criteria]
- Reporting: produce a dry-run report before acting.
```

> The prompt refuses to let the builder act on UNKNOWNs — it channels them back to the owner.

---

## 7. Rules for separating confirmed facts / assumed context / proposed defaults / UNKNOWN / owner-review

1. **One tag per item**, shown inline. No untagged claims in a ready package.
2. **CONFIRMED** = owner-stated only. Assumed context can never be relabeled CONFIRMED.
3. **ASSUMED FOR RETEST** stays visibly separated in its own section (§4 of the package) and is never fed into the build prompt as authoritative.
4. **PROPOSED DEFAULT** always pairs with OWNER REVIEW REQUIRED and never silently becomes behavior.
5. **UNKNOWN** is preserved verbatim; blocking UNKNOWNs gate readiness.
6. **OWNER REVIEW REQUIRED** items are collected into one decision list for the owner.
7. **DEFERRED** items are recorded, not deleted, with the condition that un-defers them.

---

## 8. Desktop Organizer–specific examples (Stage 9–10)

**Example A — specificity without guessing**
- Behavior spec: "Group files by *type* / *date* / *project* — three PROPOSED DEFAULTS, none selected; owner must choose (OWNER REVIEW REQUIRED)." Specific options, zero fabricated choice.

**Example B — readiness = BLOCKED**
- OS UNKNOWN + path UNKNOWN + move-permission UNKNOWN → Readiness statement = **BLOCKED**, listing exactly these three blockers. Package is complete *as a package* but not ready to build.

**Example C — real-artifact pass**
- Risk register names "duplicate cleanup may delete the wrong screenshot copy" — request-specific, survives the real-artifact test.

**Example D — template-fail caught by QA**
- If the behavior section said only "the tool will organize files as needed," QA fails it for genericness and missing specificity.

---

## 9. What must BLOCK the package from being considered ready

- Any blocking UNKNOWN unresolved: OS, target path, move/delete permission, grouping definition.
- A destructive action written as approved.
- An assumed-context item promoted to CONFIRMED.
- Any PROPOSED DEFAULT presented as a decided behavior.
- Missing "do not delete without approval" safety rule.
- The behavior spec failing the specificity or real-artifact test.

## 10. What must be DEFERRED

- Actual implementation / coding of the module.
- OS-specific tool selection until OS + tool CONFIRMED.
- Dedupe method internals until dedupe scope CONFIRMED.
- Backup/quarantine retention window until owner sets it.
- UI/launcher interpretation unless that reading is CONFIRMED.
- Performance/scale tuning.

---

**Guarantee of this stage:** No merge into an official plan, no implementation, no UNKNOWN resolved, no destructive action approved. Output is a *ready-or-blocked* package definition only.

---

*End of standalone planning document — PROJECT E (Stages 9–10).*
