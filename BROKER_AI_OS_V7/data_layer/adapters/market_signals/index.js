'use strict';
/**
 * adapters/market_signals — REAL signals computed from REAL market data.
 *
 * WHY THIS EXISTS
 * Every strategy in this system was trading `13f_mock`, `congress_mock` and
 * `insider_mock` — six static fixtures whose own file says "Mock sample." The
 * engine was real, the money was real, the signals were fiction.
 *
 * This adapter replaces that with something honest: daily bars pulled from
 * Alpaca (READ-ONLY), turned into momentum and trend signals by arithmetic you
 * can read below. No fixtures, no invented numbers. If the bars cannot be
 * fetched, it returns an error and NO signals — it never falls back to fake data.
 *
 * WHAT IT COMPUTES (all from actual closes)
 *   ret_20d     20-session return
 *   sma20/50    simple moving averages
 *   trend       sma20 above sma50 = uptrend
 *   volatility  stdev of daily returns, annualized
 *
 * The confidence it emits is a stated function of those numbers, documented in
 * _confidence() — not a magic constant. Direction is long in an uptrend with
 * positive momentum, short in a downtrend with negative momentum, and neutral
 * when those disagree.
 *
 * SAFETY: read-only GETs. Producing a signal never places an order.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', '..', '..', 'runtime', 'market_signals.json');
const PROVIDER = 'market_data';
const LOOKBACK = 60;                 // sessions of history to request
const MOMENTUM_WINDOW = 20;

const DEFAULT_UNIVERSE = [
  'AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA',
  'JPM','XOM','UNH','JNJ','V','WMT','SPY','QQQ'
];

function universe() {
  const raw = (process.env.SIGNAL_UNIVERSE || '').trim();
  if (!raw) return DEFAULT_UNIVERSE;
  const list = raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  return list.length ? list : DEFAULT_UNIVERSE;
}

function _keys() {
  const key = (process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '').trim();
  const sec = (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '').trim();
  return key && sec ? { key, sec } : null;
}

function _dataUrl() {
  return (process.env.ALPACA_DATA_URL || process.env.ALPACA_DATA_BASE_URL
          || 'https://data.alpaca.markets').replace(/\/+$/, '');
}

// ── Maths, kept explicit so the numbers can be checked by hand ───────────────
function _sma(closes, n) {
  if (closes.length < n) return null;
  const slice = closes.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

function _annualizedVol(closes) {
  if (closes.length < 3) return null;
  const rets = [];
  for (let i = 1; i < closes.length; i++) rets.push(closes[i] / closes[i - 1] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}

/**
 * Confidence from the strength of the evidence, not a constant.
 *  - momentum magnitude, saturating at 20% over the window
 *  - trend agreement (sma20 vs sma50) as a separate factor
 *  - high volatility reduces confidence
 * Result is clamped to 0.05..0.95 — never 0 and never certainty.
 */
function _confidence(ret20, sma20, sma50, vol) {
  const mom = Math.min(Math.abs(ret20) / 0.20, 1);
  const trendAgrees = sma20 != null && sma50 != null
    ? ((ret20 >= 0) === (sma20 >= sma50) ? 1 : 0.35)
    : 0.5;
  const volPenalty = vol == null ? 1 : Math.max(0.4, 1 - Math.max(0, vol - 0.30));
  return +Math.min(0.95, Math.max(0.05, (0.55 * mom + 0.45 * trendAgrees) * volPenalty)).toFixed(4);
}

function _direction(ret20, sma20, sma50) {
  const up = sma20 != null && sma50 != null ? sma20 > sma50 : ret20 > 0;
  if (ret20 > 0.01 && up) return 'long';
  if (ret20 < -0.01 && !up) return 'short';
  return 'neutral';
}

async function _fetchBars(symbols) {
  const k = _keys();
  if (!k) return { ok: false, error: 'KEYS_REQUIRED', env_keys: ['ALPACA_API_KEY', 'ALPACA_SECRET_KEY'] };

  const url = `${_dataUrl()}/v2/stocks/bars?symbols=${encodeURIComponent(symbols.join(','))}`
    + `&timeframe=1Day&limit=${LOOKBACK}&adjustment=all&feed=iex`;
  try {
    const res = await fetch(url, { method: 'GET', headers: {
      'APCA-API-KEY-ID': k.key, 'APCA-API-SECRET-KEY': k.sec, accept: 'application/json'
    }});
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: 'http_' + res.status, detail: body.slice(0, 200) };
    }
    const j = await res.json();
    return { ok: true, bars: (j && j.bars) || {} };
  } catch (e) {
    return { ok: false, error: e.message, network: true };
  }
}

/**
 * Build signals from live bars. Returns { ok, signals[], errors[] }.
 * Symbols whose bars are missing or too short are reported, not guessed at.
 */
async function build() {
  const syms = universe();
  const r = await _fetchBars(syms);
  if (!r.ok) return { ok: false, ...r, signals: [] };

  const signals = [];
  const skipped = [];

  for (const sym of syms) {
    const bars = r.bars[sym];
    if (!Array.isArray(bars) || bars.length < MOMENTUM_WINDOW + 1) {
      skipped.push({ symbol: sym, reason: bars ? `only_${bars.length}_bars` : 'no_bars' });
      continue;
    }
    const closes = bars.map(b => Number(b.c)).filter(c => c > 0);
    if (closes.length < MOMENTUM_WINDOW + 1) { skipped.push({ symbol: sym, reason: 'bad_closes' }); continue; }

    const last = closes[closes.length - 1];
    const past = closes[closes.length - 1 - MOMENTUM_WINDOW];
    const ret20 = last / past - 1;
    const sma20 = _sma(closes, 20);
    const sma50 = _sma(closes, 50);
    const vol = _annualizedVol(closes);
    const direction = _direction(ret20, sma20, sma50);

    signals.push({
      // kind + id are required by data_layer/schemas; without them the hub
      // silently drops the record and the signal never reaches scoring.
      kind: 'signal',
      id: `${PROVIDER}_${sym}`,
      provider: PROVIDER,
      symbol: sym,
      direction,
      confidence: _confidence(ret20, sma20, sma50, vol),
      price: +last.toFixed(4),                       // REAL last close
      metrics: {
        ret_20d: +(ret20 * 100).toFixed(2),
        sma20: sma20 != null ? +sma20.toFixed(2) : null,
        sma50: sma50 != null ? +sma50.toFixed(2) : null,
        annualized_vol_pct: vol != null ? +(vol * 100).toFixed(1) : null,
        bars_used: closes.length
      },
      rationale: `${MOMENTUM_WINDOW}-session return ${(ret20 * 100).toFixed(2)}%, `
        + `SMA20 ${sma20 != null ? sma20.toFixed(2) : 'n/a'} vs SMA50 ${sma50 != null ? sma50.toFixed(2) : 'n/a'}`,
      as_of: bars[bars.length - 1].t || null,
      computed_at: new Date().toISOString(),
      paper: true,
      executed: false
    });
  }

  return { ok: true, signals, skipped, universe_size: syms.length };
}

// ── Persistence, so signals survive a restart and feed the hub ───────────────
function _read() {
  try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); return Array.isArray(j) ? j : []; }
  catch { return []; }
}

function _write(list) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
    return true;
  } catch { return false; }
}

/** Build and persist. Replaces the previous set — these are point-in-time. */
async function refresh() {
  const r = await build();
  if (!r.ok) return r;
  _write(r.signals);
  return { ok: true, count: r.signals.length, skipped: r.skipped,
    note: `${r.signals.length} signals computed from real Alpaca daily bars. No fixtures involved.` };
}

/** Signals for the data hub. Synchronous — reads what refresh() persisted. */
function getSignals() { return _read(); }

function status() {
  const list = _read();
  const dirs = list.reduce((m, s) => { m[s.direction] = (m[s.direction] || 0) + 1; return m; }, {});
  return {
    provider: PROVIDER,
    count: list.length,
    universe: universe(),
    universe_size: universe().length,
    directions: dirs,
    keys_present: !!_keys(),
    newest: list.length ? list.reduce((a, s) => s.computed_at > a ? s.computed_at : a, '') : null,
    note: list.length
      ? 'Real signals from Alpaca daily bars.'
      : 'No market signals yet. Refresh to compute them from live bars (needs Alpaca keys).'
  };
}

function clear() { _write([]); return { ok: true, cleared: true }; }

module.exports = { build, refresh, getSignals, status, clear, universe, PROVIDER, FILE };
