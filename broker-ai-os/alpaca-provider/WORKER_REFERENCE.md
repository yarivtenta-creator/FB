# QUICK REFERENCE FOR ALL WORKERS

## YOUR SPECIFIC ASSIGNMENT

Find your name below and follow your task exactly.

---

## CODEX-1: PROVIDER REGISTRY & SAFE KEYS

**Mission**: Build credential-safe provider foundation

**Duration**: 2 hours  
**Status**: 🔲 NOT STARTED (start immediately)  
**Blocker**: None - unblock CODEX-2 when done  

**Files You Must Create**:
```
src/providers/registry.ts           ← Provider registry
src/providers/types.ts               ← Shared types
src/providers/safe-keys.ts           ← Safe key validator
src/providers/provider-metadata.ts   ← Provider info
src/providers/.env.example           ← Placeholder env
src/providers/test/provider-registry.test.ts
docs/PROVIDER_LAYER.md
```

**What to Build**:
- `registry.ts`: Map of all providers (Alpaca, etc)
- `types.ts`: Provider interface, types for data
- `safe-keys.ts`: Validator that blocks real secrets
- `provider-metadata.ts`: Name, endpoint, docs
- `.env.example`: Placeholder API keys (never real)
- Tests: All must pass

**When Done, Report**:
```
CODEX-1: COMPLETE
✓ Registry: src/providers/registry.ts
✓ Types: src/providers/types.ts
✓ SafeKeys: src/providers/safe-keys.ts
✓ Tests: {X} passing
Ready for CODEX-2
```

**Key Rules**:
- ✅ No real secrets anywhere
- ✅ TypeScript strict mode
- ✅ All tests must pass
- ✅ .env.example only placeholders

---

## CODEX-2: ALPACA MARKET DATA CLIENT

**Mission**: Read-only Alpaca quotes, bars, clock

**Duration**: 2.5 hours  
**Status**: 🔒 BLOCKED (starts when CODEX-1 done)  
**Blocker**: CODEX-1 must complete first  

**Files You Must Create**:
```
src/providers/alpaca/client.ts
src/providers/alpaca/paper-account.ts
src/providers/alpaca/types.ts
src/providers/alpaca/mock.ts
src/providers/alpaca/data-validator.ts
src/providers/alpaca/test/alpaca.test.ts
docs/ALPACA_ADAPTER.md
```

**What to Build**:
- `client.ts`: Market data client (getQuote, getBar, getClock)
- `paper-account.ts`: Read-only account and position access
- `types.ts`: Alpaca-specific types
- `mock.ts`: Mock data for testing
- `data-validator.ts`: Validate data integrity
- Tests: All must pass

**MUST HAVE Methods**:
- getQuote(symbol) → price data
- getBar(symbol) → OHLCV data
- getClock() → market hours
- getAccount() → paper account info (read-only)

**MUST NOT HAVE Methods**:
- submitOrder, executeOrder, cancelOrder
- closePosition, modifyOrder, anyExecute

**When Done, Report**:
```
CODEX-2: COMPLETE
✓ Client: src/providers/alpaca/client.ts
✓ No order methods: grep confirmed empty
✓ Tests: {X} passing
Ready for integration
```

**Key Rules**:
- ✅ Paper URL enforced
- ✅ Read-only access only
- ✅ Mock mode works
- ✅ No execution methods

---

## CODEX-3: PAPER ACCOUNT READER

**Mission**: Safe read-only paper account access

**Duration**: 1.5 hours  
**Status**: 🔲 NOT STARTED (start immediately)  
**Blocker**: None - ready for LOCAL-CLAUDE  

**Files You Must Create**:
```
src/providers/alpaca/account-reader.ts
src/providers/alpaca/position-reader.ts
src/providers/alpaca/test/account-reader.test.ts
docs/PAPER_ACCOUNT_READER.md
```

**What to Build**:
- `account-reader.ts`: Get cash, buying power, equity
- `position-reader.ts`: Get open positions and order history
- Tests: All must pass
- Docs: Usage and API

**MUST HAVE Methods**:
- getBalance() → {cash, buyingPower, equity}
- getPositions() → array of open positions
- getOrders() → historical order data

**MUST NOT HAVE Methods**:
- closePosition, modifyOrder, any writes
- execute, submit, cancel

**When Done, Report**:
```
CODEX-3: COMPLETE
✓ Account Reader: src/providers/alpaca/account-reader.ts
✓ Position Reader: src/providers/alpaca/position-reader.ts
✓ Paper mode verified
✓ Tests: {X} passing
Ready for integration
```

**Key Rules**:
- ✅ Paper mode only
- ✅ Read-only access
- ✅ No execution

---

## GEMINI-1: ARCHITECTURE REVIEW

**Mission**: Review Data Hub design (ANALYSIS ONLY)

**Duration**: 1.5 hours  
**Status**: 🔲 NOT STARTED (start immediately)  
**Type**: ANALYSIS ONLY - NO CODE CHANGES  

**File You Must Create**:
```
ARCHITECTURE_REVIEW.md
```

**What to Do**:
1. Review current system structure
2. Identify data flows
3. Find duplication risks
4. Note format inconsistencies
5. Recommend consolidation

**Format Required**:
- Markdown
- File:line references
- Specific, actionable recommendations
- Issues listed by priority

**When Done, Report**:
```
GEMINI-1: COMPLETE
✓ ARCHITECTURE_REVIEW.md ready
✓ Issues identified: {count}
✓ No code written
```

**Key Rules**:
- ✅ Analysis only
- ✅ No code changes
- ✅ Clear file:line references
- ✅ Actionable recommendations

---

## GEMINI-2: SECURITY & UNSAFE PATHS

**Mission**: Find all risky code and credentials (ANALYSIS ONLY)

**Duration**: 1.5 hours  
**Status**: 🔲 NOT STARTED (start immediately)  
**Type**: ANALYSIS ONLY - NO CODE CHANGES  

**Files You Must Create**:
```
SECURITY_AUDIT_REPORT.md
UNSAFE_PATHS_ANALYSIS.md
PROOF_NO_LIVE_ORDERS.txt
PROOF_NO_SECRETS.txt
```

**What to Do**:
1. Grep for execution methods
2. Grep for real credentials
3. Grep for unsafe patterns
4. Document all findings
5. Create proof files

**Grep Commands**:
```bash
grep -r "submitOrder\|executeOrder\|cancelOrder" src/
grep -r "sk_live_\|secret_\|api_key=" src/
grep -r "execute\|submit.*order" src/
```

**Expected Results**:
- All greps return EMPTY or comments only
- No real credentials anywhere
- No execution paths

**When Done, Report**:
```
GEMINI-2: COMPLETE
✓ SECURITY_AUDIT_REPORT.md ready
✓ UNSAFE_PATHS_ANALYSIS.md ready
✓ PROOF files ready
✓ No code written
```

**Key Rules**:
- ✅ Analysis only
- ✅ Create proof files
- ✅ Document findings
- ✅ No code changes

---

## GEMINI-3: SCHEDULER SAFETY

**Mission**: Review scheduling and timing (ANALYSIS ONLY)

**Duration**: 1 hour  
**Status**: 🔲 NOT STARTED (start immediately)  
**Type**: ANALYSIS ONLY - NO CODE CHANGES  

**Files You Must Create**:
```
SCHEDULER_SAFETY_ANALYSIS.md
FINAL_RECOMMENDATIONS.md
```

**What to Do**:
1. Review all scheduled tasks
2. Check timing and intervals
3. Review error handling
4. Check rate limits
5. Assess safety

**What to Include**:
- All scheduled tasks listed
- Timing analysis
- Safety assessment
- Specific recommendations
- Priority levels

**When Done, Report**:
```
GEMINI-3: COMPLETE
✓ SCHEDULER_SAFETY_ANALYSIS.md ready
✓ FINAL_RECOMMENDATIONS.md ready
✓ No code written
```

**Key Rules**:
- ✅ Analysis only
- ✅ Clear recommendations
- ✅ No code changes

---

## HIGGSFIELD-1: PROVIDER STATUS PANEL

**Mission**: Build provider status dashboard (UI ONLY)

**Duration**: 1 hour  
**Status**: 🔲 NOT STARTED (start immediately)  
**Type**: UI ONLY - NO BACKEND LOGIC  

**Files You Must Create**:
```
src/dashboard/provider-status-panel.tsx
src/dashboard/types.ts (add ProviderStatusData)
src/dashboard/test/provider-status-panel.test.tsx
docs/PROVIDER_STATUS_PANEL.md
```

**What to Build**:
- Provider status component
- Show: name, status badge, response time, uptime, freshness
- Call API: GET /api/providers/status
- Display health status

**When Done, Report**:
```
HIGGSFIELD-1: COMPLETE
✓ Provider Status Panel working
✓ Tests: {X} passing
✓ Ready for integration
```

**Key Rules**:
- ✅ UI only
- ✅ No backend logic
- ✅ Mock API calls
- ✅ All tests pass

---

## HIGGSFIELD-2: DATA READINESS + PAPER PANELS

**Mission**: Build two dashboard panels (UI ONLY)

**Duration**: 1.5 hours  
**Status**: 🔲 NOT STARTED (start immediately)  
**Type**: UI ONLY - NO BACKEND LOGIC  

**Files You Must Create**:
```
src/dashboard/data-readiness-panel.tsx
src/dashboard/paper-account-panel.tsx
src/dashboard/test/dashboard-panels.test.tsx
docs/DASHBOARD_PANELS.md
```

**What to Build**:

**Panel 1: Data Readiness**
- Show: Provider name, data quality %, validations
- Status badge: Ready/Not Ready
- Last validated timestamp
- Call API: GET /api/data-hub/status

**Panel 2: Paper Account**
- Show: Cash, buying power, equity
- Show: Day P/L (color: green/red), total P/L
- Show: Open positions table
- Call API: GET /api/paper-account/account, /api/paper-account/positions

**When Done, Report**:
```
HIGGSFIELD-2: COMPLETE
✓ Data Readiness Panel working
✓ Paper Account Panel working
✓ Tests: {X} passing
✓ Ready for integration
```

**Key Rules**:
- ✅ UI only
- ✅ No backend logic
- ✅ Mock API calls
- ✅ Color coding for P/L
- ✅ All tests pass

---

## LOCAL-CLAUDE: FINAL INTEGRATION & MERGE

**Mission**: Integrate all worker outputs, build Data Hub + Paper Bridge

**Duration**: 5 hours (after all workers done)  
**Status**: 🔒 BLOCKED (waiting for all workers)  

**Files You Must Create**:
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

**Your Phases**:

1. **Validate Inputs (30 min)**
   - Check all CODEX files present
   - Run all tests
   - Check no conflicts

2. **Data Hub (1 hour)**
   - Central router
   - Caching
   - Deduplication
   - Status tracking

3. **Paper Bridge (1 hour)**
   - Enforce paper mode
   - Block real execution
   - Startup verification
   - Signal routing

4. **Integration Tests (1 hour)**
   - End-to-end data flow
   - Signal routing
   - Dashboard integration
   - Safety enforcement

5. **Final Assembly (30 min)**
   - Merge UI components
   - Set up API endpoints
   - Run full test suite
   - TypeScript compile

**When Done, Report**:
```
LOCAL-CLAUDE: COMPLETE
✓ Data Hub: src/data-hub/
✓ Paper Bridge: src/governance/
✓ Integration: {X} tests passing
✓ Dashboard: Connected to APIs
✓ Document: FINAL_2024_INTEGRATION_COMPLETE.md
Ready for QA
```

---

## QA-SAFETY: FINAL VERIFICATION

**Mission**: Prove with 100% certainty system is safe

**Duration**: 1.5 hours (after LOCAL-CLAUDE done)  
**Status**: 🔒 BLOCKED (waiting for LOCAL-CLAUDE)  
**Type**: VERIFICATION ONLY - NO CODE CHANGES  

**Files You Must Create**:
```
FINAL_SAFETY_REPORT.md
QA_TEST_LOG.md
PROOF_NO_LIVE_ORDERS.txt
PROOF_NO_SECRETS.txt
PROOF_EXECUTION_ISOLATION.txt
FUNCTIONAL_TEST_REPORT.md
```

**Your Tests**:

1. **No Live Orders (30 min)**
   - grep -r "submitOrder\|executeOrder\|cancelOrder"
   - Result must be empty
   - Create PROOF_NO_LIVE_ORDERS.txt

2. **No Secrets (20 min)**
   - grep -r "sk_live_\|secret_\|api_key="
   - Result must be empty
   - Create PROOF_NO_SECRETS.txt

3. **Execution Isolation (20 min)**
   - Verify paper:true hardcoded
   - Verify executed:false
   - Create PROOF_EXECUTION_ISOLATION.txt

4. **Paper Trading Functional (20 min)**
   - Run end-to-end test
   - Verify data flow
   - Verify P&L tracking
   - Create FUNCTIONAL_TEST_REPORT.md

5. **Sign-Off (10 min)**
   - Create FINAL_SAFETY_REPORT.md
   - Clear PASS or FAIL
   - Deployment approval

**When Done, Report**:
```
QA-SAFETY: COMPLETE
✓ All proofs documented
✓ All tests passing
✓ No blockers found
✅ APPROVED FOR DEPLOYMENT
```

---

## SUMMARY TABLE

| Worker | Task | Duration | Status | Start |
|--------|------|----------|--------|-------|
| CODEX-1 | Provider Registry | 2 h | 🔲 Ready | Now |
| CODEX-2 | Alpaca Client | 2.5 h | 🔒 Blocked | After CODEX-1 |
| CODEX-3 | Paper Account | 1.5 h | 🔲 Ready | Now |
| GEMINI-1 | Architecture | 1.5 h | 🔲 Ready | Now |
| GEMINI-2 | Security | 1.5 h | 🔲 Ready | Now |
| GEMINI-3 | Scheduler | 1 h | 🔲 Ready | Now |
| HIGGSFIELD-1 | Provider Panel | 1 h | 🔲 Ready | Now |
| HIGGSFIELD-2 | Data + Account | 1.5 h | 🔲 Ready | Now |
| LOCAL-CLAUDE | Integration | 5 h | 🔒 Blocked | After all workers |
| QA-SAFETY | Verification | 1.5 h | 🔒 Blocked | After LOCAL-CLAUDE |

---

**FIND YOUR NAME AND EXECUTE YOUR TASK EXACTLY.**

No ambiguity. No scope creep. Execute and report.
