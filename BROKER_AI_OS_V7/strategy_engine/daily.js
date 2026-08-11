'use strict';
/**
 * daily.js — "what changed today", per strategy.
 *
 * The engine knows its state right now, but not what it looked like yesterday.
 * This records one snapshot per UTC day and reports the deltas between the
 * latest snapshot and the one before it, so each morning you can see which
 * strategies moved, which opened positions, and what the account did.
 *
 * MARK TO MARKET
 * Open paper positions are valued at the latest price from Alpaca (READ-ONLY
 * GET /v2/stocks/{sym}/trades/latest). When a price cannot be fetched the
 * position is held at its entry price and the row is marked `stale: true` —
 * an unpriced position is reported as unpriced, never quietly valued at entry
 * and presented as a real mark.
 *
 * Snapshots are keyed by UTC date. Taking one twice in a day overwrites that
 * day's entry rather than creating a second, so a restart or an extra click
 * cannot corrupt the history.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'runtime', 'daily_history.json');
const MAX_DAYS = 400;

function _today() { return new Date().toISOString().slice(0, 10); }

function _read() {
  try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); return Array.isArray(j) ? j : []; }
  catch { return []; }
}

function _write(list) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(list.slice(-MAX_DAYS), null, 2));
    return true;
  } catch { return false; }
}

// ── Prices (READ-ONLY) ───────────────────────────────────────────────────────
async function _latestPrices(symbols) {
  const out = {};
  const key = (process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '').trim();
  const sec = (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '').trim();
  if (!key || !sec || !symbols.length) return out;

  const dataUrl = (process.env.ALPACA_DATA_URL || process.env.ALPACA_DATA_BASE_URL
                   || 'https://data.alpaca.markets').replace(/\/+$/, '');
  const headers = { 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': sec, accept: 'application/json' };

  await Promise.all(symbols.map(async sym => {
    try {
      const res = await fetch(`${dataUrl}/v2/stocks/${encodeURIComponent(sym)}/trades/latest`,
        { method: 'GET', headers });
      if (!res.ok) return;
      const j = await res.json();
      const p = Number(j && j.trade && j.trade.p);
      if (p > 0) out[sym] = p;
    } catch { /* leave unpriced — the row will be marked stale */ }
  }));
  return out;
}

/**
 * Build today's snapshot from live engine state. Does not persist.
 * Pulled out of take() so the dashboard can preview without writing history.
 */
async function build() {
  const engine = require('./index');
  const st = engine.status();
  const all = engine.allTrades().trades;

  const open = all.filter(t => t.status === 'open');
  const symbols = [...new Set(open.map(t => t.symbol))];
  const prices = await _latestPrices(symbols);
  const pricedCount = symbols.filter(s => prices[s] != null).length;

  const slots = st.accounts.map(a => {
    const mine = open.filter(t => t.slot === a.slot);
    let value = 0, cost = 0, stale = 0;
    for (const t of mine) {
      const px = prices[t.symbol];
      const entry = Number(t.entry_price) || 0;
      const mark = px != null ? px : entry;
      if (px == null) stale++;
      const dir = t.side === 'short' ? -1 : 1;
      cost  += entry * t.qty;
      value += entry * t.qty + dir * (mark - entry) * t.qty;
    }
    return {
      slot: a.slot,
      strategy: a.strategy,
      label: a.strategy_label,
      enabled: a.enabled,
      capital: a.slot_capital,
      open_trades: mine.length,
      total_trades: a.total_trades,
      deployed: +cost.toFixed(2),
      market_value: +value.toFixed(2),
      unrealized_pl: +(value - cost).toFixed(2),
      broker_orders: a.broker_orders || 0,
      stale_prices: stale
    };
  });

  const deployed = +slots.reduce((s, x) => s + x.deployed, 0).toFixed(2);
  const value = +slots.reduce((s, x) => s + x.market_value, 0).toFixed(2);

  return {
    date: _today(),
    taken_at: new Date().toISOString(),
    equity: st.equity_basis,
    equity_source: st.equity_source,
    allocation_mode: st.allocation && st.allocation.mode,
    slots_funded: st.allocation && st.allocation.slots_funded,
    paused: st.paused,
    execution_armed: st.execution_armed,
    total_open: open.length,
    total_trades: all.length,
    total_deployed: deployed,
    total_market_value: value,
    total_unrealized_pl: +(value - deployed).toFixed(2),
    priced_symbols: pricedCount,
    total_symbols: symbols.length,
    prices_complete: symbols.length === 0 || pricedCount === symbols.length,
    slots
  };
}

/** Build and persist today's snapshot, replacing any earlier one for today. */
async function take() {
  const snap = await build();
  const list = _read().filter(s => s.date !== snap.date);
  list.push(snap);
  list.sort((a, b) => a.date.localeCompare(b.date));
  _write(list);
  return snap;
}

function history(limit) {
  const list = _read();
  const n = Math.min(Math.max(Number(limit) || 30, 1), MAX_DAYS);
  return list.slice(-n);
}

function _delta(cur, prev, field) {
  const a = Number(cur && cur[field]) || 0;
  const b = Number(prev && prev[field]) || 0;
  return +(a - b).toFixed(2);
}

/**
 * What changed between the two most recent snapshots.
 * With only one snapshot there is nothing to compare — say so plainly rather
 * than invent a zero-change report that looks like a flat day.
 */
function changes() {
  const list = _read();
  if (!list.length) {
    return { ok: false, reason: 'no_snapshots',
             note: 'No daily snapshot has been taken yet. Take one to start the history.' };
  }
  const cur = list[list.length - 1];
  const prev = list.length > 1 ? list[list.length - 2] : null;

  if (!prev) {
    return { ok: true, first_day: true, date: cur.date, previous_date: null,
             current: cur, changes: [],
             note: `First snapshot (${cur.date}). Come back tomorrow and this will show what moved.` };
  }

  const bySlot = {};
  for (const s of prev.slots || []) bySlot[s.slot] = s;

  const rows = (cur.slots || []).map(s => {
    const p = bySlot[s.slot] || {};
    return {
      slot: s.slot, strategy: s.strategy, label: s.label, enabled: s.enabled,
      capital: s.capital,
      capital_change: _delta(s, p, 'capital'),
      open_trades: s.open_trades,
      new_trades: Math.max(0, (s.total_trades || 0) - (p.total_trades || 0)),
      deployed: s.deployed,
      deployed_change: _delta(s, p, 'deployed'),
      market_value: s.market_value,
      value_change: _delta(s, p, 'market_value'),
      unrealized_pl: s.unrealized_pl,
      pl_change: _delta(s, p, 'unrealized_pl'),
      stale_prices: s.stale_prices
    };
  });

  const movers = rows.filter(r => r.pl_change !== 0)
                     .sort((a, b) => Math.abs(b.pl_change) - Math.abs(a.pl_change));

  return {
    ok: true,
    first_day: false,
    date: cur.date,
    previous_date: prev.date,
    days_apart: Math.round((Date.parse(cur.date) - Date.parse(prev.date)) / 86400000),
    account: {
      equity: cur.equity,
      equity_change: _delta(cur, prev, 'equity'),
      deployed: cur.total_deployed,
      deployed_change: _delta(cur, prev, 'total_deployed'),
      market_value: cur.total_market_value,
      value_change: _delta(cur, prev, 'total_market_value'),
      unrealized_pl: cur.total_unrealized_pl,
      pl_change: _delta(cur, prev, 'total_unrealized_pl'),
      new_trades: Math.max(0, (cur.total_trades || 0) - (prev.total_trades || 0))
    },
    prices_complete: cur.prices_complete,
    price_note: cur.prices_complete ? null
      : `${cur.priced_symbols}/${cur.total_symbols} symbols priced. Unpriced positions are held at entry and marked stale.`,
    best: movers[0] || null,
    worst: movers.length > 1 ? movers[movers.length - 1] : null,
    changes: rows
  };
}

function status() {
  const list = _read();
  return {
    snapshots: list.length,
    first_date: list.length ? list[0].date : null,
    last_date: list.length ? list[list.length - 1].date : null,
    today_taken: list.some(s => s.date === _today()),
    file: 'runtime/daily_history.json'
  };
}

function clear() { _write([]); return { ok: true, cleared: true }; }

module.exports = { build, take, history, changes, status, clear, FILE };
