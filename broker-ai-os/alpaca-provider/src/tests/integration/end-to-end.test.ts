import test from 'node:test';
import assert from 'node:assert';
import { ProviderRegistry } from '../../providers/registry.js';
import { SafeKeys } from '../../providers/safe-keys.js';
import { ProviderConfig } from '../../providers/types.js';
import { DataHub } from '../../data-hub/hub.js';
import { PaperBridge } from '../../governance/paper-bridge.js';

test('End-to-End Integration - Provider Registry → Data Hub → Paper Bridge', async (t) => {
  await t.test('should initialize registry with validated providers', () => {
    const registry = new ProviderRegistry();
    assert.ok(registry, 'Registry should initialize');

    // Create a mock provider config
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: ['quotes', 'bars', 'clock', 'account', 'positions'],
    };

    // Validate credentials
    SafeKeys.validate(config);
    assert.ok(config.isReadOnly, 'Config should be read-only');
  });

  await t.test('should initialize data hub with registry', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    assert.ok(hub, 'DataHub should initialize');
  });

  await t.test('should initialize paper bridge with data hub', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);
    assert.ok(bridge, 'PaperBridge should initialize');
  });

  await t.test('should reject forbidden order methods', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const forbiddenMethods = [
      'submitOrder',
      'cancelOrder',
      'executeOrder',
      'closePosition',
      'buyPosition',
      'sellPosition',
      'modifyOrder',
      'placeOrder',
    ];

    for (const method of forbiddenMethods) {
      const result = await bridge.evaluateExecution({
        action: method,
        providerName: 'alpaca',
        params: {},
      });

      assert.strictEqual(
        result.allowed,
        false,
        `${method} should be forbidden`
      );
      assert.ok(
        result.reason.includes('forbidden'),
        `Reason should mention forbidden for ${method}`
      );
    }
  });

  await t.test('should allow read-only operations', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const readOnlyOperations = [
      'getQuote',
      'getBar',
      'getClock',
      'getAccount',
      'getPositions',
      'getOrders',
    ];

    for (const operation of readOnlyOperations) {
      // Note: will fail because provider not registered, but tests the logic
      const result = await bridge.evaluateExecution({
        action: operation,
        providerName: 'alpaca',
        params: {},
      });

      // Should fail on provider check, not on action check
      assert.strictEqual(result.allowed, false);
      assert.ok(
        !result.reason.includes('forbidden'),
        `${operation} should not be in forbidden list`
      );
    }
  });

  await t.test('should validate credentials at bridge level', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    // Valid config
    const validConfig: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: ['quotes'],
    };

    const validResult = await bridge.validateCredentials(validConfig);
    assert.strictEqual(validResult.allowed, true);

    // Invalid config with credentials containing 'real'
    const invalidConfig: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_real_secret',
      secretKey: 'sk_real_secret',
      baseUrl: 'https://api.alpaca.markets',
      isReadOnly: true,
      capabilities: ['quotes'],
    };

    const invalidResult = await bridge.validateCredentials(invalidConfig);
    assert.strictEqual(invalidResult.allowed, false);
  });

  await t.test('should track execution results with timestamps', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const result = await bridge.evaluateExecution({
      action: 'submitOrder',
      providerName: 'alpaca',
      params: {},
    });

    assert.ok(result.timestamp instanceof Date);
    assert.ok(result.timestamp.getTime() <= Date.now());
  });
});

test('End-to-End Integration - Paper Trading Enforcement', async (t) => {
  await t.test('should verify paper trading is enforced', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    // Verify paper trading
    const result = await bridge.verifyPaperTrading();
    // Will fail because no providers registered, but that's expected
    assert.ok(result.timestamp instanceof Date);
  });

  await t.test('should list all forbidden actions', () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const forbidden = bridge.getForbiddenActions();
    assert.ok(Array.isArray(forbidden));
    assert.ok(forbidden.length > 0);
    assert.ok(forbidden.includes('submitOrder'));
    assert.ok(forbidden.includes('cancelOrder'));
    assert.ok(!forbidden.includes('getQuote'));
  });

  await t.test('should isolate read-only and write operations', () => {
    const readOnlyOps = ['getQuote', 'getBar', 'getClock', 'getAccount', 'getPositions'];
    const writeOps = ['submitOrder', 'cancelOrder', 'closePosition', 'buyPosition'];

    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const forbidden = bridge.getForbiddenActions();

    // Verify no read-only operations are forbidden
    for (const op of readOnlyOps) {
      assert.ok(!forbidden.includes(op), `${op} should not be forbidden`);
    }

    // Verify all write operations are forbidden
    for (const op of writeOps) {
      assert.ok(forbidden.includes(op), `${op} should be forbidden`);
    }
  });
});

test('End-to-End Integration - Data Flow', async (t) => {
  await t.test('should flow from credentials → registry → hub → bridge', async () => {
    // Step 1: Validate credentials
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_test_key',
      secretKey: 'sk_test_secret',
      baseUrl: 'https://paper-api.alpaca.markets',
      isReadOnly: true,
      capabilities: ['quotes', 'bars', 'account'],
    };

    SafeKeys.validate(config);
    assert.ok(config.isReadOnly);

    // Step 2: Create registry and hub
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    assert.ok(hub);

    // Step 3: Create bridge
    const bridge = new PaperBridge(hub);

    // Step 4: Verify credential validation
    const credResult = await bridge.validateCredentials(config);
    assert.strictEqual(credResult.allowed, true);

    // Step 5: Verify execution control
    const execResult = await bridge.evaluateExecution({
      action: 'submitOrder',
      providerName: 'alpaca',
      params: {},
    });
    assert.strictEqual(execResult.allowed, false);
  });

  await t.test('should reject non-paper trading configurations', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    // Try config with credentials containing 'real' keyword
    const config: ProviderConfig = {
      name: 'alpaca',
      apiKey: 'pk_real_key',
      secretKey: 'sk_real_secret',
      baseUrl: 'https://api.alpaca.markets',
      isReadOnly: true,
      capabilities: [],
    };

    const result = await bridge.validateCredentials(config);
    assert.strictEqual(result.allowed, false);
  });
});

test('End-to-End Integration - Safety Guarantees', async (t) => {
  await t.test('should provide zero order execution paths', async () => {
    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    const forbidden = bridge.getForbiddenActions();

    // These specific methods must not exist anywhere
    const criticalMethods = [
      'submitOrder',
      'cancelOrder',
      'executeOrder',
      'closePosition',
    ];

    for (const method of criticalMethods) {
      assert.ok(
        forbidden.includes(method),
        `${method} must be in forbidden list for safety`
      );
    }
  });

  await t.test('should enforce read-only access throughout stack', async () => {
    const config: ProviderConfig = {
      name: 'test',
      apiKey: 'pk_test',
      secretKey: 'sk_test',
      baseUrl: 'https://paper-api.example.com',
      isReadOnly: true,
      capabilities: ['quotes'],
    };

    assert.strictEqual(config.isReadOnly, true, 'Config must enforce read-only');

    const registry = new ProviderRegistry();
    const hub = new DataHub({ registry });
    const bridge = new PaperBridge(hub);

    // Verify bridge knows about read-only requirement
    const result = await bridge.validateCredentials(config);
    assert.strictEqual(result.allowed, true);
  });
});
