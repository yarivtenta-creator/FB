# GitHub Workflow

## Branch Strategy

### Main Branches
| Branch | Purpose | Rules |
|---|---|---|
| `main` | Stable released code | Protected, merge via PR only, requires gate pass |
| `develop` | Integration branch | Merge features here before main |

### Working Branches
| Pattern | Purpose | Example |
|---|---|---|
| `feature/[name]` | New feature | `feature/trello-sync` |
| `fix/[name]` | Bug fix | `fix/csv-import-encoding` |
| `docs/[name]` | Documentation only | `docs/update-readme` |
| `arch/[name]` | Architecture work | `arch/phase2-design` |
| `claude/[name]` | Autonomous build branches | `claude/gifted-babbage-cekfrh` |

### Branch Rules
- Never commit directly to `main`
- `feature/*` branches must pass Gate 3 (Build Review) before merge
- `main` is tagged on every release

---

## Commit Strategy

### Format
```
[type]: [short description]

[optional body — what and why, not how]

[reference URL or issue]
```

### Types
| Type | When |
|---|---|
| `build` | Build system, dependencies |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `arch` | Architecture design |
| `test` | Adding or fixing tests |
| `refactor` | Code restructure, no behavior change |
| `chore` | Maintenance, cleanup |

### Examples
```
feat: add CSV import with deduplication

build: complete EDIT VALUE LOCAL SDR MINI phase 1

arch: add multi-tenant design and billing-ready architecture
```

### Rules
- Never commit `.env` files
- Never commit `data/` directory (SQLite files)
- Never commit `__pycache__/` or `.pyc` files
- Commit messages in English
- Keep commits focused (one logical change per commit)

---

## Documentation Strategy

### Required docs per feature
1. Update relevant architecture doc if structure changes
2. Update CHANGELOG.md (Phase 2)
3. Update TEST_REPORT.md after test runs
4. Update FINAL_COMPLETION_REPORT.md on phase completion

### Doc file naming
- `docs/NN_TITLE.md` — numbered for ordered reference
- `docs/TITLE.md` — unnumbered for standalone guides

### Rule
No feature is considered done until documentation is updated.
Gate 5 (Documentation Review) enforces this.

---

## Release Strategy

### Version Format
`vMAJOR.MINOR.PATCH-[phase]`

| Example | Meaning |
|---|---|
| `v1.0.0-phase1` | Phase 1 (Local SDR Mini) complete |
| `v1.1.0-phase1` | Phase 1 patch/update |
| `v2.0.0-phase2` | Phase 2 (Scripto SaaS) launch |

### Release Process
1. All Gate 6 criteria pass
2. Update version in `config/app.config.json`
3. Create git tag: `git tag v1.0.0-phase1`
4. Push tag: `git push origin v1.0.0-phase1`
5. Create GitHub Release with release notes
6. Merge `develop` → `main` via PR

---

## Versioning Strategy

Semantic versioning (semver):
- **MAJOR**: Phase change or breaking API/schema change
- **MINOR**: New feature, backward compatible
- **PATCH**: Bug fix, documentation, no behavior change

---

## Backup Strategy

### Code
- Git remote (GitHub) is the primary backup
- Push to remote at end of every working session
- No code lives only on local machine

### Database (Phase 1 local)
```bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M)
cp data/sdr.db backups/sdr_${DATE}.db
echo "Backup created: backups/sdr_${DATE}.db"
```
Run before any schema migration.

### Database (Phase 2 SaaS)
- Automated daily PostgreSQL snapshots
- 30-day retention
- Documented restore procedure in OPERATIONS.md

---

## .gitignore Rules

```gitignore
# Data
data/
*.db
*.sqlite

# Secrets
.env
.env.local
.env.production

# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/

# Exports / Imports
app/imports/*
app/exports/*
app/screenshots/*
!app/imports/.gitkeep
!app/exports/.gitkeep
!app/screenshots/.gitkeep

# Backups
backups/

# OS
.DS_Store
Thumbs.db
```
