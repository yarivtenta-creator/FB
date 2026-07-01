'use strict';
/**
 * tests/chain_live.js — proves the FULL CHAIN works on REAL-SHAPED Alpaca read-only data:
 *   Provider(Alpaca) → Data Hub v2 → Signals/Ranking → Governance → Paper Trading.
 *
 * HONEST SCOPE: no operator API keys are available, so we cannot fetch authenticated live
 * quotes. We therefore stub ONLY the external HTTP boundary (global.fetch) with a realistic
 * Alpaca `/v2/stocks/quotes/latest` payload (the documented schema), and verify OUR code
 * parses, caches, routes, and prices paper trades off it. The REAL network round-trip to
 * data.alpaca.markets is proven separately in tests/alpaca_live.js (real HTTP 401).
 * This is an integration test of our pipeline, not a claim of live authenticated data.
 */
process.env.DATA_MODE = 'live';
process.env.ALPACA_API_KEY_ID = 'TESTKEYID';
process.env.ALPACA_API_SECRET_KEY = 'TESTSECRET';

const assert = require('assert');

// Stub the HTTP boundary with a realistic Alpaca payload (distinctive prices for assertions).
const REAL_SHAPED = { quotes: {
  AAPL: { t:'2024-01-02T20:00:00Z', ap:190.40, as:1, bp:190.20, bs:2 },
  MSFT: { t:'2024-01-02T20:00:00Z', ap:374.10, as:3, bp:373.90, bs:1 },
  NVDA: { t:'2024-01-02T20:00:00Z', ap:495.50, as:1, bp:495.10, bs:1 },
  TSLA: { t:'2024-01-02T20:00:00Z', ap:250.20, as:2, bp:249.80, bs:2 },
  META: { t:'2024-01-02T20:00:00Z', ap:355.10, as:1, bp:354.90, bs:1 },
  AMZN: { t:'2024-01-02T20:00:00Z', ap:222.30, as:1, bp:222.14, bs:1 }  // mid = 222.22
}};
let lastUrl = null;
const realFetch = global.fetch;
global.fetch = async (url, opts) => {
  lastUrl = String(url);
  assert.ok((opts && (opts.method||'GET') === 'GET'), 'chain must use GET (read-only)');
  return { ok:true, status:200, json: async () => REAL_SHAPED };
};

const config  = require('../config');
const alpaca  = require('../data_layer/adapters/alpaca');
const hub     = require('../data_layer/data_hub_v2');
const scoring = require('../data_layer/signal_scoring');
const gov     = require('../governance/governance');
const bridge  = require('../data_layer/paper_bridge');
const paper   = require('../data_layer/paper_trading');

let pass = 0, fail = 0;
async function t(name, fn){ try { const r = fn(); if (r && r.then) await r; pass++; console.log('  PASS  ' + name); }
  catch(e){ fail++; console.log('  FAIL  ' + name + ' :: ' + e.message); } }

(async () => {
  console.log('\n=== FULL CHAIN ON REAL-SHAPED ALPACA DATA (HTTP boundary stubbed; schema is real) ===');
  paper.reset(); // clean slate for deterministic pricing assertions

  await t('PROVIDER: refreshLive() parses real Alpaca schema (GET, read-only)', async () => {
    const r = await alpaca.refreshLive();
    assert.strictEqual(r.ok, true); assert.strictEqual(r.status, 200); assert.strictEqual(r.count, 6);
    assert.ok(/data\.alpaca\.markets\/v2\/stocks\/quotes\/latest/.test(lastUrl), 'wrong/absent data URL: ' + lastUrl);
  });

  await t('DATA HUB: serves live quotes (live:true) stamped source=data_hub_v2', () => {
    const q = hub.getQuotes();
    const amzn = q.find(x => x.symbol === 'AMZN');
    assert.ok(amzn, 'AMZN missing from hub'); assert.strictEqual(amzn.source, 'data_hub_v2');
    assert.strictEqual(amzn.live, true); assert.strictEqual(amzn.price, 222.22); // midpoint from Alpaca
  });

  await t('DATA HUB health: data_mode=live, freshness live', () => {
    const h = hub.health(); assert.strictEqual(h.data_mode, 'live'); assert.ok(/live/.test(h.freshness));
    assert.ok(h.symbols.includes('AMZN'));
  });

  await t('SIGNALS: ranking still produces sorted scored signals via the hub', () => {
    const r = scoring.rankSignals(); assert.ok(r.length > 0);
    for (let i=1;i<r.length;i++) assert.ok(r[i-1].score >= r[i].score);
  });

  let candidate;
  await t('GOVERNANCE: approve order → paper candidate (paper:true, executed:false)', () => {
    const seed = gov.listOrders()[0];
    const d = gov.decide(seed.id, 'approve', 'chain-test'); assert.strictEqual(d.executed, false);
    candidate = bridge.candidatesFromGovernance().find(c => c.id === seed.id);
    assert.ok(candidate); assert.strictEqual(candidate.paper, true); assert.strictEqual(candidate.executed, false);
  });

  await t('PAPER TRADING: simulate prices the trade off LIVE Alpaca quote, executed:false', () => {
    const r = bridge.simulate(candidate.id);
    assert.strictEqual(r.ok, true); assert.strictEqual(r.executed, false); assert.strictEqual(r.trade.paper, true);
    // candidate is AMZN → entry must equal the live midpoint 222.22 (proves real-shaped data flowed through)
    assert.strictEqual(r.trade.symbol, 'AMZN');
    assert.strictEqual(r.trade.entry, 222.22);
    console.log('        paper trade →', JSON.stringify(r.trade));
  });

  await t('SAFETY: chain used read-only GET only; adapter has no order methods', () => {
    const ORDER = ['placeOrder','submitOrder','cancelOrder','closePosition','replaceOrder','transfer','execute'];
    assert.ok(!Object.keys(alpaca).some(k => ORDER.includes(k)));
  });

  global.fetch = realFetch; // restore
  console.log('\n────────────────────────────────────────');
  console.log('CHAIN RESULT  pass=' + pass + '  fail=' + fail);
  if (fail){ process.exit(1); }
  console.log('FULL CHAIN VERIFIED ON REAL-SHAPED ALPACA READ-ONLY DATA (paper:true, executed:false)');
})();
