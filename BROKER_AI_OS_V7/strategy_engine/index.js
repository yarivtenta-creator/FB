'use strict';
/**
 * strategy_engine — BROKER_AI_OS_V7 multi-strategy paper engine.
 *
 * Runs MANY strategies in parallel. Each slot = one strategy bound to one Alpaca
 * PAPER account. Multiple slots may share the same paper account.
 *
 * "Uses Alpaca money" = position sizing is computed from the REAL equity read from
 * your Alpaca PAPER account (read-only GET /v2/account). The trades themselves are
 * SIMULATED in this system's ledger.
 *
 * HARD SAFETY (unchanged):
 *  - No broker client, no order path, no execution anywhere.
 *  - Every trade is paper:true / executed:false.
 *  - Alpaca is contacted with GET only. Never POST/DELETE. Never /v2/orders.
 *  - When PAUSED the engine still reads + scores, but opens NO new paper trades.
 */
const scoring = require('../data_layer/signal_scoring');
const runState = require('./run_state');
const catalog = require('./strategies');
const slotConfig = require('./slot_config');

const DEFAULT_EQUITY = 100000;   // used only when no real Alpaca equity is available

// ── Slot configuration ──────────────────────────────────────────────────────────
// Slots A..L. Each slot: STRATEGY_<ID> picks the strategy, ALPACA_<ID>_KEY_ID /
// ALPACA_<ID>_SECRET bind it to a paper account. A slot with no strategy set falls
// back to a sensible default so the full catalog can run out of the box.
const SLOT_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const DEFAULT_ASSIGNMENT = [
  'conservative','balanced','aggressive','momentum','mean_reversion','insider_follow',
  'congress_follow','institutional_13f','high_conviction','diversified','swing','contrarian'
];

function _present(name){
  return typeof process.env[name] === 'string' && process.env[name].trim() !== '';
}

// Global fallback keys — lets every slot run off one key pair if that's all you have.
function _globalKeysPresent(){
  return (_present('ALPACA_API_KEY') || _present('ALPACA_API_KEY_ID')) &&
         (_present('ALPACA_SECRET_KEY') || _present('ALPACA_API_SECRET_KEY'));
}

function _slots(){
  return SLOT_IDS.map((id, i) => {
    const stratName = (process.env['STRATEGY_' + id] || DEFAULT_ASSIGNMENT[i] || 'balanced')
      .trim().toLowerCase();
    const profile = catalog.get(stratName) || catalog.get('balanced');
    const ownKeys = _present('ALPACA_' + id + '_KEY_ID') && _present('ALPACA_' + id + '_SECRET');
    // Operator toggle (persisted) wins; env var is the fallback default.
    const envDefault = (process.env['SLOT_' + id + '_ENABLED'] || 'true').trim().toLowerCase() !== 'false';
    const enabled = envDefault && slotConfig.isEnabled(id);
    return {
      id,
      strategy: stratName,
      profile,
      own_keys: ownKeys,
      // A slot is "configured" if it has its own keys OR global keys exist.
      configured: ownKeys || _globalKeysPresent(),
      key_source: ownKeys ? ('ALPACA_' + id + '_KEY_ID') : (_globalKeysPresent() ? 'ALPACA_API_KEY (shared)' : null),
      enabled
    };
  });
}

// ── Real Alpaca PAPER equity (READ-ONLY). Cached; never blocks a tick. ──────────
const _equityCache = { value: null, ts: 0, source: 'default', error: null, account_status: null };
const EQUITY_TTL_MS = 60000;

async function refreshEquity(){
  const apiKey = (process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '').trim();
  const secret = (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '').trim();
  const baseUrl = (process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets').replace(/\/+$/,'');
  if (!apiKey || !secret){
    _equityCache.source = 'default'; _equityCache.error = 'no_keys';
    return { ok:false, reason:'no_keys', equity: DEFAULT_EQUITY };
  }
  try {
    // READ-ONLY GET. Never an order endpoint.
    const res = await fetch(`${baseUrl}/v2/account`, { method:'GET', headers:{
      'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': secret, 'accept':'application/json'
    }});
    if (!res.ok){
      _equityCache.error = 'http_' + res.status; _equityCache.source = 'default';
      return { ok:false, status:res.status, equity: DEFAULT_EQUITY };
    }
    const j = await res.json();
    const eq = Number(j.equity);
    if (eq > 0){
      _equityCache.value = eq; _equityCache.ts = Date.now();
      _equityCache.source = 'alpaca_paper'; _equityCache.error = null;
      _equityCache.account_status = j.status || null;
      return { ok:true, equity: eq, account_status: j.status };
    }
    return { ok:false, reason:'no_equity_field', equity: DEFAULT_EQUITY };
  } catch(e){
    _equityCache.error = e.message; _equityCache.source = 'default';
    return { ok:false, reason:'fetch_error', error:e.message, equity: DEFAULT_EQUITY };
  }
}

function _equity(){
  const fresh = _equityCache.value && (Date.now() - _equityCache.ts) < EQUITY_TTL_MS;
  if (!fresh && _globalKeysPresent()) refreshEquity().catch(()=>{});   // warm in background
  return _equityCache.value || DEFAULT_EQUITY;
}

// ── Per-slot paper ledgers (in-memory; paper:true / executed:false always) ──────
const _ledgers = {};
SLOT_IDS.forEach(id => { _ledgers[id] = []; });
let _tradeSeq = 0;

// Which signals does a strategy act on?
function _selectFor(profile, ranked){
  return ranked.filter(s => {
    if (s.score < profile.threshold) return false;
    if (!profile.allowSides.includes(s.direction || 'long')) return false;
    if (profile.sources && profile.sources.length && !profile.sources.includes(s.provider)) return false;
    return true;
  });
}

// Paper position size from REAL account equity + strategy risk %.
function _sizePosition(profile, price, equity){
  const dollars = equity * (profile.riskPct / 100);
  const px = price > 0 ? price : 100;
  return { qty: Math.max(1, Math.floor(dollars / px)), notional: +dollars.toFixed(2) };
}

function _openPaper(slot, sig, equity){
  const ledger = _ledgers[slot.id];
  const p = slot.profile;
  const openCount = ledger.filter(t => t.status === 'open').length;
  if (openCount >= p.maxOpen) return null;
  if (ledger.some(t => t.symbol === sig.symbol && t.status === 'open')) return null;

  const price = Number(sig.price) > 0 ? Number(sig.price) : 100;
  const sized = _sizePosition(p, price, equity);

  const trade = {
    id: ++_tradeSeq,
    slot: slot.id,
    strategy: slot.strategy,
    strategy_label: p.label,
    symbol: sig.symbol,
    side: sig.direction === 'short' ? 'short' : (sig.direction === 'neutral' ? 'neutral' : 'long'),
    qty: sized.qty,
    notional: sized.notional,
    entry_price: price,
    entry_score: sig.score,
    risk_pct: p.riskPct,
    equity_basis: equity,
    equity_source: _equityCache.source,
    status: 'open',
    opened_at: new Date().toISOString(),
    paper: true,        // hard invariant
    executed: false     // hard invariant — never a real order
  };
  ledger.push(trade);
  return trade;
}

// One engine tick: score once, apply every enabled+configured strategy slot.
function tick(opts = {}){
  const paused = runState.isPaused();
  const ranked = scoring.rankSignals({ trend: opts.trend || 'long' });
  const equity = _equity();
  const slots = _slots();
  const actions = [];
  const skipped = [];

  for (const slot of slots){
    if (!slot.enabled){ skipped.push({ slot: slot.id, reason: 'disabled' }); continue; }
    if (!slot.configured){ skipped.push({ slot: slot.id, reason: 'no_keys' }); continue; }
    const picks = _selectFor(slot.profile, ranked);
    for (const sig of picks){
      if (paused) continue;                       // PAUSED: read + score only
      const t = _openPaper(slot, sig, equity);
      if (t) actions.push(t);
    }
  }

  return {
    paused,
    ranked_count: ranked.length,
    slots_active: slots.filter(s => s.enabled && s.configured).length,
    slots_total: slots.length,
    equity_basis: equity,
    equity_source: _equityCache.source,
    opened_now: actions.length,
    actions,
    skipped,
    paper: true,
    executed: false,
    note: paused
      ? 'PAUSED — reading data and scoring; no new paper trades opened.'
      : 'RUNNING — opened qualifying new paper trades (simulation only, no real orders).'
  };
}

// Full status snapshot for the dashboard.
function status(){
  const slots = _slots();
  const rs = runState.read();
  const equity = _equity();
  return {
    system: 'BROKER_AI_OS_V7',
    paused: rs.paused,
    run_state: rs,
    equity_basis: equity,
    equity_source: _equityCache.source,
    equity_account_status: _equityCache.account_status,
    equity_error: _equityCache.error,
    strategies_available: catalog.NAMES.length,
    slots_total: slots.length,
    slots_active: slots.filter(s => s.enabled && s.configured).length,
    accounts: slots.map(s => {
      const ledger = _ledgers[s.id];
      const open = ledger.filter(t => t.status === 'open');
      const p = s.profile;
      return {
        account: s.id,
        slot: s.id,
        strategy: s.strategy,
        strategy_label: p.label,
        tier: p.tier,
        configured: s.configured,
        enabled: s.enabled,
        key_source: s.key_source,
        threshold: p.threshold,
        max_open: p.maxOpen,
        allow_sides: p.allowSides,
        risk_pct: p.riskPct,
        max_hold_days: p.maxHoldDays,
        sources: p.sources,
        open_trades: open.length,
        total_trades: ledger.length,
        deployed_notional: +open.reduce((a,t)=>a+(t.notional||0),0).toFixed(2),
        note: p.note,
        paper: true,
        executed: false
      };
    }),
    strategies: catalog.STRATEGIES,
    note: `${slots.length} strategy slots, ${catalog.NAMES.length} strategies available. Paper-only; no execution.`
  };
}

function trades(slotId){
  const id = String(slotId || '').toUpperCase();
  if (!_ledgers[id]) return { ok:false, error:'unknown_slot', slot:slotId };
  return { ok:true, slot:id, account:id, trades:_ledgers[id], paper:true, executed:false };
}

function allTrades(){
  const all = [];
  for (const id of SLOT_IDS) all.push(..._ledgers[id]);
  return { ok:true, count: all.length, trades: all.sort((a,b)=>b.id-a.id), paper:true, executed:false };
}

module.exports = {
  tick, status, trades, allTrades, refreshEquity,
  STRATEGIES: catalog.STRATEGIES, strategies: catalog.list,
  SLOT_IDS, _slots
};
