import test from 'node:test';
import assert from 'node:assert';
import { AlpacaMock } from '../mock.js';

test('Alpaca Mock - Data Generation', async (t) => {
  await t.test('should provide realistic quote', () => {
    const quote = AlpacaMock.getQuote('AAPL');
    assert.strictEqual(quote.symbol, 'AAPL');
    assert.ok(quote.bid > 0);
    assert.ok(quote.ask > quote.bid);
    assert.ok(quote.bidSize > 0);
    assert.ok(quote.askSize > 0);
  });

  await t.test('should provide valid bar', () => {
    const bar = AlpacaMock.getBar('AAPL', '1h');
    assert.strictEqual(bar.symbol, 'AAPL');
    assert.ok(bar.open > 0);
    assert.ok(bar.close > 0);
    assert.ok(bar.high >= Math.max(bar.open, bar.close));
    assert.ok(bar.low <= Math.min(bar.open, bar.close));
    assert.ok(bar.volume > 0);
  });

  await t.test('should provide market clock', () => {
    const clock = AlpacaMock.getClock();
    assert.ok(clock.timestamp instanceof Date);
    assert.ok(typeof clock.isOpen === 'boolean');
    assert.ok(clock.nextOpen instanceof Date);
    assert.ok(clock.nextClose instanceof Date);
  });

  await t.test('should provide paper account', () => {
    const account = AlpacaMock.getAccount();
    assert.strictEqual(account.paperTrading, true);
    assert.ok(account.cash > 0);
    assert.ok(account.buyingPower > 0);
    assert.ok(account.equity > 0);
    assert.ok(account.id);
  });

  await t.test('should provide positions', () => {
    const positions = AlpacaMock.getPositions();
    assert.ok(Array.isArray(positions));
    assert.ok(positions.length > 0);
    assert.strictEqual(positions[0].symbol, 'AAPL');
    assert.ok(positions[0].quantity > 0);
  });
});

test('Alpaca Mock - Offline Functionality', async (t) => {
  await t.test('should work without network', () => {
    // No network calls made
    const quote = AlpacaMock.getQuote('AAPL');
    const bar = AlpacaMock.getBar('AAPL', '1d');
    const clock = AlpacaMock.getClock();

    assert.ok(quote.bid > 0);
    assert.ok(bar.close > 0);
    assert.ok(clock.isOpen !== undefined);
  });

  await t.test('should provide consistent data types', () => {
    const quote = AlpacaMock.getQuote('MSFT');
    const bar = AlpacaMock.getBar('MSFT', '5m');
    const account = AlpacaMock.getAccount();

    assert.strictEqual(typeof quote.symbol, 'string');
    assert.strictEqual(typeof quote.bid, 'number');
    assert.strictEqual(typeof bar.volume, 'number');
    assert.strictEqual(typeof account.paperTrading, 'boolean');
  });

  await t.test('should provide realistic account balance', () => {
    const account = AlpacaMock.getAccount();
    assert.ok(account.cash > 0);
    assert.ok(account.buyingPower > account.cash);
    assert.ok(account.equity > 0);
  });
});

test('Alpaca Mock - Data Consistency', async (t) => {
  await t.test('all quotes should have valid bid-ask spread', () => {
    for (const symbol of ['AAPL', 'MSFT', 'TSLA']) {
      const quote = AlpacaMock.getQuote(symbol);
      assert.ok(quote.ask > quote.bid, `Invalid spread for ${symbol}`);
    }
  });

  await t.test('all bars should have valid OHLC', () => {
    for (const symbol of ['AAPL', 'MSFT', 'TSLA']) {
      const bar = AlpacaMock.getBar(symbol, '1h');
      assert.ok(bar.high >= Math.max(bar.open, bar.close), `Invalid high for ${symbol}`);
      assert.ok(bar.low <= Math.min(bar.open, bar.close), `Invalid low for ${symbol}`);
    }
  });

  await t.test('paper account should always be paper trading', () => {
    for (let i = 0; i < 5; i++) {
      const account = AlpacaMock.getAccount();
      assert.strictEqual(account.paperTrading, true);
    }
  });
});
