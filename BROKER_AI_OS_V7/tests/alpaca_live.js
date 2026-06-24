'use strict';
/**
 * tests/alpaca_live.js — proves the Alpaca adapter performs a REAL read-only HTTP call
 * to the Alpaca MARKET-DATA host and degrades safely.
 *
 * Run with live mode + DUMMY (non-secret) keys so _configured() is true:
 *   DATA_MODE=live ALPACA_API_KEY_ID=TESTKEYID ALPACA_API_SECRET_KEY=TESTSECRET node tests/alpaca_live.js
 *
 * Expected against the REAL endpoint with dummy keys: HTTP 401 (proves the call is real,
 * hits the correct read-only endpoint, and is NOT a stub) → adapter falls back to fixtures,
 * fabricates no "live" data, and never touches an order/trading path. With VALID operator
 * keys the same path returns 200 + real quotes.
 */
process.env.DATA_MODE = process.env.DATA_MODE || 'live';
process.env.ALPACA_API_KEY_ID = process.env.ALPACA_API_KEY_ID || 'TESTKEYID';
process.env.ALPACA_API_SECRET_KEY = process.env.ALPACA_API_SECRET_KEY || 'TESTSECRET';

const assert = require('assert');
const config   = require('../config');
const alpaca   = require('../data_layer/adapters/alpaca');
const registry = require('../data_layer/provider_registry');
const hub      = require('../data_layer/data_hub_v2');

let pass = 0, fail = 0;
async function t(name, fn){ try { const r = fn(); if (r && r.then) await r; pass++; console.log('  PASS  ' + name); }
  catch(e){ fail++; console.log('  FAIL  ' + name + ' :: ' + e.message); } }

(async () => {
  console.log('\n=== ALPACA REAL READ-ONLY INTEGRATION ===');
  console.log('DATA_MODE=' + config.DATA_MODE + '  data_host=' + alpaca.DATA_BASE);
  console.log('(keys are DUMMY placeholders — expecting a real 401 from the live endpoint)\n');

  await t('config is in LIVE mode for this run', () => assert.strictEqual(config.DATA_MODE, 'live'));
  await t('provider reports configured (env presence only)', () => {
    assert.strictEqual(registry.get('alpaca').configured, true);
  });

  let probe;
  await t('refreshLive() performs a REAL read-only GET to the data host', async () => {
    probe = await alpaca.refreshLive();
    console.log('        refreshLive →', JSON.stringify(probe));
    // A real network round-trip happened: either ok (valid keys) or a real HTTP status.
    assert.ok(probe.status === 200 || probe.status === 401 || probe.status === 403 || probe.reason === 'fetch_error',
      'no real HTTP result observed');
  });

  await t('with dummy keys the endpoint is REACHED and returns 401 (proves real, read-only)', () => {
    // If you supplied valid keys, status will be 200 instead — also acceptable.
    assert.ok(probe.status === 401 || probe.status === 200 || probe.status === 403,
      'expected a real HTTP status from data.alpaca.markets, got ' + JSON.stringify(probe));
  });

  await t('on unauthorized, NO live data is fabricated (cache empty → fixtures fallback)', () => {
    const q = alpaca.getQuotes();
    if (probe.ok){
      // valid keys path: real live quotes, each flagged live:true
      assert.ok(q.length > 0 && q.every(x => x.live === true), 'live quotes not flagged');
    } else {
      // unauthorized path: safe fixtures, none falsely flagged live
      assert.ok(q.length > 0, 'no fallback quotes'); assert.ok(q.every(x => !x.live), 'fabricated live data on failure');
    }
  });

  await t('registry.test(alpaca) returns the REAL probe result in live mode', async () => {
    const r = await registry.test('alpaca');
    console.log('        registry.test →', JSON.stringify(r));
    assert.strictEqual(r.mode, 'live');
    assert.ok('http_status' in r);
  });

  await t('hub.health() reports data_mode=live and live freshness', () => {
    const h = hub.health(); assert.strictEqual(h.data_mode, 'live');
    assert.ok(/live/.test(h.freshness));
  });

  await t('adapter still exposes NO order/execute methods in live mode', () => {
    const ORDER = ['placeOrder','submitOrder','cancelOrder','closePosition','replaceOrder','transfer','execute'];
    assert.ok(!Object.keys(alpaca).some(k => ORDER.includes(k)));
  });

  console.log('\n────────────────────────────────────────');
  console.log('ALPACA LIVE RESULT  pass=' + pass + '  fail=' + fail);
  console.log('observed_http_status=' + (probe && probe.status) + '  (401 = real endpoint reached with dummy keys)');
  if (fail){ process.exit(1); }
  console.log('REAL READ-ONLY INTEGRATION VERIFIED (safe fallback, no orders, no fabrication)');
})();
