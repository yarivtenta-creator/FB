# Broker AI OS V2 - Safe Paper Trading System

Safe paper trading system with real read-only provider data connections.

## Quick Start

This project is built using a **parallel orchestration model** where multiple workers complete tasks simultaneously:

1. **CODEX Workers** (3): Provider layer, Alpaca client, paper account reader
2. **GEMINI Workers** (3): Architecture review, security audit, scheduler safety
3. **HIGGSFIELD Workers** (2): Dashboard UI components
4. **LOCAL-CLAUDE** (1): Integration manager and Data Hub builder
5. **QA-SAFETY** (1): Final verification and sign-off

## Project Structure

```
/home/user/FB/
├── src/
│   ├── providers/          # CODEX-1 output
│   │   ├── alpaca/         # CODEX-2 and CODEX-3 output
│   │   └── test/
│   ├── data-hub/           # LOCAL-CLAUDE implementation
│   ├── governance/         # LOCAL-CLAUDE implementation
│   ├── dashboard/          # HIGGSFIELD-1 and HIGGSFIELD-2 output
│   └── tests/
│       └── integration/    # LOCAL-CLAUDE implementation
├── docs/                   # All worker documentation
├── package.json           # Base configuration
├── tsconfig.json          # TypeScript configuration
└── ORCHESTRATION_STATUS.md # Current progress tracking
```

## Safety Constraints (Non-Negotiable)

✅ **REQUIRED**:
- Paper trading only (paper:true hardcoded)
- Read-only provider data only
- All credentials in .env (never in code)
- All tests must pass
- No execution of real orders

❌ **FORBIDDEN**:
- Live trading code
- Real order submission methods
- Hardcoded API keys or secrets
- Direct broker execution

## Build & Test

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run all tests
npm test

# Run specific test suites
npm run test:providers    # CODEX tests
npm run test:data-hub     # Data Hub tests
npm run test:governance   # Paper Bridge tests
npm run test:integration  # Integration tests
```

## Orchestration Status

See **ORCHESTRATION_STATUS.md** for detailed progress on each worker's task.

## Expected Timeline

- **Parallel Phase** (T+0 to T+2.5h): CODEX, GEMINI, HIGGSFIELD workers
- **Integration Phase** (T+2.5h to T+7.5h): LOCAL-CLAUDE merges all outputs
- **QA Phase** (T+7.5h to T+9h): Final safety verification
- **Total Wall Time**: ~9 hours

## Next Steps

1. Review **ORCHESTRATION_STATUS.md**
2. Review **/tmp/FINAL_2024_ORCHESTRATION/README.md** for detailed instructions
3. Distribute worker task cards to respective workers
4. Track completion in ORCHESTRATION_STATUS.md
5. Proceed to integration phase when all workers complete

## Important Files

- **ORCHESTRATION_STATUS.md** - Current progress and test status
- **/tmp/FINAL_2024_ORCHESTRATION/** - Complete orchestration package with all worker prompts

---

**System Ready for 2024 Deployment**