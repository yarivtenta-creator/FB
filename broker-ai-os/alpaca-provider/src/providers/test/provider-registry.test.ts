import test from 'node:test';
import assert from 'node:assert';
import { ProviderRegistry } from '../registry.js';
import { SafeKeys } from '../safe-keys.js';
import { Provider, ProviderConfig } from '../types.js';
import { getProviderMetadata, isProviderReadOnly } from '../provider-metadata.js';

// Mock provider for testing
class MockProvider implements Provider {
  name: string;
  config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  async connect(): Promise<void> {
    // Mock implementation
  }

  async disconnect(): Promise<void> {
    // Mock implementation
  }

  getStatus() {
    return {
      name: this.name,
      status: 'up' as const,
      lastCheck: new Date(),
      responseTime: 50,
      errorRate: 0,
    };
  }
}

test('Provider Registry - Safety Tests', async (t) => {
  await t.test('should reject non-read-only providers', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'test',
      apiKey: 'pk_test',
      secretKey: 'sk_test',
      baseUrl: 'https://api.test.com',
      isReadOnly: false,
      capabilities: [],
    };
    const badProvider = new MockProvider(config);

    assert.throws(
      () => registry.register(badProvider),
      /must be read-only/
    );
  });

  await t.test('should reject real credentials sk_live_', () => {
    const config: ProviderConfig = {
      name: 'test',
      apiKey: 'sk_live_real',
      secretKey: 'sk_test',
      baseUrl: 'https://api.test.com',
      isReadOnly: true,
      capabilities: [],
    };

    assert.throws(
      () => SafeKeys.validate(config),
      /Real credentials detected/
    );
  });

  await t.test('should reject real credentials with "real" keyword', () => {
    const config: ProviderConfig = {
      name: 'test',
      apiKey: 'pk_real_key',
      secretKey: 'sk_test',
      baseUrl: 'https://api.test.com',
      isReadOnly: true,
      capabilities: [],
    };

    assert.throws(
      () => SafeKeys.validate(config),
      /Real credentials detected/
    );
  });

  await t.test('should reject placeholder credentials', () => {
    const config: ProviderConfig = {
      name: 'test',
      apiKey: '<your-read-only-api-key-here>',
      secretKey: 'sk_test',
      baseUrl: 'https://api.test.com',
      isReadOnly: true,
      capabilities: [],
    };

    assert.throws(
      () => SafeKeys.validate(config),
      /Placeholder API key detected/
    );
  });

  await t.test('should redact keys in logs', () => {
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://api.alpaca.com',
      isReadOnly: true,
      capabilities: ['quotes'],
    };

    const logged = SafeKeys.preventLogging(config);
    assert.strictEqual(logged.apiKey, '[REDACTED]');
    assert.strictEqual(logged.secretKey, '[REDACTED]');
    assert.strictEqual(logged.name, 'alpaca');
  });
});

test('Provider Registry - Functionality Tests', async (t) => {
  await t.test('should register a read-only provider', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      dataUrl: 'https://data.alpaca.markets',
      isReadOnly: true,
      capabilities: ['quotes', 'bars', 'clock'],
    };
    const provider = new MockProvider(config);

    registry.register(provider);
    assert.strictEqual(registry.has('alpaca'), true);
  });

  await t.test('should retrieve registered provider', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: [],
    };
    const provider = new MockProvider(config);

    registry.register(provider);
    const retrieved = registry.get('alpaca');
    assert.strictEqual(retrieved.name, 'alpaca');
  });

  await t.test('should throw error when retrieving non-existent provider', () => {
    const registry = new ProviderRegistry();

    assert.throws(
      () => registry.get('nonexistent'),
      /not registered/
    );
  });

  await t.test('should list all registered providers', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: [],
    };
    const provider = new MockProvider(config);

    registry.register(provider);
    const all = registry.getAll();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].name, 'alpaca');
  });

  await t.test('should get status of all providers', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: [],
    };
    const provider = new MockProvider(config);

    registry.register(provider);
    const statuses = registry.getStatus();
    assert.strictEqual(statuses.length, 1);
    assert.strictEqual(statuses[0].name, 'alpaca');
    assert.strictEqual(statuses[0].status, 'up');
  });

  await t.test('should unregister a provider', () => {
    const registry = new ProviderRegistry();
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: [],
    };
    const provider = new MockProvider(config);

    registry.register(provider);
    assert.strictEqual(registry.has('alpaca'), true);
    registry.unregister('alpaca');
    assert.strictEqual(registry.has('alpaca'), false);
  });
});

test('Provider Metadata', async (t) => {
  await t.test('should get provider metadata', () => {
    const metadata = getProviderMetadata('alpaca');
    assert.ok(metadata);
    assert.strictEqual(metadata?.name, 'Alpaca');
    assert.strictEqual(metadata?.isReadOnly, true);
  });

  await t.test('should return null for unknown provider', () => {
    const metadata = getProviderMetadata('unknown');
    assert.strictEqual(metadata, null);
  });

  await t.test('should verify alpaca is read-only', () => {
    const isReadOnly = isProviderReadOnly('alpaca');
    assert.strictEqual(isReadOnly, true);
  });
});
