# RECOVERY_PROTOCOL (Recovery Workflow)

Turn a scattered project (spread across Claude chats, ChatGPT threads, git branches, Drive,
and local folders) into one structured project folder with a single source of truth.

## When to run

- A project exists only in chats / branches and has no `PROJECT_STATE.md`.
- A project's state is stale, contradictory, or split across places.

## Steps

1. **Create the folder.** `06_PROJECTS/{PROJECT_ID}/` from `03_TEMPLATES/PROJECT_STATE_TEMPLATE.md`.
2. **Map Claude-side sources** → `CLAUDE_RECOVERY_INDEX.md`:
   - git branches (run `git ls-remote --heads origin` and match by name),
   - Claude projects / chats / code workers,
   - local paths if provided.
3. **Map ChatGPT-side sources** → `GPT_RECOVERY_INDEX.md` (if any threads exist).
4. **Inventory files** → `FILE_INVENTORY.md`: every known file/asset, where it lives, and
   whether it is captured in `SOURCES/` yet.
5. **List problems** → `KNOWN_PROBLEMS.md`: each problem written **with its fix** (7-field
   format from EXECUTION_PROTOCOL).
6. **Write SOURCES.md**: the curated list of where the real material is, each with a content
   hash where possible.
7. **Write PROJECT_STATE.md**: fill GOAL, DONE_WHEN, first tasks, NEXT_ACTION. Set STATUS to
   ACTIVE (or BLOCKED if a decision is required first).
8. **Write FINISH_PLAN.md and NEXT_ACTION.md.**
9. **Log** one AUDIT line; register the project in `PROJECT_REGISTRY.md`.

## Recovery estimate

Record two honest numbers in the registry:
- **Recovery %** = share of the project's material now captured in the system.
- **Completion %** = how close the deliverable is to DONE_WHEN.

## Rule

Recovery never invents deliverables. If material can't be found, log it as a blocker with a
default assumption and continue — the project still gets a valid state.
