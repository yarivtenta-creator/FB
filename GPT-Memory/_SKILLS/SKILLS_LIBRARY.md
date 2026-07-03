# SKILLS LIBRARY — master catalog

> The single, cross-project catalog of every skill / reusable module / tool.
> **Never skip the Skills Library.** Before starting any request, check here first
> for something that already does the work, then reuse it.
>
> Status legend: **Built** · **Partial** · **Not Built** · **External tool**

---

## 1. Project reusable modules (yours)

Skills/modules you build and reuse across projects. Populated by the Phase 3 audit
(which consolidates duplicate ideas into single module records).

| Module | Status | Aliases | Projects using it | Relevant files | Decision |
|--------|--------|---------|-------------------|----------------|----------|
| Skill Safety Check | Not Built | skill antivirus, skill checker, before-upload validation, skill safety module | _tbd_ | _tbd_ | Keep final state, archive duplicate discussions |

---

## 2. Automation skills (this system)

Built and tested as part of the Project Memory Automation system.

| Skill | Status | Command |
|-------|--------|---------|
| Save Session | Built | `scripts/Save-Session.ps1` |
| New Project | Built | `scripts/New-Project.ps1` |
| Project Context (5-step protocol) | Built | `scripts/Get-ProjectContext.ps1` |
| Ingestion / Export importers | Not Built | `scripts/import/` (planned Phase 0) |

---

## 3. Tooling skills available in the environment

Claude Code skills and connectors available when working with Claude. These are
**external tools**, not project files — recorded so a request can be matched to
an existing capability before building anything new.

### Claude Code skills
| Skill | Use for |
|-------|---------|
| deep-research | Multi-source, fact-checked research reports |
| dataviz | Charts, graphs, dashboards, visualizations |
| artifact-design | Designing rich HTML/Markdown artifacts |
| verify | Exercise a change end-to-end before committing |
| code-review / review | Review a diff or a GitHub PR |
| simplify | Clean up changed code (reuse/simplify/efficiency) |
| security-review | Security review of pending changes |
| run | Launch/drive the project's app |
| init | Generate a CLAUDE.md for a codebase |
| session-start-hook | Set up web-session startup hooks |
| update-config / keybindings-help | Configure the Claude Code harness |
| loop | Run a task on a recurring interval |
| claude-api | Claude API / SDK reference |

### Connectors (MCP)
| Connector | Use for |
|-----------|---------|
| github | PRs, issues, CI, repository operations |
| Google Drive / Gmail / Google Calendar | Files, mail, scheduling |
| Canva | Design creation/export |
| Vercel | Deployments, logs, domains |
| Hiigsfield | Image / video / audio / 3D generation |
| Claude Code Remote | Sessions, triggers, scheduled routines |

---

_Update this file whenever a new skill/module is built or a duplicate is consolidated.
Each project's `SKILLS_AVAILABLE.md` is the per-project view of this catalog._
