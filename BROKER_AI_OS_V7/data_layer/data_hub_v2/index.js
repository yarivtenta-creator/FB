'use strict';
/**
 * data_hub_v2 — central aggregation layer. The SINGLE source of truth.
 * Agents must call the hub, never providers directly. No live calls; mock only.
 *
 * API: registerProvider, providerStatus, getQuotes, getNews, getCalendar,
 *      getSignals, normalizeData.
 */
const S = require('../schemas');
const registry = require('../provider_registry');
const config = require('../../config');

const alpaca = require('../adapters/alpaca');
const t4 = require('../adapters/t4');
const news = require('../adapters/news');
const calendar = require('../adapters/calendar');
const congress = require('../adapters/congress');
const insider = require('../adapters/insider');
const f13 = require('../adapters/13f');
const research = require('../adapters/research');

// In-memory adapter registry (extensible at runtime).
const adapters = new Map();
function registerProvider(id, adapter){
  if (!id || !adapter) throw new Error('id and adapter required');
  adapters.set(id, adapter);
  return { ok:true, registered:id };
}
// register built-ins
registerProvider('alpaca', alpaca);
registerProvider('t4', t4);
registerProvider('news', news);
registerProvider('calendar', calendar);
registerProvider('congress', congress);
registerProvider('insider', insider);
registerProvider('13f', f13);

function providerStatus(){ return registry.list(); }

// Is a provider eligible to contribute LIVE data? Only when DATA_MODE=live AND its
// registry entry is enabled. In mock mode everything flows as fixtures (no network).
function _enabled(id){ const p = registry.get(id); return !!(p && p.enabled); }
function _dataMode(){ return config.DATA_MODE; }
function _freshness(){ return _dataMode() === 'live' ? 'live (read-only)' : 'mock (static fixtures)'; }

// normalizeData: validate + drop anything that doesn't meet the schema contract.
// Stamps each surviving record with source='data_hub_v2' and data_mode for provenance.
// Records failing validation used to disappear with no trace anywhere — a
// whole adapter's output could vanish and every panel would look normal.
// Rejects are now kept so /api/data/rejects can show what was dropped and why.
const _rejects = [];
const MAX_REJECTS = 100;

function normalizeData(records){
  const out = []; const rejected = [];
  const mode = _dataMode();
  for (const r of (records||[])){
    const v = S.validate(r);
    if (v.ok) { out.push({ ...r, source:'data_hub_v2', data_mode: mode }); }
    else {
      const info = { provider: r && r.provider, symbol: r && r.symbol,
                     kind: r && r.kind, error: v.error, at: new Date().toISOString() };
      rejected.push({ rec:r, error:v.error });
      _rejects.push(info);
      if (_rejects.length > MAX_REJECTS) _rejects.splice(0, _rejects.length - MAX_REJECTS);
    }
  }
  return { records: out, rejected, count: out.length };
}

/** What the hub threw away, and why. */
function rejects(){
  const byProvider = _rejects.reduce((m,r)=>{ const k=r.provider||'unknown'; m[k]=(m[k]||0)+1; return m; },{});
  return { count: _rejects.length, by_provider: byProvider, recent: _rejects.slice(-25).reverse(),
    note: _rejects.length ? 'These records failed schema validation and never reached scoring.'
                          : 'No records have been rejected.' };
}

// Quote sources, gated by enabled-state in live mode (disabled providers contribute
// nothing live). In mock mode all registered adapters supply fixtures.
function getQuotes(){
  const live = _dataMode() === 'live';
  const q = [];
  if (!live || _enabled('alpaca')) q.push(...alpaca.getQuotes());
  if (!live || _enabled('t4'))     q.push(...t4.getQuotes());
  return normalizeData(q).records;
}
function getNews(){ return normalizeData(news.getNews()).records; }
function getCalendar(){ return normalizeData(calendar.getCalendar()).records; }
function getSignals(){
  // Research signals (from /trade and /crypto skills) rank alongside the rest.
  const market = require('../adapters/market_signals');
  const s = [...congress.getSignals(), ...insider.getSignals(), ...f13.getSignals(),
             ...research.getSignals(), ...market.getSignals()];
  return normalizeData(s).records;
}

function health(){
  const providers = providerStatus();
  const quotes = getQuotes();
  const symbols = [...new Set(quotes.map(q=>q.symbol))];
  return {
    data_mode: _dataMode(),
    source: 'data_hub_v2',
    freshness: _freshness(),
    registered_providers: adapters.size,
    active_providers: providers.filter(p=>p.enabled).length,
    configured_providers: providers.filter(p=>p.configured).length,
    symbol_coverage: symbols.length,
    symbols,
    data_freshness: _freshness(), // back-compat alias
    health: 'ok',
    schema_version: S.SCHEMA_VERSION,
    note: 'Data Hub v2 is the single source of truth. Agents must consume via the hub, never providers directly. No live execution exists.'
  };
}

module.exports = {
  rejects,
  registerProvider, providerStatus, getQuotes, getNews, getCalendar, getSignals,
  normalizeData, health
};
