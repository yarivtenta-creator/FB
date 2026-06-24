'use strict';
/**
 * strategy_engine — runs THREE strategy profiles in parallel, one per Alpaca paper
 * account, all from this one system. SCORING + PAPER SIMULATION ONLY.
 *
 * Design:
 *  - All three accounts read the SAME live market data (prices are identical across
 *    paper accounts), so we score signals once and apply three different filters.
 *  - Each strategy = a score threshold + max open trades + risk profile. Higher
 *    threshold = more selective = "more secure".
 *  - Each account keeps its OWN paper ledger so you can compare performance.
 *
 * HARD SAFETY (unchanged):
 *  - No broker client, no order/execute path anywhere. Everything is paper:true /
 *    executed:false. Account keys are READ-ONLY market-data keys.
 *  - When PAUSED (see run_state.js) the engine still reads data + scores signals,
 *    but opens NO new paper trades.
 */
const scoring = require('../data_layer/signal_scoring');
const runState = require('./run_state');

// ── Strategy profiles (tunable). Each maps to one Alpaca paper account. ──────────
// threshold  = minimum signal score to act on (higher = more selective/secure)
// maxOpen    = max simultaneous open paper trades
// qty        = paper position size per trade
// allowSides = which directions this strategy will take
const STRATEGIES = {
  conservative: {
    label: 'Conservative (most secure)',
    threshold: 0.72,           // only the strongest signals
    maxOpen: 2,
    qty: 1,
    allowSides: ['long'],      // long-only; avoids shorting
    note: 'Highest-confidence signals only, long-only, very few positions.'
  },
  balanced: {
    label: 'Balanced',
    threshold: 0.62,
    maxOpen: 4,
    qty: 1,
    allowSides: ['long', 'short'],
    note: 'Medium-confidence signals, both directions, moderate position count.'
  },
  aggressive: {
    label: 'Aggressive',
    threshold: 0.50,           // takes more, looser filter
    maxOpen: 8,
    qty: 1,
    allowSides: ['long', 'short', 'neutral'],
    note: 'Takes more signals incl. weaker ones, both directions, many positions.'
  }
};

// ── Account → strategy assignment (read from env; presence-only for keys). ───────
// Each account is configured by its own key pair + a strategy name. Keys are never
// logged or returned; we only report whether each account is "configured".
function _accounts(){
  return [
    {
      id: 'A',
      strategy: (process.env.STRATEGY_A || 'conservative').trim().toLowerCase(),
      keyEnv: 'ALPACA_A_KEY_ID', secretEnv: 'ALPACA_A_SECRET'
    },
    {
      id: 'B',
      strategy: (process.env.STRATEGY_B || 'balanced').trim().toLowerCase(),
      keyEnv: 'ALPACA_B_KEY_ID', secretEnv: 'ALPACA_B_SECRET'
    },
    {
      id: 'C',
      strategy: (process.env.STRATEGY_C || 'aggressive').trim().toLowerCase(),
      keyEnv: 'ALPACA_C_KEY_ID', secretEnv: 'ALPACA_C_SECRET'
    }
  ].map(a => ({
    ...a,
    configured: _present(a.keyEnv) && _present(a.secretEnv),
    profile: STRATEGIES[a.strategy] || STRATEGIES.balanced
  }));
}
function _present(envName){
  return typeof process.env[envName] === 'string' && process.env[envName].trim() !== '';
}

// ── Per-account paper ledgers (in-memory; mirrors paper:true/executed:false). ────
// Keyed by account id. Each trade is a pure simulation.
const _ledgers = { A: [], B: [], C: [] };
let _tradeSeq = 0;

// Which signals does a strategy act on, given the shared ranked list?
function _selectFor(profile, ranked){
  return ranked.filter(s =>
    s.score >= profile.threshold &&
    profile.allowSides.includes(s.direction || 'long')
  );
}

// Open a PAPER trade in an account's ledger (simulation only). Never a real order.
function _openPaper(accId, profile, sig){
  const ledger = _ledgers[accId];
  const openCount = ledger.filter(t => t.status === 'open').length;
  if (openCount >= profile.maxOpen) return null;          // respect max open
  if (ledger.some(t => t.symbol === sig.symbol && t.status === 'open')) return null; // no dup
  const trade = {
    id: ++_tradeSeq,
    account: accId,
    strategy: profile.label,
    symbol: sig.symbol,
    side: sig.direction === 'short' ? 'short' : 'long',
    qty: profile.qty,
    entry_score: sig.score,
    status: 'open',
    opened_at: new Date().toISOString(),
    paper: true,        // hard invariant
    executed: false     // hard invariant — never a real order
  };
  ledger.push(trade);
  return trade;
}

// One engine tick: score once, apply all three strategies. Honors pause state.
function tick(opts = {}){
  const paused = runState.isPaused();
  const ranked = scoring.rankSignals({ trend: opts.trend || 'long' });
  const accounts = _accounts();
  const actions = [];

  for (const acc of accounts){
    if (!acc.configured) continue;                 // skip accounts with no keys
    const picks = _selectFor(acc.profile, ranked);
    for (const sig of picks){
      if (paused){ continue; }                     // PAUSED: read+score only, no new trades
      const t = _openPaper(acc.id, acc.profile, sig);
      if (t) actions.push(t);
    }
  }

  return {
    paused,
    ranked_count: ranked.length,
    opened_now: actions.length,
    actions,
    note: paused
      ? 'PAUSED — still reading data and scoring; no new paper trades opened.'
      : 'RUNNING — opened any qualifying new paper trades (simulation only).'
  };
}

// Full status snapshot for the dashboard.
function status(){
  const accounts = _accounts();
  const rs = runState.read();
  return {
    paused: rs.paused,
    run_state: rs,
    accounts: accounts.map(a => {
      const ledger = _ledgers[a.id];
      const open = ledger.filter(t => t.status === 'open');
      return {
        account: a.id,
        strategy: a.strategy,
        strategy_label: a.profile.label,
        configured: a.configured,
        threshold: a.profile.threshold,
        max_open: a.profile.maxOpen,
        allow_sides: a.profile.allowSides,
        open_trades: open.length,
        total_trades: ledger.length,
        note: a.profile.note,
        paper: true,
        executed: false
      };
    }),
    strategies: STRATEGIES,
    note: 'Three paper accounts, three strategies, one system. Paper-only; no execution.'
  };
}

// Per-account trade ledger (paper only).
function trades(accId){
  const id = String(accId || '').toUpperCase();
  if (!_ledgers[id]) return { ok:false, error:'unknown_account', account:accId };
  return { ok:true, account:id, trades:_ledgers[id], paper:true, executed:false };
}

module.exports = { tick, status, trades, STRATEGIES, _accounts };
