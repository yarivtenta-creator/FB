'use strict';
/**
 * tests/run.js — unit/contract tests. No network (mock mode). Exercises modules directly.
 * Aggregates Agents 1–4 TESTS_REQUIRED + safety invariants + Alpaca read-only parsing.
 * Run: node tests/run.js
 */
const assert = require('assert');

const config   = require('../config');
const registry = require('../data_layer/provider_registry');
const alpaca   = require('../data_layer/adapters/alpaca');
const hub      = require('../data_layer/data_hub_v2');
const scoring  = require('../data_layer/signal_scoring');
const paper    = require('../data_layer/paper_trading');
const bridge   = require('../data_layer/paper_bridge');
const gov      = require('../governance/governance');

let pass = 0, fail = 0; const fails = [];
async function t(name, fn){
  try { const r = fn(); if (r && typeof r.then === 'function') await r; pass++; console.log('  PASS  ' + name); }
  catch(e){ fail++; fails.push(name + ' :: ' + e.message); console.log('  FAIL  ' + name + ' :: ' + e.message); }
}

const ORDER_METHODS = ['placeOrder','submitOrder','cancelOrder','closePosition','replaceOrder','transfer','execute'];
function hasOrderMethod(mod){ return Object.keys(mod).some(k => ORDER_METHODS.includes(k)); }

(async () => {
console.log('\n=== AGENT 1 — Provider Connection ===');
await t('config.DATA_MODE defaults to mock', () => assert.strictEqual(config.DATA_MODE, 'mock'));
await t('registry.list() every entry has id + 4 links + configured boolean', () => {
  const list = registry.list(); assert.ok(list.length > 0);
  for (const p of list){
    assert.ok(p.id, 'missing id');
    assert.ok(p.links && 'website' in p.links && 'docs' in p.links && 'apiKeys' in p.links && 'setupGuide' in p.links, 'links incomplete');
    assert.strictEqual(typeof p.configured, 'boolean', 'configured not boolean');
  }
});
await t('registry.get(alpaca) exists and enabled=false by default', () => {
  const a = registry.get('alpaca'); assert.ok(a); assert.strictEqual(a.enabled, false);
});
await t('registry.test(alpaca) is mock + reachable:false in mock mode (no network)', async () => {
  const r = await registry.test('alpaca');
  assert.strictEqual(r.mode, 'mock'); assert.strictEqual(r.reachable, false);
});
await t('alpaca adapter exposes NO order/execute methods', () => assert.ok(!hasOrderMethod(alpaca)));
await t('alpaca.getQuotes() returns normalized mock quotes in mock mode', () => {
  const q = alpaca.getQuotes(); assert.ok(q.length > 0);
  assert.strictEqual(q[0].kind, 'quote'); assert.strictEqual(q[0].mock, true);
});
await t('alpaca.parseLatestQuotes() normalizes REAL Alpaca schema → Quote (live:true)', () => {
  // Realistic Alpaca /v2/stocks/quotes/latest response shape.
  const sample = { quotes: {
    AAPL: { t:'2024-01-02T20:00:00Z', ap:190.40, as:1, bp:190.20, bs:2 },
    MSFT: { t:'2024-01-02T20:00:00Z', ap:374.10, as:3, bp:373.90, bs:1 }
  }};
  const parsed = alpaca.parseLatestQuotes(sample);
  assert.strictEqual(parsed.length, 2);
  const aapl = parsed.find(x => x.symbol === 'AAPL');
  assert.strictEqual(aapl.kind, 'quote');
  assert.strictEqual(aapl.provider, 'alpaca');
  assert.strictEqual(aapl.price, 190.30);   // midpoint of 190.40/190.20
  assert.strictEqual(aapl.live, true);
});

console.log('\n=== AGENT 2 — Data Hub & Signal Pipeline ===');
await t('hub.health() has data_mode/source/freshness + provider counts', () => {
  const h = hub.health();
  ['data_mode','source','freshness','registered_providers','active_providers','symbol_coverage'].forEach(k =>
    assert.ok(k in h, 'missing ' + k));
  assert.strictEqual(h.data_mode, 'mock');
});
await t('hub.getSignals() returns mock signals via the hub', () => {
  const s = hub.getSignals(); assert.ok(s.length > 0);
  s.forEach(x => { assert.strictEqual(x.kind, 'signal'); assert.strictEqual(x.mock, true); });
});
await t('hub.getQuotes() records carry provider + source', () => {
  const q = hub.getQuotes(); assert.ok(q.length > 0);
  q.forEach(x => { assert.ok(x.provider); assert.strictEqual(x.source, 'data_hub_v2'); });
});
await t('scoring.rankSignals() is sorted non-increasing by score', () => {
  const r = scoring.rankSignals(); assert.ok(r.length > 0);
  for (let i=1;i<r.length;i++) assert.ok(r[i-1].score >= r[i].score, 'not sorted');
});
await t('scoring.rankSignals()[0].factors has 4 factor keys', () => {
  const f = scoring.rankSignals()[0].factors;
  ['confidence','source_quality','trend_alignment','confirmations'].forEach(k => assert.ok(k in f, 'missing ' + k));
});
await t('signal_scoring sources from hub only (no direct adapter require)', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname,'..','data_layer','signal_scoring','index.js'),'utf8');
  assert.ok(!/require\(['"]\.\.\/adapters/.test(src), 'scoring requires an adapter directly');
});

console.log('\n=== AGENT 3 — Paper / Governance Bridge ===');
await t('governance.decide(approve) opens gate without executing', () => {
  const seed = gov.listOrders()[0]; assert.ok(seed, 'no seed order');
  const r = gov.decide(seed.id, 'approve', 'test-runner');
  assert.strictEqual(r.ok, true); assert.strictEqual(r.executed, false);
  assert.strictEqual(r.order.execution_allowed, true);
});
await t('bridge.candidatesFromGovernance() all paper:true / executed:false', () => {
  const c = bridge.candidatesFromGovernance(); assert.ok(c.length > 0, 'no candidates after approval');
  c.forEach(x => { assert.strictEqual(x.paper, true); assert.strictEqual(x.executed, false); assert.strictEqual(x.status,'candidate'); });
});
await t('bridge.simulate(approvedOrder) → paper trade, executed:false', () => {
  const c = bridge.candidatesFromGovernance()[0];
  const r = bridge.simulate(c.id);
  assert.strictEqual(r.ok, true); assert.strictEqual(r.paper, true); assert.strictEqual(r.executed, false);
  assert.strictEqual(r.trade.paper, true);
});
await t('bridge.stats() includes paper:true and candidate count', () => {
  const s = bridge.stats(); assert.strictEqual(s.paper, true); assert.ok('candidates' in s);
});
await t('paper_bridge exposes NO order/execute methods', () => assert.ok(!hasOrderMethod(bridge)));
await t('paper_trading.openTrade() flags paper:true', () => {
  const r = paper.openTrade({ symbol:'AAPL', side:'long', qty:1 });
  assert.strictEqual(r.ok, true); assert.strictEqual(r.trade.paper, true);
});

console.log('\n=== AGENT 4 — Dashboard / Theme (static structure) ===');
const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');
const themejs = fs.readFileSync(path.join(__dirname,'..','public','theme.js'),'utf8');
await t('index.html references theme.js and has a theme toggle', () => {
  assert.ok(/theme\.js/.test(html)); assert.ok(/id="themeToggle"/.test(html));
});
await t('index.html has Provider Setup Center + Paper Status sections', () => {
  assert.ok(/Provider Setup Center/.test(html)); assert.ok(/Paper Status/.test(html));
});
await t('index.html has NO password input / no key-capturing field', () => {
  assert.ok(!/type=["']password["']/i.test(html));
});
await t('theme.js defines light + dark and uses localStorage', () => {
  assert.ok(/light/.test(themejs) && /dark/.test(themejs)); assert.ok(/localStorage/.test(themejs));
});
await t('all 5 operator guides exist and are non-empty', () => {
  ['START_2024','CONNECT_ALPACA','PROVIDER_SETUP_CENTER','PAPER_TRADING','THEME_SWITCH'].forEach(g => {
    const p = path.join(__dirname,'..','docs','operator',g+'.md');
    assert.ok(fs.existsSync(p) && fs.statSync(p).size > 0, g + ' missing/empty');
  });
});

console.log('\n=== SAFETY INVARIANTS ===');
await t('no data_layer module exports an order/execute method', () => {
  [registry, alpaca, hub, scoring, paper, bridge].forEach(m => assert.ok(!hasOrderMethod(m)));
});
await t('every paper candidate is paper:true/executed:false', () => {
  bridge.candidatesFromGovernance().forEach(c => { assert.strictEqual(c.paper,true); assert.strictEqual(c.executed,false); });
});
await t('alpaca adapter never targets the TRADING host (only data host)', () => {
  const src = fs.readFileSync(path.join(__dirname,'..','data_layer','adapters','alpaca','index.js'),'utf8');
  assert.ok(!/api\.alpaca\.markets/.test(src), 'references the trading host');
  assert.ok(/data\.alpaca\.markets/.test(src), 'should reference the data host');
});

console.log('\n────────────────────────────────────────');
console.log('RESULT  pass=' + pass + '  fail=' + fail);
if (fail){ console.log('FAILURES:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('ALL UNIT/CONTRACT TESTS PASSED');
})();
