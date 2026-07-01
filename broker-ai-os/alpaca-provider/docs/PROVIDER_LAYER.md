# Provider Connection Layer

## Overview

Centralized, safe provider management system that handles credentials securely and enables any future provider to be added without exposing secrets.

## Architecture

The provider layer consists of four main components:

- **Registry** (`registry.ts`): Central provider management - register, retrieve, and monitor providers
- **SafeKeys** (`safe-keys.ts`): Credential security - validates, loads, and redacts sensitive data
- **Types** (`types.ts`): Interface definitions - TypeScript interfaces for all provider concepts
- **Metadata** (`provider-metadata.ts`): Provider documentation - capabilities, endpoints, rate limits

## Core Concepts

### Provider
A provider is a data source (e.g., Alpaca market data). Each provider:
- Connects and disconnects
- Reports status (up/down/degraded)
- Supports specific capabilities (quotes, bars, account, positions, etc.)
- Is read-only (no order execution)

### Capabilities
Each provider exposes specific capabilities:
- `quotes` - Current price data
- `bars` - OHLCV bar data
- `clock` - Market hours and status
- `account` - Paper account information
- `positions` - Current holdings
- `orders_historical` - Order history (read-only)

### Safety Constraints
- ✅ All providers are read-only
- ✅ No credentials in code (always in .env)
- ✅ Real credentials rejected at validation
- ✅ Secrets redacted from logs
- ✅ Strict TypeScript types

## Usage

### Basic Setup

```typescript
import { ProviderRegistry } from './providers/registry.js';
import { SafeKeys } from './providers/safe-keys.js';

// Create registry
const registry = new ProviderRegistry();

// Load provider config from environment
const alpacaConfig = SafeKeys.loadFromEnv('ALPACA');

// Create and register provider
const provider = new AlpacaProvider(alpacaConfig);
registry.register(provider);

// Get provider
const alpaca = registry.get('alpaca');

// Get all provider statuses
const statuses = registry.getStatus();
```

### Adding a New Provider

1. **Define the type** in `types.ts`:
```typescript
export interface NewProviderConfig extends ProviderConfig {
  customField?: string;
}
```

2. **Create the provider class**:
```typescript
export class NewProvider implements Provider {
  name: string;
  config: ProviderConfig;
  
  async connect(): Promise<void> { /* ... */ }
  async disconnect(): Promise<void> { /* ... */ }
  getStatus(): ProviderStatus { /* ... */ }
}
```

3. **Register in provider-metadata.ts**:
```typescript
export const PROVIDERS_METADATA: Record<string, ProviderMetadata> = {
  alpaca: { /* ... */ },
  newprovider: {
    name: 'New Provider',
    description: '...',
    capabilities: ['quotes', 'bars'],
    documentation: '...',
    isReadOnly: true,
    rateLimits: '...',
    dataLatency: 'Real-time',
  },
};
```

4. **Add environment variables** to `.env.example`:
```env
NEWPROVIDER_API_KEY=<placeholder>
NEWPROVIDER_SECRET_KEY=<placeholder>
NEWPROVIDER_BASE_URL=https://api.newprovider.com
```

5. **Create tests** in `test/` directory

6. **Register in initialization code**:
```typescript
registry.register(new NewProvider(SafeKeys.loadFromEnv('NEWPROVIDER')));
```

## Security

### Credential Validation

SafeKeys validates credentials to prevent accidental use of live keys:

```typescript
SafeKeys.validate(config); // Throws if real credentials detected
```

Rejects:
- Keys containing 'sk_live_' or 'secret_'
- Keys containing 'real'
- Placeholder values from .env.example

### Log Safety

Always redact credentials before logging:

```typescript
const config = SafeKeys.loadFromEnv('ALPACA');
const safe = SafeKeys.preventLogging(config);
console.log(safe); // apiKey: '[REDACTED]', secretKey: '[REDACTED]'
```

### Environment Configuration

Never commit real credentials. Use `.env.example` with placeholders:

```env
# ✅ Good
ALPACA_API_KEY=<your-read-only-api-key-here>

# ❌ Bad
ALPACA_API_KEY=pk_live_abc123def456
```

## Testing

Run all provider tests:
```bash
npm test src/providers/test/
```

Tests verify:
- ✅ Registry enforces read-only
- ✅ SafeKeys rejects real credentials
- ✅ SafeKeys redacts in logs
- ✅ Providers can be registered and retrieved
- ✅ Status tracking works

## API Reference

### ProviderRegistry

```typescript
class ProviderRegistry {
  register(provider: Provider): void
  get(name: string): Provider
  getAll(): Provider[]
  getStatus(): ProviderStatus[]
  has(name: string): boolean
  unregister(name: string): boolean
}
```

### SafeKeys

```typescript
class SafeKeys {
  static validate(config: ProviderConfig): void
  static preventLogging(obj: ProviderConfig): Partial<ProviderConfig>
  static loadFromEnv(name: string): ProviderConfig
}
```

### ProviderMetadata

```typescript
getProviderMetadata(name: string): ProviderMetadata | null
getProviderCapabilities(name: string): ProviderCapability[]
isProviderReadOnly(name: string): boolean
listAllProviders(): string[]
```

## Troubleshooting

### "Placeholder credentials detected"
Set real (but placeholder format) credentials in `.env`:
```env
ALPACA_API_KEY=pk_test_abc123
ALPACA_SECRET_KEY=sk_test_xyz789
```

### "Provider not registered"
Ensure you called `registry.register()` before `registry.get()`:
```typescript
registry.register(provider); // Must come first
const p = registry.get('name'); // Then retrieve
```

### "Provider must be read-only"
Check that `config.isReadOnly = true`:
```typescript
const config = {
  isReadOnly: true, // Must be true
  // ...
};
```

## Future Enhancement Points

- Multi-provider aggregation in Data Hub
- Provider health monitoring and alerting
- Automatic failover between providers
- Rate limit management
- Data cache and deduplication
- Provider-specific error handling

---

**Built for safety. Designed for expansion.**
