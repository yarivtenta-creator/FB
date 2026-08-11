'use strict';
/**
 * data_layer/prices — real last-traded prices. READ-ONLY.
 *
 * WHY THIS EXISTS
 * The strategy engine used to book every position at a hardcoded $100 when a
 * signal carried no price. Mock signals carry no price, so EVERY position was
 * booked at $100 — MSFT included, while it trades near $428. Share counts and
 * notionals were wrong, and marking those $100 entries against real prices
 * would have reported tens of thousands of dollars of profit that never
 * existed.
 *
 * This module is the honest replacement. It returns a real price or nothing.
 * There is no fallback constant anywhere in this file, by design.
 *
 * SOURCES (in order)
 *   1. Alpaca  GET /v2/stocks/{sym}/trades/latest    (needs ALPACA keys)
 *   2. Twelve Data GET /price?symbol=…               (needs TWELVE_DATA_API_KEY)
 * Whichever answers first with a positive number wins. The source is recorded
 * on every quote so the dashboard can show where a number came from.
 *
 * CACHING
 * Quotes are cached briefly (PRICE_TTL_MS, default 60s) so one tick pricing 12
 * strategies against the same symbols costs one request per symbol, not 31.
 */

const TTL_MS = Number(process.env.PRICE_TTL_MS || 60000);
const TIMEOUT_MS = Number(process.env.PRICE_TIMEOUT_MS || 10000);

// symbol -> { price, source, ts, error }
const _cache = new Map();
const _inflight = new Map();

function _alpacaKeys() {
  const key = (process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '').trim();
  const sec = (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '').trim();
  return key && sec ? { key, sec } : null;
}

function _dataUrl() {
  return (process.env.ALPACA_DATA_URL || process.env.ALPACA_DATA_BASE_URL
          || 'https://data.alpaca.markets').replace(/\/+$/, '');
}

async function _get(url, headers) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'GET', headers: { accept: 'application/json', ...headers }, signal: ctrl.signal });
    if (!res.ok) return { ok: false, error: 'http_' + res.status };
    return { ok: true, json: await res.json() };
  } catch (e) {
    return { ok: false, error: e.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : e.message };
  } finally { clearTimeout(timer); }
}

async function _fromAlpaca(symbol) {
  const k = _alpacaKeys();
  if (!k) return { ok: false, error: 'no_alpaca_keys' };
  const r = await _get(`${_dataUrl()}/v2/stocks/${encodeURIComponent(symbol)}/trades/latest`,
    { 'APCA-API-KEY-ID': k.key, 'APCA-API-SECRET-KEY': k.sec });
  if (!r.ok) return r;
  const p = Number(r.json && r.json.trade && r.json.trade.p);
  if (!(p > 0)) return { ok: false, error: 'no_price_in_response' };
  return { ok: true, price: p, source: 'alpaca' };
}

async function _fromTwelveData(symbol) {
  const key = (process.env.TWELVE_DATA_API_KEY || process.env.TWELVEDATA_API_KEY || '').trim();
  if (!key) return { ok: false, error: 'no_twelve_data_key' };
  const r = await _get(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`);
  if (!r.ok) return r;
  const p = Number(r.json && r.json.price);
  if (!(p > 0)) return { ok: false, error: (r.json && r.json.message) || 'no_price_in_response' };
  return { ok: true, price: p, source: 'twelve_data' };
}

async function _fetchOne(symbol) {
  const a = await _fromAlpaca(symbol);
  if (a.ok) return a;
  const t = await _fromTwelveData(symbol);
  if (t.ok) return t;
  // Report BOTH failures — "no price" without a reason is not actionable.
  return { ok: false, error: `alpaca: ${a.error}; twelve_data: ${t.error}` };
}

function _fresh(entry) {
  return entry && entry.price > 0 && (Date.now() - entry.ts) < TTL_MS;
}

/** Cached price, or null. Never returns a placeholder. Synchronous. */
function get(symbol) {
  const e = _cache.get(String(symbol).toUpperCase());
  return _fresh(e) ? e.price : null;
}

/** Full cache entry including source and last error. Synchronous. */
function quote(symbol) {
  const sym = String(symbol).toUpperCase();
  const e = _cache.get(sym);
  if (!e) return { symbol: sym, price: null, source: null, error: 'not_fetched' };
  return { symbol: sym, price: _fresh(e) ? e.price : null, source: e.source,
           stale: !!e.price && !_fresh(e), age_ms: Date.now() - e.ts, error: e.error || null };
}

/**
 * Fetch prices for many symbols, in parallel, deduped.
 * Concurrent callers asking for the same symbol share one request.
 */
async function warm(symbols) {
  const list = [...new Set((symbols || []).map(s => String(s).toUpperCase()).filter(Boolean))];
  await Promise.all(list.map(async sym => {
    if (_fresh(_cache.get(sym))) return;
    if (_inflight.has(sym)) return _inflight.get(sym);
    const p = _fetchOne(sym).then(r => {
      _cache.set(sym, r.ok
        ? { price: r.price, source: r.source, ts: Date.now(), error: null }
        : { price: null, source: null, ts: Date.now(), error: r.error });
      _inflight.delete(sym);
    });
    _inflight.set(sym, p);
    return p;
  }));
  return status(list);
}

function status(symbols) {
  const list = symbols && symbols.length
    ? symbols.map(s => String(s).toUpperCase())
    : [..._cache.keys()];
  const quotes = list.map(quote);
  const priced = quotes.filter(q => q.price > 0);
  return {
    ttl_ms: TTL_MS,
    requested: list.length,
    priced: priced.length,
    unpriced: list.length - priced.length,
    sources_available: {
      alpaca: !!_alpacaKeys(),
      twelve_data: !!(process.env.TWELVE_DATA_API_KEY || process.env.TWELVEDATA_API_KEY)
    },
    quotes,
    note: priced.length === list.length
      ? 'All requested symbols priced from a live source.'
      : `${list.length - priced.length} symbol(s) could not be priced. Positions in those names are NOT opened — the engine never invents a price.`
  };
}

function clear() { _cache.clear(); return { ok: true, cleared: true }; }

module.exports = { get, quote, warm, status, clear, TTL_MS };
