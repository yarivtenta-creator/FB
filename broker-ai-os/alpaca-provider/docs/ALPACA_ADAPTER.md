# Alpaca Read-Only Adapter

## Overview

Safe, read-only Alpaca market data adapter. Provides real-time quotes, historical bars, market hours, and paper account access with **zero ability to execute orders**.

## Architecture

- **Client** (`client.ts`): Market data fetching - quotes, bars, clock
- **PaperAccount** (`paper-account.ts`): Paper account reader - balance, positions, order history
- **Mock** (`mock.ts`): Offline testing with realistic mock data
- **DataValidator** (`data-validator.ts`): Data quality validation

## Safety Constraints

✅ **Guaranteed**:
- No order execution methods exist
- Paper trading URL only (`https://paper-api.alpaca.markets`)
- Read-only access enforced
- All data validated before return
- No credentials in logs

❌ **Forbidden**:
- `submitOrder()` - Does not exist
- `cancelOrder()` - Does not exist
- `modifyOrder()` - Does not exist
- `closePosition()` - Does not exist
- Live trading URL - Rejected at startup
- Order execution of any kind

## Usage

### Basic Market Data

```typescript
import { AlpacaClient } from './src/providers/alpaca/client.js';
import { SafeKeys } from './src/providers/safe-keys.js';

// Load credentials from environment
const config = SafeKeys.loadFromEnv('ALPACA');

// Create client in live mode
const client = new AlpacaClient(config, false);

// Fetch real-time quote
const quote = await client.getQuote('AAPL');
console.log(`AAPL: ${quote.bid} bid x ${quote.ask} ask`);

// Fetch historical bar
const bar = await client.getBar('AAPL', '1h');
console.log(`AAPL 1h: O=${bar.open} H=${bar.high} L=${bar.low} C=${bar.close}`);

// Get market hours
const clock = await client.getClock();
console.log(`Market ${clock.isOpen ? 'open' : 'closed'}`);
```

### Paper Account Access

```typescript
import { AlpacaPaperAccount } from './src/providers/alpaca/paper-account.js';

const account = new AlpacaPaperAccount(client);

// Get account balance (paper trading only)
const balance = await account.getBalance();
console.log(`Cash: $${balance.cash}, Buying Power: $${balance.buyingPower}`);

// Get open positions
const positions = await account.getPositions();
positions.forEach(p => {
  console.log(`${p.symbol}: ${p.quantity} shares @ $${p.currentPrice}`);
});

// Get order history
const orders = await account.getOrders();
orders.forEach(o => {
  console.log(`${o.symbol}: ${o.quantity} @ $${o.price} (${o.status})`);
});
```

### Mock Mode (Offline Testing)

```typescript
// Create client in mock mode
const mockClient = new AlpacaClient(config, true);

// Returns realistic mock data, no network calls
const quote = await mockClient.getQuote('AAPL');
const bar = await mockClient.getBar('AAPL', '1h');
const account = await mockClient.getAccount();

// All data is valid and self-consistent
console.log(`Mock quote valid: ${quote.bid < quote.ask}`);
console.log(`Mock account in paper mode: ${account.paperTrading}`);
```

## Data Types

### Quote
```typescript
{
  symbol: string;       // e.g., 'AAPL'
  bid: number;          // Best bid price
  bidSize: number;      // Bid size
  ask: number;          // Best ask price
  askSize: number;      // Ask size
  last: number;         // Last trade price
  lastSize: number;     // Last trade size
  timestamp: Date;      // Quote timestamp
}
```

### Bar
```typescript
{
  symbol: string;       // e.g., 'AAPL'
  open: number;         // Opening price
  high: number;         // Highest price
  low: number;          // Lowest price
  close: number;        // Closing price
  volume: number;       // Trade volume
  timestamp: Date;      // Bar timestamp
}
```

### Account
```typescript
{
  id: string;           // Account ID
  cash: number;         // Available cash
  buyingPower: number;  // Buying power (4x for margin)
  equity: number;       // Total equity
  paperTrading: boolean; // Always true (enforced)
}
```

### Position
```typescript
{
  symbol: string;       // Stock symbol
  quantity: number;     // Number of shares
  entryPrice: number;   // Average entry price
  currentPrice: number; // Current market price
  unrealizedGain: number; // P&L on position
}
```

## Data Validation

All data is automatically validated:

```typescript
// Quote validation
// - Bid must be > 0
// - Ask must be > bid
// - All sizes must be >= 0

// Bar validation
// - Open, close, volume must be > 0
// - High must be >= max(open, close)
// - Low must be <= min(open, close)

// Account validation
// - Must be in paper trading mode
// - Cash, buying power, equity must be >= 0
```

## Error Handling

```typescript
try {
  const client = new AlpacaClient(liveConfig, false);
  // Will throw: "SAFETY: Must use paper trading URL"
} catch (error) {
  console.error(error.message);
}

try {
  const quote = await client.getQuote('INVALID');
  // Will throw if quote data is invalid
} catch (error) {
  console.error('Data validation failed:', error.message);
}
```

## Testing

### Run all Alpaca tests

```bash
npm run build
node --test dist/src/providers/alpaca/test/*.js
```

### Test coverage

- ✅ Safety: Paper URL enforced, no order methods
- ✅ Market data: Quotes, bars, clock functionality
- ✅ Data validation: All inputs and outputs validated
- ✅ Mock mode: Offline testing works without API
- ✅ Paper account: Paper mode enforced, read-only access
- ✅ Consistency: Data relationships validated

## Security Proof

### No Order Execution Possible

**Grep confirmation**: No order methods implemented

```bash
$ grep -r "submitOrder\|cancelOrder\|executeOrder\|closePosition" src/providers/alpaca/
(returns nothing)
```

### Paper Trading Enforced

**Verified**: Constructor throws if live URL detected

```typescript
if (!mockMode && !config.baseUrl.includes('paper')) {
  throw new Error('SAFETY: Must use paper trading URL...');
}
```

### Paper Mode Verified

**Guaranteed**: Account validation enforces `paperTrading: true`

```typescript
if (!account.paperTrading) {
  throw new Error('SAFETY: Account is not in paper trading mode');
}
```

## Performance

- **Live mode**: Network latency depends on Alpaca API
- **Mock mode**: Sub-millisecond responses (no network)
- **Data validation**: < 1ms per validation
- **Memory**: Minimal - each quote/bar is ~200 bytes

## Rate Limits

Alpaca market data API limits:
- 200 requests per minute
- Burst limits may apply

Mock mode has no limits.

## Future Enhancements

- WebSocket support for real-time data streaming
- Multi-symbol batch quotes
- Intraday aggregate bars
- Advanced order history filters
- Portfolio analytics

## Troubleshooting

### "Must use paper trading URL"

**Problem**: Live trading URL detected  
**Solution**: Ensure `ALPACA_BASE_URL` in `.env` is `https://paper-api.alpaca.markets`

```env
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # ✅ Correct
ALPACA_BASE_URL=https://api.alpaca.markets        # ❌ Wrong
```

### "Not in paper trading mode"

**Problem**: Account not in paper mode  
**Solution**: This should never happen with Alpaca paper accounts. Verify account config.

### "Invalid bid price" or "Bid > ask"

**Problem**: Quote data failed validation  
**Solution**: Try mock mode to test offline. Real API may have temporary issues.

```typescript
const mockClient = new AlpacaClient(config, true);
const quote = await mockClient.getQuote('AAPL');
```

## References

- [Alpaca API Documentation](https://alpaca.markets/docs/api-references/)
- [Alpaca Paper Trading](https://alpaca.markets/docs/trading/paper-trading/)
- [Market Data API](https://alpaca.markets/docs/api-references/market-data-api/)

---

**Built for safety. Read-only by design.**
