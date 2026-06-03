import test from 'node:test';
import assert from 'node:assert';
import { AlpacaClient } from '../client.js';
import { AlpacaAccountReader } from '../account-reader.js';
import { AlpacaPositionReader } from '../position-reader.js';
import { ProviderConfig } from '../../types.js';

test('Alpaca Account Reader - Read-Only Access', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    isReadOnly: true,
    capabilities: ['account'],
  };

  const client = new AlpacaClient(config, true);
  const reader = new AlpacaAccountReader(client);

  await t.test('should get account details', async () => {
    const account = await reader.getAccount();
    assert.ok(account.id);
    assert.ok(account.cash > 0);
    assert.strictEqual(account.paperTrading, true);
  });

  await t.test('should get balance', async () => {
    const balance = await reader.getBalance();
    assert.ok(balance.cash > 0);
    assert.ok(balance.buyingPower > 0);
    assert.ok(balance.equity > 0);
    assert.ok(balance.totalValue > 0);
  });

  await t.test('should get individual balance fields', async () => {
    const cash = await reader.getCash();
    const power = await reader.getBuyingPower();
    const equity = await reader.getEquity();

    assert.ok(cash > 0);
    assert.ok(power > 0);
    assert.ok(equity > 0);
  });

  await t.test('should verify paper trading mode', async () => {
    const isPaper = await reader.isPaperTrading();
    assert.strictEqual(isPaper, true);
  });

  await t.test('should not have write methods', () => {
    assert.strictEqual((reader as any).submitOrder, undefined);
    assert.strictEqual((reader as any).cancelOrder, undefined);
    assert.strictEqual((reader as any).deposit, undefined);
    assert.strictEqual((reader as any).withdraw, undefined);
  });
});

test('Alpaca Position Reader - Read-Only Access', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    isReadOnly: true,
    capabilities: ['positions'],
  };

  const client = new AlpacaClient(config, true);
  const reader = new AlpacaPositionReader(client);

  await t.test('should get all positions', async () => {
    const positions = await reader.getPositions();
    assert.ok(Array.isArray(positions));
    assert.ok(positions.length > 0);
  });

  await t.test('should get position by symbol', async () => {
    const position = await reader.getPosition('AAPL');
    assert.ok(position);
    assert.strictEqual(position!.symbol, 'AAPL');
  });

  await t.test('should return null for non-existent position', async () => {
    const position = await reader.getPosition('NONEXISTENT');
    assert.strictEqual(position, null);
  });

  await t.test('should get order history', async () => {
    const orders = await reader.getOrders();
    assert.ok(Array.isArray(orders));
  });

  await t.test('should calculate total position value', async () => {
    const total = await reader.getTotalPositionValue();
    assert.ok(typeof total === 'number');
    assert.ok(total > 0);
  });

  await t.test('should calculate total unrealized gain', async () => {
    const gain = await reader.getTotalUnrealizedGain();
    assert.ok(typeof gain === 'number');
  });

  await t.test('should get position count', async () => {
    const count = await reader.getPositionCount();
    assert.ok(typeof count === 'number');
    assert.ok(count > 0);
  });

  await t.test('should not have write methods', () => {
    assert.strictEqual((reader as any).closePosition, undefined);
    assert.strictEqual((reader as any).modifyOrder, undefined);
    assert.strictEqual((reader as any).buyPosition, undefined);
    assert.strictEqual((reader as any).sellPosition, undefined);
  });
});

test('Alpaca Readers - Data Consistency', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    isReadOnly: true,
    capabilities: ['account', 'positions'],
  };

  const client = new AlpacaClient(config, true);
  const accountReader = new AlpacaAccountReader(client);
  const positionReader = new AlpacaPositionReader(client);

  await t.test('account and position readers share same client', async () => {
    const account1 = await accountReader.getAccount();
    const account2 = await accountReader.getAccount();

    assert.strictEqual(account1.id, account2.id);
    assert.strictEqual(account1.paperTrading, account2.paperTrading);
  });

  await t.test('position count matches array length', async () => {
    const positions = await positionReader.getPositions();
    const count = await positionReader.getPositionCount();

    assert.strictEqual(count, positions.length);
  });

  await t.test('total position value matches sum', async () => {
    const positions = await positionReader.getPositions();
    const total = await positionReader.getTotalPositionValue();

    const calculated = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
    assert.strictEqual(total, calculated);
  });
});
