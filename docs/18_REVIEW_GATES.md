# Review Gates

A phase may not continue until all criteria of the previous gate pass.
Gates are evaluated before merging to main branch.

---

## Gate 1: Architecture Review Gate

**When**: Before any code is written
**Who**: Lead developer (self-review in solo context)

### Must Pass
- [ ] All architecture documents exist (docs/01 through docs/20)
- [ ] Database schema is complete with all tables defined
- [ ] All module boundaries are defined
- [ ] Folder structure is finalized
- [ ] No critical gaps in ARCHITECTURE_AUDIT
- [ ] Phase 1 → Phase 2 migration path is clear
- [ ] Security model is defined
- [ ] Deployment model is defined

### Must NOT Proceed If
- Tables missing for core workflows
- Permissions not defined
- No clear path from Phase 1 to Phase 2

### Output
ARCHITECTURE_COMPLETION_REPORT.md with READY FOR IMPLEMENTATION verdict

---

## Gate 2: Database Review Gate

**When**: After schema.sql is created and migrations run

### Must Pass
- [ ] All tables from schema design are present
- [ ] All foreign keys are defined
- [ ] All required indexes are present
- [ ] `init_db()` runs without errors on fresh database
- [ ] Seed data loads correctly
- [ ] Schema can be introspected without errors
- [ ] `test_db_init` passes

### Must NOT Proceed If
- Missing tables
- Foreign keys without ON DELETE behavior defined
- init_db fails

### Output
Green test: `test_db_init` + manual schema inspection

---

## Gate 3: Build Review Gate

**When**: After all modules are implemented

### Must Pass
- [ ] Application starts without errors
- [ ] All pages load without Python exceptions
- [ ] All 18 tests pass (Phase 1) / extended suite (Phase 2)
- [ ] No hardcoded credentials in code
- [ ] No TODO placeholders left in critical paths
- [ ] Imports resolve without circular dependency errors
- [ ] Mock AI returns valid structured responses for all agent calls

### Must NOT Proceed If
- Any test fails
- App fails to start
- Critical page errors

### Output
Full test run output with 0 failures

---

## Gate 4: Testing Review Gate

**When**: After test suite is complete

### Must Pass
- [ ] Unit tests for all services
- [ ] Integration test: CSV import → lead → AI analysis → draft → approval
- [ ] Error handling tests: AI failure, AdsPower failure, bad CSV
- [ ] All tests run in under 10 seconds total
- [ ] No test modifies production data
- [ ] Tests use isolated test database (temp path)

### Must NOT Proceed If
- Integration test fails
- Any test uses production DB
- Error handling tests show unhandled exceptions

### Output
TEST_REPORT.md with all tests listed and results

---

## Gate 5: Documentation Review Gate

**When**: After all documentation is written

### Must Pass
- [ ] README.md includes launch instructions
- [ ] LOCAL_SETUP.md complete
- [ ] FINAL_COMPLETION_REPORT.md complete
- [ ] All architecture docs (01-20) created and non-empty
- [ ] AGENTS.md describes all four agents
- [ ] ADSPOWER_INTEGRATION.md complete
- [ ] No broken internal links in docs

### Must NOT Proceed If
- Launch instructions missing
- Any required doc is a stub/empty
- FINAL_COMPLETION_REPORT is missing

### Output
docs/ directory review checklist

---

## Gate 6: Release Review Gate

**When**: Before tagging a release / pushing to main

### Must Pass
- [ ] All previous gates passed
- [ ] .gitignore excludes: data/, .env, __pycache__, *.pyc, *.db
- [ ] .env.example is committed (no real values)
- [ ] requirements.txt is pinned or at minimum specified
- [ ] No secrets in git history (run `git log --all -p | grep -i "password\|secret\|api_key"`)
- [ ] run_local.bat works on Windows
- [ ] App version number set in config/app.config.json

### Must NOT Proceed If
- Real credentials found in git
- .env committed
- SQLite DB file committed
- Tests failing

### Output
Git tag: `v1.0.0-phase1` with release notes
