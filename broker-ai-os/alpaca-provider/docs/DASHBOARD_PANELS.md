# HIGGSFIELD Dashboard Panels
## Provider Status, Data Readiness, Paper Account Components

**Version**: 1.0  
**Component Type**: React TypeScript  
**Test Coverage**: 31 tests (HIGGSFIELD-1: 13, HIGGSFIELD-2: 18)  

---

## Overview

Dashboard panels provide real-time visibility into:
- **ProviderStatusPanel**: Provider health (Alpaca API status)
- **DataReadinessPanel**: Data source availability and latency
- **PaperAccountPanel**: Paper trading account balance and positions

All components enforce:
- ✅ Read-only data display (no trading UI)
- ✅ Paper trading only (no live account option)
- ✅ Mock data for offline testing
- ✅ Type-safe React with TypeScript

---

## Components

### 1. ProviderStatusPanel

**Purpose**: Display provider health and capabilities

**Props**:
```typescript
interface ProviderStatusPanelProps {
  className?: string;
  onStatusChange?: (status: DashboardState) => void;
}
```

**Features**:
- Real-time provider status (up, down, degraded)
- Response time monitoring
- Error rate tracking
- Capabilities display
- Read-only enforcement indicator

**Usage**:
```tsx
<ProviderStatusPanel
  className="panel"
  onStatusChange={(status) => console.log(status)}
/>
```

**Data Displayed**:
- Provider name (e.g., "alpaca")
- Status badge (✅ up, ⚠️ degraded, ❌ down)
- Last check time
- Response time in ms
- Error rate percentage
- Supported capabilities (quotes, bars, clock, account, positions)
- Read-only flag

**Tests**:
- ✅ 13 tests covering data types, status states, read-only verification
- ✅ Verifies no order execution in capabilities
- ✅ Verifies all providers are read-only

---

### 2. DataReadinessPanel

**Purpose**: Show data source availability and quality

**Props**:
```typescript
interface DataReadinessPanelProps extends PanelProps {
  onReadinessChange?: (status: DataReadinessStatus[]) => void;
}
```

**Features**:
- Multi-source status tracking
- Record count display
- Latency monitoring
- Ready/Not-Ready status
- Auto-refresh every 60 seconds

**Usage**:
```tsx
<DataReadinessPanel
  className="panel"
  onReadinessChange={(sources) => console.log(sources)}
/>
```

**Data Displayed Per Source**:
- Source name (e.g., "Alpaca Quotes")
- Ready status (ready / not-ready)
- Last update timestamp
- Record count
- Latency in milliseconds

**Tests**:
- ✅ Ready and not-ready status handling
- ✅ Multiple data sources tracking
- ✅ Latency value validation

---

### 3. PaperAccountPanel

**Purpose**: Display paper trading account details and position summary

**Props**:
```typescript
interface PaperAccountPanelProps extends PanelProps {
  onAccountChange?: (account: PaperAccountData) => void;
}
```

**Features**:
- Account balance display (cash, equity, buying power)
- Leverage calculation (buying power / cash)
- Position count tracking
- Pending order count
- Paper trading badge (enforced)
- Compliance notice

**Usage**:
```tsx
<PaperAccountPanel
  className="panel"
  onAccountChange={(account) => console.log(account)}
/>
```

**Data Displayed**:
- Account ID (e.g., "PA123456")
- Cash balance
- Equity (total account value)
- Buying power (leverage-adjusted)
- Leverage ratio (e.g., "4x")
- Open positions count
- Pending orders count
- Paper trading status (always shows true)
- Compliance notice

**Tests**:
- ✅ Paper trading always true verification
- ✅ Buying power leverage calculation
- ✅ Position and order tracking
- ✅ No live trading features present

---

## Data Types

### ProviderStatusData
```typescript
interface ProviderStatusData {
  name: string;              // e.g., "alpaca"
  status: 'up' | 'down' | 'degraded';
  lastCheck: Date;
  responseTime: number;      // milliseconds
  errorRate: number;         // 0-1
  capabilities: string[];    // ['quotes', 'bars', ...]
  readOnly: boolean;         // must be true
}
```

### DataReadinessStatus
```typescript
interface DataReadinessStatus {
  source: string;            // e.g., "Alpaca Quotes"
  ready: boolean;
  lastUpdate: Date;
  recordCount: number;
  latency: number;           // milliseconds
}
```

### PaperAccountData
```typescript
interface PaperAccountData {
  id: string;                // Account ID
  cash: number;              // Available cash
  buyingPower: number;       // 4x cash for margin
  equity: number;            // Total account value
  positions: number;         // Open positions
  orders: number;            // Pending orders
  paperTrading: boolean;     // Always true
}
```

---

## Safety Guarantees

✅ **Read-Only**: No trading UI elements  
✅ **Paper Trading**: Always shows paper: true  
✅ **No Secrets**: No API keys displayed  
✅ **Type Safe**: Full TypeScript typing  
✅ **Tested**: 31 tests verify behavior  

---

## Integration

### With Provider Registry
Panels consume ProviderRegistry output:
```typescript
import { ProviderRegistry } from '@providers/registry';

const registry = new ProviderRegistry();
const providers = registry.getAll();
// Display in ProviderStatusPanel
```

### With Data Hub (LOCAL-CLAUDE)
Panels receive normalized data from Data Hub:
```typescript
const data = dataHub.getProviderStatus();  // ProviderStatusData[]
const readiness = dataHub.getDataReadiness();  // DataReadinessStatus[]
const account = dataHub.getAccountData();  // PaperAccountData
```

### With Account Readers (CODEX-3)
Paper account data sourced from AccountReader:
```typescript
import { AlpacaAccountReader } from '@providers/alpaca/account-reader';

const reader = new AlpacaAccountReader(client);
const balance = await reader.getBalance();
// Display in PaperAccountPanel
```

---

## Testing

### Run All Dashboard Tests
```bash
npm run build
node --test dist/src/dashboard/test/*.js
```

### Test Results
- **HIGGSFIELD-1** (ProviderStatusPanel): 13 tests ✅
- **HIGGSFIELD-2** (DataReadiness + PaperAccount): 18 tests ✅
- **Total**: 31 tests, 100% pass rate

---

## Styling Guide

### CSS Classes

**ProviderStatusPanel**:
- `.provider-status-panel` - Main container
- `.providers-grid` - Grid layout
- `.provider-card` - Individual provider card
- `.status-<up|down|degraded>` - Status-specific styling
- `.status-badge` - Status badge
- `.capability-list` - Capabilities container
- `.capability-badge` - Individual capability

**DataReadinessPanel**:
- `.data-readiness-panel` - Main container
- `.readiness-grid` - Grid layout
- `.readiness-card` - Individual source card
- `.ready` - Ready status class
- `.not-ready` - Not-ready status class
- `.metrics` - Metrics section
- `.metric` - Individual metric

**PaperAccountPanel**:
- `.paper-account-panel` - Main container
- `.account-header` - Account ID and badge
- `.paper-badge` - Paper trading badge
- `.account-summary` - Summary cards section
- `.summary-card` - Individual card
- `.positions-section` - Position status section
- `.position-stats` - Statistics container
- `.compliance-notice` - Compliance message

---

## Browser Compatibility

Components built with:
- React 18+
- TypeScript 5+
- ESM modules
- Flexbox layout
- CSS Grid

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Historical price charts
- [ ] Position P&L breakdown
- [ ] Order history view
- [ ] Responsive mobile layout
- [ ] Dark mode support
- [ ] Export account statement
- [ ] Alerts for status changes

---

## Troubleshooting

**Panel shows loading indefinitely**:
- Check data hub connection
- Verify mock data is available
- Check browser console for errors

**Paper trading badge not showing**:
- Verify account data has paperTrading: true
- Check PaperAccountData type from types.ts

**Latency values seem wrong**:
- Mock data uses fixed values
- Live data depends on actual API response times

---

## References

- [CODEX-1: Provider Registry](./PROVIDER_LAYER.md)
- [CODEX-3: Account Readers](./PAPER_ACCOUNT_READER.md)
- [LOCAL-CLAUDE: Data Hub Integration](./FINAL_2024_INTEGRATION_COMPLETE.md)

---

**End of HIGGSFIELD Dashboard Panels Documentation**
