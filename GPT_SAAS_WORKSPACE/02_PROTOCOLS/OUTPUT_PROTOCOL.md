# OUTPUT_PROTOCOL

Where outputs go and what "done" produces.

## Where output goes

- **Workspace-level deliverables** → `04_OUTPUT/`
- **Project-level deliverables** → `06_PROJECTS/{project}/EXPORTS/`
- **Curated source extracts** → `06_PROJECTS/{project}/SOURCES/`
- **Raw imports / superseded docs** → `06_PROJECTS/{project}/ARCHIVE/`
- **Nothing** is written to chat as the deliverable. Chat is for status only.

## The 9-file project deliverable set

When a project is being recovered/built, these files are produced (in the project folder):

1. `PROJECT_STATE.md` — the one mandatory state file
2. `SOURCES.md` — where the project's material lives
3. `FILE_INVENTORY.md` — every known file/asset
4. `KNOWN_PROBLEMS.md` — problems, each with its fix
5. `FINISH_PLAN.md` — the path to DONE
6. `NEXT_ACTION.md` — the single next step (mirror of PROJECT_STATE NEXT_ACTION)
7. `CLAUDE_RECOVERY_INDEX.md` — Claude-side sources map
8. `GPT_RECOVERY_INDEX.md` — ChatGPT-side sources map (if available)
9. `EXPORTS/` snapshot — only after verification passes

## Export rule (no premature ZIP)

- A milestone ZIP / package is produced **only** after the project reaches `REVIEW` and passes
  its verification checklist. Set `EXPORT_STATUS.STATE = EXPORTED` and log an AUDIT line.
- Until then, `EXPORT_STATUS.LAST_EXPORT = NEVER`.
