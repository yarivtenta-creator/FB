# 2024 ORCHESTRATION COORDINATOR GUIDE

## OVERVIEW

This is a **9-worker parallel orchestration** to safely complete Broker AI OS V2 for paper trading with real read-only provider data.

**Total Wall Time**: ~9 hours (vs 20+ sequential)  
**Parallel Efficiency**: 7 workers simultaneously, ~2 dependent chains

---

## HOW THIS WORKS

### Work is Divided by Task Type and Dependency

**CODEX Workers** (Code Implementation):
- CODEX-1: Provider Registry (builds foundation)
- CODEX-2: Alpaca Client (blocked until CODEX-1 done)
- CODEX-3: Paper Account Reader (independent)

**GEMINI Workers** (Analysis & Review - No Code):
- GEMINI-1: Architecture Review
- GEMINI-2: Security & Unsafe Paths
- GEMINI-3: Scheduler Safety

**HIGGSFIELD Workers** (UI Implementation):
- HIGGSFIELD-1: Provider Status Panel
- HIGGSFIELD-2: Data Readiness + Paper Account Panels

**LOCAL-CLAUDE** (This session - Integration Manager):
- Waits for all workers
- Builds Data Hub (central routing)
- Builds Paper Bridge (execution guard)
- Runs integration tests
- Merges everything

**QA-SAFETY** (Final Verification):
- Proves zero live orders possible
- Proves zero secrets in code
- Proves execution isolation
- Proves paper trading functional
- Provides deployment approval

---

## EXECUTION TIMELINE

### T+0: Parallel Phase Starts

**These 7 tasks start simultaneously**:
- CODEX-1 (2 hrs) ← CODEX-2 waits on this
- CODEX-3 (1.5 hrs) ← Independent
- GEMINI-1 (1.5 hrs) ← Independent
- GEMINI-2 (1.5 hrs) ← Independent
- GEMINI-3 (1 hr) ← Independent
- HIGGSFIELD-1 (1 hr) ← Independent
- HIGGSFIELD-2 (1.5 hrs) ← Independent

### T+1h: CODEX-1 Complete

CODEX-2 is unblocked and starts work (needs CODEX-1's files).

### T+2.5h: All Parallel Workers Complete

- CODEX-1: Done
- CODEX-2: Done (started at T+2h, done at T+4.5h... wait, this goes longer)
- CODEX-3: Done
- GEMINI-1, 2, 3: Done
- HIGGSFIELD-1, 2: Done

**Actually**: CODEX-2 finishes at T+4.5h (2h for CODEX-1 + 2.5h for CODEX-2). So workers complete between T+1.5h and T+4.5h.

LOCAL-CLAUDE can start once ALL outputs available.

### T+5h: LOCAL-CLAUDE Integration Starts

Wait for latest worker (CODEX-2 at T+4.5h), then:
- Phase 1: Validate inputs (30 min)
- Phase 2: Build Data Hub (1 hour)
- Phase 3: Build Paper Bridge (1 hour)
- Phase 4: Integration tests (1 hour)
- Phase 5: Final assembly (30 min)

### T+10h: LOCAL-CLAUDE Complete

All code integrated, all tests passing, ready for QA.

### T+10.5h: QA-SAFETY Starts

5 tests, 1.5 hours total:
- No Live Orders test (30 min)
- No Secrets test (20 min)
- Execution Isolation test (20 min)
- Functional test (20 min)
- Sign-off (10 min)

### T+12h: DEPLOYMENT READY ✅

---

## KEY PRINCIPLES

### 1. Scope Isolation

Each worker has EXACTLY one scope:

**CODEX**: Code ONLY
- Write TypeScript
- Create files in exact paths
- Write unit tests
- Document output

**GEMINI**: Analysis ONLY
- Read existing code
- No modifications
- Produce markdown reports
- Reference file:line numbers

**HIGGSFIELD**: UI ONLY
- React components
- No backend logic
- Test UI behavior
- Mock API calls

**LOCAL-CLAUDE**: Integration ONLY
- Merge outputs
- Build infrastructure
- Run integration tests
- No feature development

**QA**: Verification ONLY
- Run tests
- Produce proof files
- Verify constraints
- No code changes

### 2. Dependency Management

**Hard Dependencies** (one must finish before other starts):
- CODEX-1 must complete before CODEX-2 starts
- All parallel workers must complete before LOCAL-CLAUDE
- LOCAL-CLAUDE must complete before QA-SAFETY

**No Dependencies** (can start immediately):
- CODEX-3, GEMINI-1, GEMINI-2, GEMINI-3, HIGGSFIELD-1, HIGGSFIELD-2 all independent

### 3. File Paths (Exact)

**CODEX-1 Files**:
```
src/providers/registry.ts
src/providers/types.ts
src/providers/safe-keys.ts
src/providers/provider-metadata.ts
src/providers/.env.example
src/providers/test/provider-registry.test.ts
docs/PROVIDER_LAYER.md
```

**CODEX-2 Files**:
```
src/providers/alpaca/client.ts
src/providers/alpaca/paper-account.ts
src/providers/alpaca/types.ts
src/providers/alpaca/mock.ts
src/providers/alpaca/data-validator.ts
src/providers/alpaca/test/alpaca.test.ts
docs/ALPACA_ADAPTER.md
```

**CODEX-3 Files**:
```
src/providers/alpaca/account-reader.ts
src/providers/alpaca/position-reader.ts
src/providers/alpaca/test/account-reader.test.ts
docs/PAPER_ACCOUNT_READER.md
```

**GEMINI Files** (reports only):
```
ARCHITECTURE_REVIEW.md
SECURITY_AUDIT_REPORT.md
UNSAFE_PATHS_ANALYSIS.md
SCHEDULER_SAFETY_ANALYSIS.md
FINAL_RECOMMENDATIONS.md
PROOF_NO_LIVE_ORDERS.txt
PROOF_NO_SECRETS.txt
```

**HIGGSFIELD-1 Files**:
```
src/dashboard/provider-status-panel.tsx
src/dashboard/types.ts (add ProviderStatusData)
src/dashboard/test/provider-status-panel.test.tsx
docs/PROVIDER_STATUS_PANEL.md
```

**HIGGSFIELD-2 Files**:
```
src/dashboard/data-readiness-panel.tsx
src/dashboard/paper-account-panel.tsx
src/dashboard/test/dashboard-panels.test.tsx
docs/DASHBOARD_PANELS.md
```

**LOCAL-CLAUDE Files**:
```
src/data-hub/hub.ts
src/data-hub/normalizer.ts
src/data-hub/test/data-hub.test.ts
src/governance/paper-bridge.ts
src/governance/execution-guard.ts
src/governance/test/paper-bridge.test.ts
src/tests/integration/end-to-end.test.ts
FINAL_2024_INTEGRATION_COMPLETE.md
```

**QA Files**:
```
FINAL_SAFETY_REPORT.md
QA_TEST_LOG.md
PROOF_NO_LIVE_ORDERS.txt
PROOF_NO_SECRETS.txt
PROOF_EXECUTION_ISOLATION.txt
FUNCTIONAL_TEST_REPORT.md
```

### 4. Safety Constraints (Non-Negotiable)

These apply to ALL workers, ZERO exceptions:

✅ **MUST HAVE**:
- Paper trading only (hardcoded: `paper: true`)
- Read-only provider data (no execute methods)
- .env.example with placeholders (never real secrets)
- All tests passing
- TypeScript strict mode
- No credentials in code

❌ **MUST NOT HAVE**:
- Live trading code
- Order execution methods (submitOrder, cancelOrder, executeOrder)
- Real API keys or secrets
- Broker execution paths (T4, Plus500, FIX)
- Direct signal submission to orders

### 5. Testing Requirements

**Each worker must run tests**:

CODEX:
```bash
npm run test:providers    # Test CODEX-1 output
npm run test:alpaca       # Test CODEX-2 and CODEX-3 output
```

GEMINI:
- No tests (analysis only)

HIGGSFIELD:
```bash
npm test                  # Test components render
```

LOCAL-CLAUDE:
```bash
npm run test:data-hub     # Data Hub tests
npm run test:governance   # Paper Bridge tests
npm run test:integration  # End-to-end integration tests
```

QA:
```bash
npm test                  # Run all tests
grep submitOrder ...      # Verify no execution
grep sk_live_ ...         # Verify no secrets
```

### 6. Acceptance Criteria

**CODEX Workers**:
- ✅ All files created in exact paths
- ✅ All tests pass
- ✅ No secrets in code
- ✅ TypeScript compiles without errors
- ✅ Strict mode enabled

**GEMINI Workers**:
- ✅ Reports created
- ✅ File:line references provided
- ✅ Issues clearly identified
- ✅ Recommendations actionable

**HIGGSFIELD Workers**:
- ✅ Components render
- ✅ Correct API calls made
- ✅ Tests pass
- ✅ No backend logic
- ✅ Responsive design

**LOCAL-CLAUDE**:
- ✅ All inputs validated
- ✅ Data Hub working
- ✅ Paper Bridge enforced
- ✅ All integration tests pass
- ✅ System compiles and runs

**QA-SAFETY**:
- ✅ All proofs documented
- ✅ Zero security issues
- ✅ Deployment approved or blocked
- ✅ Clear sign-off

---

## HOW TO TRACK PROGRESS

Update **ORCHESTRATION_STATUS.md** as workers complete:

```markdown
#### CODEX-1: Provider Registry & Safe Keys
- **Status**: ✅ COMPLETE
- **Completion Report**: 
  - Registry: src/providers/registry.ts
  - Tests: 42 passing
  - Ready for CODEX-2
```

---

## IF THINGS GO WRONG

### Worker Can't Complete

1. Document the specific blocker
2. Reference file:line that's blocked
3. Flag to LOCAL-CLAUDE immediately
4. Don't work around it

### Test Fails

1. Fix the root cause
2. Re-run tests
3. Confirm it passes
4. Report completion

### Safety Violation

1. Stop immediately
2. Fix the violation
3. Re-test
4. Document the fix

### Merge Conflict

1. Identify conflicting files
2. Communicate with relevant workers
3. Resolve cleanly
4. Test after merge

---

## SUCCESS CHECKLIST

✅ All workers report completion  
✅ All outputs in correct paths  
✅ All tests passing  
✅ No security issues  
✅ System compiles clean  
✅ Paper trading verified  
✅ QA provides deployment approval  
✅ FINAL_2024_READY.md created  

---

## FINAL OUTPUT

When complete:

**FINAL_2024_READY.md**
- System complete and verified
- All tests passing
- Safety audit approved
- Ready for user deployment
- Startup instructions
- Monitoring recommendations

---

**This orchestration is designed to succeed. Execute it with confidence.**
