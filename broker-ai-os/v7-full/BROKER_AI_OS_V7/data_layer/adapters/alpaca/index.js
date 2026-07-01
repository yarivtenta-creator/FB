'use strict';
/**
 * adapters/alpaca — READ-ONLY market-data adapter (REAL integration).
 *
 * ALLOWED (read-only): latest quotes from Alpaca's MARKET-DATA host, bars (mock),
 *   account STATUS (presence-only, no call), positions (paper).
 * FORBIDDEN (must never exist here): placeOrder, submitOrder, cancelOrder,
 *   closePosition, replaceOrder, transfer, execute — there is NO trading surface,
 *   and this adapter NEVER contacts the Alpaca trading host. It only ever issues
 *   HTTP GET to the market-data host (data.alpaca.markets).
 *
 * DATA_MODE:
 *   - "mock"  (default): returns static fixtures. NO network call. NO key read.
 *   - "live": performs a REAL read-only HTTP GET to the Alpaca data API, but ONLY if
 *     both ALPACA keys are present. Results are cached so the synchronous data-hub
 *     interface is preserved (a background refresh warms the cache; getQuotes() never
 *     blocks). If the call is unauthorized/unreachable, it falls back to fixtures and
 *     records the error — it never fabricates "live" data and never places an order.
 *   - Key VALUES are sent only in request headers to data.alpaca.markets; they are
 *     never logged, never returned, never stored beyond the in-memory header build.
 */
const S = require('../../schemas');
const config = require('../../../config');

const PROVIDER = 'alpaca';
const SYMBOLS = ['AAPL','MSFT','NVDA','TSLA','META','AMZN'];
const ENV_KEYS = ['ALPACA_API_KEY_ID','ALPACA_API_SECRET_KEY'];
const DATA_BASE = (process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets').replace(/\/+$/,'');
const DATA_FEED = (process.env.ALPACA_DATA_FEED || 'iex').trim();   // read-only feed; iex = free tier
const CACHE_TTL_MS = 5000;

// Presence-only check. Never reads the value into anything returned/logged.
function _configured(){
  return ENV_KEYS.every(k => typeof process.env[k] === 'string' && process.env[k].trim() !== '');
}
function _mode(){ return config.DATA_MODE === 'live' && _configured() ? 'live' : 'mock'; }

// READ-ONLY request headers. Built only at call time; never logged or returned.
function _headers(){
  return {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID,
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY,
    'accept': 'application/json'
  };
}

function _fixtures(){
  return SYMBOLS.map((sym,i)=> S.Quote({ provider:PROVIDER, symbol:sym, price:(100+i*37.5).toFixed(2) }));
}

// Parse Alpaca's documented "latest quotes" response into our normalized Quote schema.
// Shape: { quotes: { AAPL: { ap:<ask>, bp:<bid>, t:<ts>, ... }, ... } }
// Uses the bid/ask midpoint (falls back to ask, then bid). Read-only transformation.
function parseLatestQuotes(json){
  const out = [];
  const q = json && json.quotes ? json.quotes : {};
  for (const sym of Object.keys(q)){
    const r = q[sym] || {};
    const ask = Number(r.ap), bid = Number(r.bp);
    let price = null;
    if (ask > 0 && bid > 0) price = (ask + bid) / 2;
    else if (ask > 0) price = ask;
    else if (bid > 0) price = bid;
    if (price === null) continue;
    out.push({ ...S.Quote({ provider:PROVIDER, symbol:sym, price:Number(price.toFixed(2)), ts:r.t }), live:true });
  }
  return out;
}

// In-memory live cache (keeps the sync data-hub interface intact).
const _cache = { quotes:[], ts:0, lastError:null, lastStatus:null };
let _inflight = null; // coalesces concurrent refreshes onto one real request.

// REAL read-only fetch. GET only, data host only. Returns a result summary (no secrets).
// Concurrent callers share the same in-flight promise (so a probe never misses with
// a "refresh_in_flight" stub — it awaits the real HTTP result).
function refreshLive(){
  if (_mode() !== 'live') return Promise.resolve({ ok:false, mode:_mode(), reason:'not_live_or_not_configured' });
  if (_inflight) return _inflight;
  const url = `${DATA_BASE}/v2/stocks/quotes/latest?symbols=${encodeURIComponent(SYMBOLS.join(','))}&feed=${encodeURIComponent(DATA_FEED)}`;
  _inflight = (async () => {
    try {
      const res = await fetch(url, { method:'GET', headers:_headers() }); // READ-ONLY GET
      _cache.lastStatus = res.status;
      if (!res.ok){
        _cache.lastError = `http_${res.status}`;
        return { ok:false, status:res.status, reason:'unauthorized_or_unreachable', note:'fell back to fixtures; no data fabricated' };
      }
      const json = await res.json();
      const parsed = parseLatestQuotes(json);
      _cache.quotes = parsed; _cache.ts = Date.now(); _cache.lastError = null;
      return { ok:true, status:res.status, count:parsed.length };
    } catch (e){
      _cache.lastError = e.name + ':' + e.message; _cache.lastStatus = null;
      return { ok:false, reason:'fetch_error', error:e.name };
    } finally {
      _inflight = null;
    }
  })();
  return _inflight;
}

function status() {
  return S.ProviderStatus({ name:'Alpaca', category:'equities',
    status: _configured() ? 'configured' : 'not_configured',
    enabled:false, last_update:null, health:'mock' });
}

// READ-ONLY quotes. mock → fixtures. live → cached real quotes (background-refreshed);
// fixtures until the first successful fetch, so the interface never blocks or fabricates.
function getQuotes() {
  if (_mode() !== 'live') return _fixtures();
  const fresh = _cache.quotes.length && (Date.now() - _cache.ts) < CACHE_TTL_MS;
  if (!fresh && !_inflight) { refreshLive().catch(()=>{}); } // fire-and-forget warm-up
  return _cache.quotes.length ? _cache.quotes : _fixtures();
}

// READ-ONLY OHLC bars (mock; not part of the required live path).
function getBars(symbol='AAPL') {
  return Array.from({length:5},(_,i)=> S.Quote({ provider:PROVIDER, symbol, price:(150+i).toFixed(2) }));
}

// Account STATUS only — presence-only, NO call (never touches the trading host).
function accountStatus() {
  return { provider:PROVIDER, account:'paper-A',
    status: _configured() ? 'configured' : 'not_configured',
    data_mode: _mode(),
    live_status: _cache.lastStatus, live_error: _cache.lastError,
    note:'data-only; read-only; presence-only account status (no trading-host call); no keys, no balances',
    mock:true };
}

// PAPER positions placeholder only (paper_trading creates real paper positions).
function positions() { return []; }

module.exports = {
  PROVIDER, ENV_KEYS, DATA_BASE,
  status, getQuotes, getBars, accountStatus, positions,
  refreshLive, parseLatestQuotes
};
