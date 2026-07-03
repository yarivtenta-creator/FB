# PROJECT RULES (mandatory)

> These rules are **files, not memory**. They apply to every project in this system
> and must be honored on every request. Nothing here depends on Claude remembering it.

## 1. Every project MUST contain these files

| File | Location | Purpose |
|------|----------|---------|
| `STATE.md` | `00_CURRENT/` | Single-glance current state |
| `TODO.md` | `00_CURRENT/` | Open tasks |
| `DECISIONS.md` | `00_CURRENT/` | Why things are the way they are (append-only) |
| `CHANGELOG.md` | `00_CURRENT/` | What changed, newest first |
| `SOURCE_OF_TRUTH.md` | `00_CURRENT/` | Which files/assets are authoritative |
| `ASSET_INDEX.md` | project root | Every ZIP/PDF/image/DOC/site folder |
| `SKILLS_AVAILABLE.md` | project root | Skills/modules the project can use |
| `SKILLS_USED.md` | project root | Log of skills/modules actually used |

`New-Project.ps1` creates all eight and **verifies** them (logs a WARN if any are
missing). Run it any time to repair a project non-destructively.

## 2. Before answering ANY request — the 5-step protocol

1. **Identify project.**
2. **Check available skills** — read `SKILLS_AVAILABLE.md` and the master
   `GPT-Memory/_SKILLS/SKILLS_LIBRARY.md`. **Never skip the Skills Library.**
3. **Check if similar work already exists** — scan `SESSION_LOG.md`,
   `DECISIONS.md`, `SKILLS_USED.md` (and converted Markdown, once Phase 5 exists).
4. **Check project state** — read `STATE.md` / `STATUS.txt`.
5. **Then answer**, informed by 1–4.

Run this automatically with:

```powershell
.\scripts\Get-ProjectContext.ps1 -Project "<name>" -Query "<optional keyword>"
```

It prints project, available skills, prior related work, and current state — the
context to load before doing anything.

## 3. Skills Library discipline

- If a skill/module already does the work, **reuse it** — don't rebuild.
- When a request matches nothing, and you build something reusable, **add it to
  the Skills Library** and the project's `SKILLS_AVAILABLE.md`.
- Consolidate duplicate ideas into one module record (Phase 3 audit).
- Record every use via `Save-Session.ps1 -SkillUsed "<skill>"`.

## 4. Safety (always)

- Never delete an original file.
- Never overwrite without a backup (`_backups/`).
- Log every action (`_logs/actions.log`).
- If unsure, mark **`NEEDS_REVIEW`** — never guess.
