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
 * EXECUTION (Option B):
 *  - By default the engine is SIMULATION ONLY: a trade lives in this ledger and
 *    the broker is never told. Alpaca is contacted with GET only.
 *  - If the operator arms execution (ALPACA_EXECUTE=true, paper host, PK key,
 *    PA account — see connectors/alpaca/alpaca_execution.js), each newly opened
 *    trade is ALSO submitted as a market order to the Alpaca PAPER account, and
 *    the real paper balance moves.
 *  - live_trading remains structurally impossible: a live host or a live AK key
 *    is refused by the execution guards, not merely discouraged.
 *
 * HARD SAFETY (unchanged):
 *  - Every trade is paper:true. `executed` reports the TRUTH: false while
 *    simulated, true only once the broker accepts the paper order.
 *  - When PAUSED the engine still reads + scores, but opens NO new trades.
 */
const scoring = require('../data_layer/signal_scoring');
const runState = require('./run_state');
const catalog = require('./strategies');
const slotConfig = require('./slot_config');
const allocation = require('./allocation');
const prices = require('../data_layer/prices');

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

// ── Per-slot paper ledgers (in-memory; paper:true always) ──────────────────────
const _ledgers = {};
SLOT_IDS.forEach(id => { _ledgers[id] = []; });
let _tradeSeq = 0;

// Fixture providers. These are static sample data — trading them means trading
// fiction, which is what the system was doing before real signals existed.
// Opt back in with TRADE_ON_MOCK_SIGNALS=true only for demos.
const MOCK_PROVIDERS = ['13f_mock', 'congress_mock', 'insider_mock'];

// A strategy that only accepts fixture providers cannot trade once fixtures are
// excluded. That is correct — Insider Follow should not silently start trading
// momentum and call it insider data — but it must be VISIBLE, not a strategy
// that quietly sits at 0 forever with no explanation.
const REAL_SOURCE_FOR = {
  '13f_mock':      { needs: 'A real 13F feed', free: 'SEC EDGAR (keyless, already in your provider list)' },
  'insider_mock':  { needs: 'A real Form 4 insider feed', free: 'SEC EDGAR (keyless, already in your provider list)' },
  'congress_mock': { needs: 'A real congressional-trade feed', free: 'Quiver Quant — limited free tier (CONGRESS_API_KEY)' }
};

function _sourceAvailability(profile){
  const src = profile.sources || [];
  if (!src.length) return { available: true, blocked_by: null, needs: null, free: null };
  if (_mockAllowed()) return { available: true, blocked_by: null, needs: null, free: null };
  const realOnes = src.filter(x => !MOCK_PROVIDERS.includes(x));
  if (realOnes.length) return { available: true, blocked_by: null, needs: null, free: null };
  const info = REAL_SOURCE_FOR[src[0]] || { needs: 'A real feed for ' + src.join(', '), free: null };
  return { available: false, blocked_by: src.join(', '), needs: info.needs, free: info.free };
}
function _mockAllowed(){
  return String(process.env.TRADE_ON_MOCK_SIGNALS || '').trim().toLowerCase() === 'true';
}

// Which signals does a strategy act on?
function _selectFor(profile, ranked){
  const allowMock = _mockAllowed();
  return ranked.filter(s => {
    if (!allowMock && MOCK_PROVIDERS.includes(s.provider)) return false;
    if (s.score < profile.threshold) return false;
    if (!profile.allowSides.includes(s.direction || 'long')) return false;
    if (profile.sources && profile.sources.length && !profile.sources.includes(s.provider)) return false;
    return true;
  });
}

// Position size from the slot's OWN allocated bucket, not the whole account.
//
// riskPct is a % of the account in the strategy profiles, but a slot only holds
// 1/12th of the account. Scaling it by slots_funded keeps each strategy's
// relative aggressiveness intact while confining it to its bucket: a 3% risk
// strategy still risks 3x what a 1% one does, both out of their own share.
function _sizePosition(profile, price, capital, slotsFunded){
  const scale = slotsFunded > 0 ? slotsFunded : 1;
  const dollars = capital * (profile.riskPct / 100) * scale;
  // price is guaranteed real by the caller — no placeholder here either.
  const qty = Math.floor(dollars / price);
  return { qty, notional: +(qty * price).toFixed(2) };
}

function _openPaper(slot, sig, alloc){
  const ledger = _ledgers[slot.id];
  const p = slot.profile;
  const openCount = ledger.filter(t => t.status === 'open').length;
  if (openCount >= p.maxOpen) return null;
  if (ledger.some(t => t.symbol === sig.symbol && t.status === 'open')) return null;

  const capital = alloc.per_slot[slot.id] || 0;
  if (capital <= 0) return null;                       // slot holds no money

  // A position is NEVER opened without a real traded price.
  //
  // This used to fall back to `: 100`, and mock signals carry no price, so every
  // position in the system was booked at $100 — MSFT included, near $428. Share
  // counts and notionals were wrong, and marking those entries against real
  // prices reported profit that never existed. Prefer the signal's own price,
  // then the live price service; if neither has one, skip and say why.
  const price = Number(sig.price) > 0 ? Number(sig.price) : prices.get(sig.symbol);
  if (!(Number(price) > 0)) return { _skip: 'no_price', symbol: sig.symbol };

  let sized = _sizePosition(p, price, capital, alloc.slots_funded);
  // Below one share at the real price — skip rather than round up to a lie.
  if (sized.qty < 1) return { _skip: 'below_one_share', symbol: sig.symbol };

  // A slot may never deploy more than its own bucket. Trim the last position
  // to the cash it has left; if that buys nothing, skip rather than overspend.
  const deployed = ledger.filter(t => t.status === 'open')
                         .reduce((a, t) => a + (t.notional || 0), 0);
  const room = +(capital - deployed).toFixed(2);
  if (room <= 0) return null;
  if (sized.notional > room) {
    const qty = Math.floor(room / price);
    if (qty < 1) return null;
    sized = { qty, notional: +(qty * price).toFixed(2) };
  }

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
    slot_capital: capital,
    equity_basis: alloc.equity,
    equity_source: _equityCache.source,
    status: 'open',
    opened_at: new Date().toISOString(),
    paper: true,        // hard invariant — never a live account
    executed: false,    // truthful: flipped to true only if the broker accepts
    broker: null        // {order_id, status} once submitted, or {error}
  };
  ledger.push(trade);
  _maybeExecute(trade);
  return trade;
}

// ── Option B: mirror the paper trade to the Alpaca PAPER account ────────────
// Fire-and-forget so a slow or failing broker can never stall a tick. The
// guards inside alpaca_execution decide whether anything is sent at all; if
// execution is not armed this is a no-op and the trade stays simulated.
function _maybeExecute(trade) {
  let exec;
  try { exec = require('../connectors/alpaca/alpaca_execution'); } catch { return; }
  if (!exec.guardStatic().allowed) return;         // not armed — stay simulated
  if (trade.side === 'neutral') return;            // nothing to send

  exec.submitOrder({
    symbol: trade.symbol,
    side: trade.side === 'short' ? 'sell' : 'buy',
    qty: trade.qty
  }).then(r => {
    if (r.ok) {
      trade.executed = true;                       // the broker really has it
      trade.broker = { order_id: r.order.broker_order_id, status: r.order.status, paper: true };
    } else {
      trade.broker = { error: r.reason, blocked_by: r.blocked_by || null, message: r.message || null };
    }
  }).catch(e => { trade.broker = { error: 'exception', message: e.message }; });
}

// One engine tick: score once, apply every enabled+configured strategy slot.
function tick(opts = {}){
  const paused = runState.isPaused();
  const ranked = scoring.rankSignals({ trend: opts.trend || 'long' });
  const equity = _equity();
  const slots = _slots();
  const actions = [];
  const skipped = [];

  // Only slots that can actually trade get funded, so the split always covers
  // exactly what is running — no money parked in a disabled strategy.
  const fundable = slots.filter(s => s.enabled && s.configured).map(s => s.id);
  const alloc = allocation.allocate(equity, fundable);

  for (const slot of slots){
    if (!slot.enabled){ skipped.push({ slot: slot.id, reason: 'disabled' }); continue; }
    if (!slot.configured){ skipped.push({ slot: slot.id, reason: 'no_keys' }); continue; }
    const picks = _selectFor(slot.profile, ranked);
    for (const sig of picks){
      if (paused) continue;                       // PAUSED: read + score only
      const t = _openPaper(slot, sig, alloc);
      if (!t) continue;
      if (t._skip){ skipped.push({ slot: slot.id, symbol: t.symbol, reason: t._skip }); continue; }
      actions.push(t);
    }
  }

  return {
    paused,
    ranked_count: ranked.length,
    tradable_count: ranked.filter(s => _mockAllowed() || !MOCK_PROVIDERS.includes(s.provider)).length,
    mock_signals_tradable: _mockAllowed(),
    slots_active: slots.filter(s => s.enabled && s.configured).length,
    slots_total: slots.length,
    equity_basis: equity,
    equity_source: _equityCache.source,
    allocation: { mode: alloc.mode, per_slot_capital: alloc.per_slot,
                  slots_funded: alloc.slots_funded, reserve: alloc.reserve },
    opened_now: actions.length,
    actions,
    skipped,
    paper: true,
    execution_armed: _execArmed(),
    note: paused
      ? 'PAUSED — reading data and scoring; no new trades opened.'
      : (_execArmed()
          ? 'RUNNING — opened qualifying trades and submitted them to the Alpaca PAPER account.'
          : 'RUNNING — opened qualifying paper trades (simulation only, no broker orders).')
  };
}

// Is Option B execution armed right now? Static guards only, no network call.
function _execArmed(){
  try { return require('../connectors/alpaca/alpaca_execution').guardStatic().allowed; }
  catch { return false; }
}

// Full status snapshot for the dashboard.
/**
 * Warm real prices for every symbol the engine might act on, then tick.
 * tick() stays synchronous for existing callers; this is the entry point that
 * guarantees prices are present before sizing, so positions are not skipped
 * merely because nothing had fetched a quote yet.
 */
async function tickFresh(opts = {}){
  try { await refreshEquity(); } catch {}
  try {
    const ranked = scoring.rankSignals({ trend: (opts && opts.trend) || 'long' });
    await prices.warm(ranked.map(s => s.symbol));
  } catch {}
  return tick(opts || {});
}

/**
 * Same as status(), but waits for a real equity read when the cache is cold.
 * status() must stay synchronous for existing callers, but the dashboard needs
 * the REAL balance on first paint — otherwise it shows the $100,000 default and
 * divides the capital off a number that is not the operator's account.
 */
async function statusFresh(){
  const stale = !_equityCache.value || (Date.now() - _equityCache.ts) >= EQUITY_TTL_MS;
  if (stale && _globalKeysPresent()) { try { await refreshEquity(); } catch {} }
  return status();
}

function status(){
  const slots = _slots();
  const rs = runState.read();
  const equity = _equity();
  const fundable = slots.filter(s => s.enabled && s.configured).map(s => s.id);
  const alloc = allocation.allocate(equity, fundable);
  return {
    system: 'BROKER_AI_OS_V7',
    paused: rs.paused,
    run_state: rs,
    equity_basis: equity,
    equity_source: _equityCache.source,
    equity_account_status: _equityCache.account_status,
    allocation: alloc,
    equity_error: _equityCache.error,
    strategies_available: catalog.NAMES.length,
    mock_signals_tradable: _mockAllowed(),
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
        signal_source: _sourceAvailability(p),
        threshold: p.threshold,
        max_open: p.maxOpen,
        allow_sides: p.allowSides,
        risk_pct: p.riskPct,
        max_hold_days: p.maxHoldDays,
        sources: p.sources,
        open_trades: open.length,
        total_trades: ledger.length,
        slot_capital: alloc.per_slot[s.id] || 0,
        deployed_notional: +open.reduce((a,t)=>a+(t.notional||0),0).toFixed(2),
        cash_remaining: +((alloc.per_slot[s.id] || 0)
          - open.reduce((a,t)=>a+(t.notional||0),0)).toFixed(2),
        note: p.note,
        paper: true,
        broker_orders: ledger.filter(t => t.executed === true).length
      };
    }),
    strategies: catalog.STRATEGIES,
    execution_armed: _execArmed(),
    note: `${slots.length} strategy slots, ${catalog.NAMES.length} strategies available. Paper-only.` +
      (_execArmed() ? ' Orders ARE being sent to your Alpaca PAPER account.'
                    : ' Simulation only — no broker orders.')
  };
}

function trades(slotId){
  const id = String(slotId || '').toUpperCase();
  if (!_ledgers[id]) return { ok:false, error:'unknown_slot', slot:slotId };
  return { ok:true, slot:id, account:id, trades:_ledgers[id], paper:true, execution_armed:_execArmed() };
}

function allTrades(){
  const all = [];
  for (const id of SLOT_IDS) all.push(..._ledgers[id]);
  return { ok:true, count: all.length, trades: all.sort((a,b)=>b.id-a.id), paper:true, execution_armed:_execArmed() };
}

module.exports = {
  tick, tickFresh, status, statusFresh, trades, allTrades, refreshEquity, allocation, prices,
  STRATEGIES: catalog.STRATEGIES, strategies: catalog.list,
  SLOT_IDS, _slots
};
