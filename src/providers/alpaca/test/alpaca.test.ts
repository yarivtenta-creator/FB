import test from 'node:test';
import assert from 'node:assert';
import { AlpacaClient } from '../client.js';
import { AlpacaPaperAccount } from '../paper-account.js';
import { DataValidator } from '../data-validator.js';
import { ProviderConfig } from '../../types.js';

test('Alpaca Client - Safety Tests', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    dataUrl: 'https://data.alpaca.markets',
    isReadOnly: true,
    capabilities: ['quotes', 'bars', 'clock', 'account'],
  };

  await t.test('should use paper URL', () => {
    const client = new AlpacaClient(config, true);
    assert.ok(client.isPaperTrading());
  });

  await t.test('should reject live trading URL', () => {
    const liveConfig: ProviderConfig = {
      ...config,
      baseUrl: 'https://api.alpaca.markets',
    };
    assert.throws(
      () => new AlpacaClient(liveConfig, false),
      /SAFETY/
    );
  });

  await t.test('should not have order methods', () => {
    const client = new AlpacaClient(config, true);
    assert.strictEqual((client as any).submitOrder, undefined);
    assert.strictEqual((client as any).cancelOrder, undefined);
    assert.strictEqual((client as any).executeOrder, undefined);
  });

  await t.test('should redact credentials in getters', () => {
    const client = new AlpacaClient(config, true);
    assert.strictEqual(client.getApiKey(), '[REDACTED]');
    assert.strictEqual(client.getSecretKey(), '[REDACTED]');
  });
});

test('Alpaca Client - Market Data Tests', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    dataUrl: 'https://data.alpaca.markets',
    isReadOnly: true,
    capabilities: ['quotes', 'bars', 'clock'],
  };

  const client = new AlpacaClient(config, true);

  await t.test('should fetch quote', async () => {
    const quote = await client.getQuote('AAPL');
    assert.strictEqual(quote.symbol, 'AAPL');
    assert.ok(quote.bid > 0);
    assert.ok(quote.ask > quote.bid);
  });

  await t.test('should fetch bar', async () => {
    const bar = await client.getBar('AAPL', '1h');
    assert.strictEqual(bar.symbol, 'AAPL');
    assert.ok(bar.close > 0);
    assert.ok(bar.high >= Math.max(bar.open, bar.close));
  });

  await t.test('should get clock', async () => {
    const clock = await client.getClock();
    assert.ok(clock.isOpen !== undefined);
    assert.ok(clock.nextOpen !== undefined);
  });
});

test('Alpaca Client - Data Validation Tests', async (t) => {
  await t.test('should validate quote bid-ask spread', () => {
    assert.throws(
      () => {
        DataValidator.validateQuote({
          symbol: 'AAPL',
          bid: 150,
          bidSize: 100,
          ask: 140,
          askSize: 200,
          last: 145,
          lastSize: 50,
          timestamp: new Date(),
        });
      },
      /Bid > ask/
    );
  });

  await t.test('should validate bar OHLC', () => {
    assert.throws(
      () => {
        DataValidator.validateBar({
          symbol: 'AAPL',
          open: 150,
          high: 145,
          low: 140,
          close: 152,
          volume: 1000000,
          timestamp: new Date(),
        });
      },
      /High < open\/close/
    );
  });

  await t.test('should require paper trading mode', () => {
    assert.throws(
      () => {
        DataValidator.validateAccount({
          id: 'TEST',
          cash: 100000,
          buyingPower: 400000,
          equity: 100000,
          paperTrading: false,
        });
      },
      /paper trading/
    );
  });
});

test('Alpaca Paper Account - Safety Tests', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    isReadOnly: true,
    capabilities: ['account', 'positions'],
  };

  const client = new AlpacaClient(config, true);
  const account = new AlpacaPaperAccount(client);

  await t.test('should verify paper mode in account', async () => {
    const acct = await account.getAccount();
    assert.strictEqual(acct.paperTrading, true);
  });

  await t.test('should not have order methods', () => {
    assert.strictEqual((account as any).submitOrder, undefined);
    assert.strictEqual((account as any).cancelOrder, undefined);
    assert.strictEqual((account as any).closePosition, undefined);
  });
});

test('Alpaca Paper Account - Read-Only Access Tests', async (t) => {
  const config: ProviderConfig = {
    name: 'alpaca',
    apiKey: 'pk_test_key',
    secretKey: 'sk_test_secret',
    baseUrl: 'https://paper-api.alpaca.markets',
    isReadOnly: true,
    capabilities: ['account', 'positions'],
  };

  const client = new AlpacaClient(config, true);
  const account = new AlpacaPaperAccount(client);

  await t.test('should get account balance', async () => {
    const balance = await account.getBalance();
    assert.ok(balance.cash > 0);
    assert.ok(balance.buyingPower > 0);
    assert.ok(balance.equity > 0);
  });

  await t.test('should get positions', async () => {
    const positions = await account.getPositions();
    assert.ok(Array.isArray(positions));
  });

  await t.test('should get order history', async () => {
    const orders = await account.getOrders();
    assert.ok(Array.isArray(orders));
  });
});
