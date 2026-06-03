# KNOWN_LIMITATIONS.md
## What This Project Is & Isn't - June 3, 2026

---

## PROJECT TYPE

### What This Is
**Library/Backend Module** - A Node.js TypeScript library providing:
- Provider registration and credential validation
- Read-only data access from brokers (Alpaca implementation)
- Paper trading enforcement at all layers
- Type-safe access control

### What This Is NOT
- ❌ Express.js REST API server
- ❌ Frontend application
- ❌ Runnable CLI tool
- ❌ Browser-based dashboard
- ❌ Standalone service

---

## WHY ENDPOINTS DON'T EXIST

### No REST API Implementation
```
Expected endpoints (NOT implemented):
- /api/data/hub/health         ❌ Not present
- /api/data/providers          ❌ Not present
- /api/data/signals            ❌ Not present
- /api/data/signals/ranked     ❌ Not present
- /api/data/paper/stats        ❌ Not present
```

**Reason**: This project is a **library**, not a server. It exports classes and interfaces for other applications to use:

```typescript
// How it's meant to be used:
import { ProviderRegistry } from './providers/registry.js';
import { DataHub } from './data-hub/hub.js';

const registry = new ProviderRegistry();
const hub = new DataHub({ registry });
// Now use hub in your application...
```

### Package.json Shows Library, Not Server
```json
{
  "name": "broker-ai-os-v2",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "node --test",
    "dev": "tsc --watch"
  }
}
```

**No**: `"start"`, `"serve"`, or `"dev"` scripts that launch a server  
**Result**: Cannot call endpoints that don't exist

---

## ARCHITECTURE LIMITATIONS

### 1. No Server Framework
- ❌ Express.js not installed
- ❌ No HTTP routing
- ❌ No middleware
- ❌ No port listening

**Check**: `npm ls | grep express` → (not found)

### 2. No Database
- ❌ No database connection
- ❌ No persistent storage
- ❌ No session management
- ❌ In-memory only

### 3. No Authentication
- ❌ No JWT tokens
- ❌ No API keys
- ❌ No user sessions
- ❌ Credentials come from environment

### 4. No Real Alpaca Integration
- ✅ AlpacaClient structure exists
- ❌ Does not connect to real Alpaca API
- ❌ Uses mock data only
- ❌ Mock mode hardcoded to true

Check: `src/providers/alpaca/client.ts`
```typescript
const isMockMode = true; // Always true - never connects to real API
```

---

## WHAT WORKS (Testing Only)

### ✅ Unit Tests
- Test provider registration
- Test credential validation
- Test data reading
- Test safety constraints
- Run via: `npm test`

### ✅ Type Checking
- Verify type safety
- Verify read-only enforcement
- Verify paper trading requirement
- Run via: `npm run build`

### ✅ Integration Tests
- Test component interaction
- Test data flow
- Test execution blocking
- Included in `npm test`

---

## WHAT DOESN'T WORK (Requiring Server)

### ❌ HTTP Endpoints
Cannot access because no server exists

### ❌ Live Data
Mock data only, never fetches real data

### ❌ Browser Dashboard
React components removed (no browser environment)

### ❌ API Integration
No HTTP client in architecture

### ❌ Real Order Blocking
(This is actually good - no execution possible to begin with)

---

## SAFETY IMPLICATIONS

### Good News
Because this is library-only:
- ✅ No HTTP attack surface
- ✅ No network exposure
- ✅ Cannot accidentally broadcast secrets
- ✅ Type system fully enforced
- ✅ All constraints compile-time verified

### Trade-Off
To actually use this library, you must:
1. Import it into your application
2. Build your own server/UI layer
3. Handle HTTP/network security yourself
4. Ensure credential environment variables

---

## TECHNICAL LIMITATIONS

### 1. TypeScript Strict Mode
- Requires strict null checking
- Requires explicit types
- Prevents accidental null access
- Good for safety, slightly verbose

### 2. Module System (ESM)
- Uses ES modules (import/export)
- Not compatible with CommonJS (require)
- Requires Node 14+
- Check: `"type": "module"` in package.json

### 3. Mock Data Only
```typescript
// From alpaca-mock.ts
export const mockAccountData = {
  account_number: '...',
  buying_power: 100000,
  cash: 50000,
  equity: 100000,
  paperTrading: true,  // Always true
  // ... never fetches real data
};
```

### 4. Single Provider (Alpaca)
- Only Alpaca implemented
- Type system supports multiple providers
- Would need to add:
  - Additional client implementations
  - Additional reader implementations
  - Additional mock data

---

## TO CREATE A FULL APPLICATION

Would need to add:
```
1. Server Layer (Express.js or similar)
   - HTTP routing
   - Endpoint handlers
   - Authentication/authorization

2. Frontend Layer
   - React components
   - Dashboard UI
   - WebSocket for real-time

3. Storage Layer
   - Database (PostgreSQL, MongoDB)
   - Caching (Redis)
   - Audit logs

4. Integration Layer
   - Real Alpaca API calls
   - Webhook handlers
   - Event streaming

5. Deployment
   - Docker containerization
   - CI/CD pipeline
   - Production hosting

Estimated: 2-4 weeks of development
```

---

## CURRENT USAGE

### What You Can Do NOW
```typescript
// Import and use as a library
import { ProviderRegistry } from 'broker-ai-os-v2';
import { DataHub } from 'broker-ai-os-v2';

const registry = new ProviderRegistry();
const hub = new DataHub({ registry });

// Read-only data operations only
const account = await hub.getAccountData();
const positions = await hub.getPositionsData();

// All safety constraints enforced
// - No order execution possible
// - Paper trading guaranteed
// - Read-only verified
```

### What You CANNOT Do NOW
```typescript
// These will never work (no HTTP server)
fetch('/api/data/hub/health')  ❌ 404 Not Found
fetch('/api/data/providers')   ❌ 404 Not Found

// These will never work (no execution methods)
await hub.submitOrder(...)      ❌ Method doesn't exist
await hub.cancelOrder(...)      ❌ Method doesn't exist
await hub.closePosition(...)    ❌ Method doesn't exist
```

---

## DEPLOYMENT STATUS

| Aspect | Status | Why |
|--------|--------|-----|
| Code compiled | ✅ | TypeScript compiles cleanly |
| Tests passing | ✅ | 119 tests pass |
| Safety verified | ✅ | No execution methods |
| Type safe | ✅ | Strict mode enforced |
| Paper trading enforced | ✅ | 5 layers of enforcement |
| Secrets protected | ✅ | Environment variables only |
| Server ready | ❌ | No HTTP framework |
| Endpoints available | ❌ | No server implementation |
| API integration | ❌ | No real Alpaca calls |
| Browser UI | ❌ | React components removed |
| Runnable app | ❌ | Library only, not standalone |

---

## NEXT STEPS FOR FULL DEPLOYMENT

1. **Add Server Layer** (Express.js)
   - Implement HTTP endpoints
   - Add authentication
   - Add rate limiting

2. **Add Frontend** (React)
   - Restore dashboard components
   - Add real-time updates
   - Add user authentication

3. **Add Database** (PostgreSQL)
   - Store provider configs
   - Log transactions
   - Audit trail

4. **Connect Real APIs** (Alpaca)
   - Replace mock mode
   - Add real credential validation
   - Implement webhook handlers

5. **Deploy** (Docker/Cloud)
   - Containerize
   - Set up CI/CD
   - Deploy to production

---

## SUMMARY

✅ **Library code is production-safe**:
- Zero order execution methods
- Paper trading enforced
- Read-only verified
- Type system enforced
- 119 tests passing

❌ **Application wrapper is not present**:
- No server framework
- No HTTP endpoints
- No database
- No real integrations
- No UI

**Conclusion**: This is a solid foundation library that needs server/UI layers to become a complete application.

