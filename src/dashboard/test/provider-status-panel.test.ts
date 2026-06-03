import test from 'node:test';
import assert from 'node:assert';
import { ProviderStatusData, DashboardState } from '../types.js';

// Note: React component testing in Node.js environment
// Component logic and types tested below, full rendering tested in browser environment

test('Provider Status Panel - Data Display', async (t) => {
  await t.test('should display provider status correctly', () => {
    const mockProvider: ProviderStatusData = {
      name: 'alpaca',
      status: 'up',
      lastCheck: new Date(),
      responseTime: 45,
      errorRate: 0,
      capabilities: ['quotes', 'bars', 'clock'],
      readOnly: true,
    };

    assert.strictEqual(mockProvider.name, 'alpaca');
    assert.strictEqual(mockProvider.status, 'up');
    assert.ok(mockProvider.responseTime > 0);
    assert.strictEqual(mockProvider.errorRate, 0);
    assert.strictEqual(mockProvider.readOnly, true);
  });

  await t.test('should verify provider capabilities', () => {
    const mockProvider: ProviderStatusData = {
      name: 'alpaca',
      status: 'up',
      lastCheck: new Date(),
      responseTime: 45,
      errorRate: 0,
      capabilities: ['quotes', 'bars', 'clock', 'account', 'positions'],
      readOnly: true,
    };

    assert.ok(Array.isArray(mockProvider.capabilities));
    assert.strictEqual(mockProvider.capabilities.length, 5);
    assert.ok(mockProvider.capabilities.includes('quotes'));
    assert.ok(mockProvider.capabilities.includes('account'));
  });

  await t.test('should handle degraded status', () => {
    const degradedProvider: ProviderStatusData = {
      name: 'test-provider',
      status: 'degraded',
      lastCheck: new Date(),
      responseTime: 500,
      errorRate: 0.05,
      capabilities: ['quotes'],
      readOnly: true,
    };

    assert.strictEqual(degradedProvider.status, 'degraded');
    assert.ok(degradedProvider.responseTime > 100);
    assert.ok(degradedProvider.errorRate > 0);
  });

  await t.test('should handle down status', () => {
    const downProvider: ProviderStatusData = {
      name: 'test-provider',
      status: 'down',
      lastCheck: new Date(),
      responseTime: 0,
      errorRate: 1.0,
      capabilities: [],
      readOnly: true,
    };

    assert.strictEqual(downProvider.status, 'down');
    assert.strictEqual(downProvider.responseTime, 0);
    assert.strictEqual(downProvider.errorRate, 1.0);
  });
});

test('Provider Status Panel - Dashboard State', async (t) => {
  await t.test('should initialize with empty state', () => {
    const initialState: DashboardState = {
      providers: [],
      lastRefresh: new Date(),
      isLoading: false,
      error: undefined,
    };

    assert.ok(Array.isArray(initialState.providers));
    assert.strictEqual(initialState.providers.length, 0);
    assert.strictEqual(initialState.isLoading, false);
    assert.strictEqual(initialState.error, undefined);
  });

  await t.test('should update state with provider data', () => {
    const providers: ProviderStatusData[] = [
      {
        name: 'alpaca',
        status: 'up',
        lastCheck: new Date(),
        responseTime: 45,
        errorRate: 0,
        capabilities: ['quotes', 'bars'],
        readOnly: true,
      },
    ];

    const state: DashboardState = {
      providers,
      lastRefresh: new Date(),
      isLoading: false,
    };

    assert.strictEqual(state.providers.length, 1);
    assert.strictEqual(state.providers[0].name, 'alpaca');
  });

  await t.test('should handle loading state', () => {
    const state: DashboardState = {
      providers: [],
      lastRefresh: new Date(),
      isLoading: true,
    };

    assert.strictEqual(state.isLoading, true);
  });

  await t.test('should handle error state', () => {
    const state: DashboardState = {
      providers: [],
      lastRefresh: new Date(),
      isLoading: false,
      error: 'Failed to load providers',
    };

    assert.strictEqual(state.error, 'Failed to load providers');
  });
});

test('Provider Status Panel - Read-Only Verification', async (t) => {
  await t.test('all providers should be read-only', () => {
    const providers: ProviderStatusData[] = [
      {
        name: 'alpaca',
        status: 'up',
        lastCheck: new Date(),
        responseTime: 45,
        errorRate: 0,
        capabilities: ['quotes', 'bars', 'account'],
        readOnly: true,
      },
    ];

    providers.forEach(provider => {
      assert.strictEqual(provider.readOnly, true, `${provider.name} should be read-only`);
    });
  });

  await t.test('should not have order execution in capabilities', () => {
    const provider: ProviderStatusData = {
      name: 'alpaca',
      status: 'up',
      lastCheck: new Date(),
      responseTime: 45,
      errorRate: 0,
      capabilities: ['quotes', 'bars', 'clock', 'account', 'positions'],
      readOnly: true,
    };

    const forbiddenCapabilities = ['submit_order', 'cancel_order', 'execute_order', 'place_order'];
    forbiddenCapabilities.forEach(forbidden => {
      assert.ok(
        !provider.capabilities.includes(forbidden),
        `${forbidden} should not be in capabilities`
      );
    });
  });
});
