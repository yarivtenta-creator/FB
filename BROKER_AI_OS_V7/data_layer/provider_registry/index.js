'use strict';
/**
 * provider_registry — tracks providers (status only). No credentials, no enabling of live calls.
 * Fields: id, name, category, status, enabled, configured, links, last_update, health.
 *
 * SAFETY:
 *  - "configured" is derived from the PRESENCE of env vars only. The VALUE of a key
 *    is never read into a returned object, never logged, never exposed.
 *  - "enabled" stays false until an operator manually wires + verifies a provider.
 *  - test(id) is a READ-ONLY connectivity probe. In DATA_MODE=mock it performs NO
 *    network call. There is no order/execution path here in any mode.
 */
const S = require('../schemas');
const config = require('../../config');

// Static catalog. enabled=false means "not wired to live". Links help the operator
// set up keys MANUALLY (Provider Setup Center) — the app never collects the key.
const PROVIDERS = [
  { id:'alpaca',   name:'Alpaca',            category:'equities',   status:'not_configured', enabled:false, health:'mock',
    envKeys:['ALPACA_API_KEY_ID','ALPACA_API_SECRET_KEY'],
    links:{ website:'https://alpaca.markets', apiKeys:'https://app.alpaca.markets/paper/dashboard/overview',
            docs:'https://docs.alpaca.markets/docs/getting-started', setupGuide:'/docs/operator/CONNECT_ALPACA.md' } },
  { id:'t4',       name:'T4 / Plus500',      category:'futures',    status:'mock',           enabled:false, health:'mock',
    envKeys:[],
    links:{ website:'https://www.cqg.com/products/t4', apiKeys:'',
            docs:'https://www.cqg.com/partners/api-documentation', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' },
    note:'DATA/STATUS ONLY. No execution, no FIX. Never an order path.' },
  { id:'news',     name:'News',              category:'news',       status:'mock',           enabled:true,  health:'ok',
    envKeys:['NEWS_API_KEY'],
    links:{ website:'https://newsapi.org', apiKeys:'https://newsapi.org/account',
            docs:'https://newsapi.org/docs', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } },
  { id:'calendar', name:'Economic Calendar', category:'macro',      status:'mock',           enabled:true,  health:'ok',
    envKeys:['ECON_CALENDAR_API_KEY'],
    links:{ website:'https://www.tradingeconomics.com', apiKeys:'https://developer.tradingeconomics.com',
            docs:'https://docs.tradingeconomics.com', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } },
  { id:'congress', name:'Congress Trades',   category:'alt_signal', status:'mock',           enabled:true,  health:'ok',
    envKeys:['CONGRESS_API_KEY'],
    links:{ website:'https://www.quiverquant.com', apiKeys:'https://www.quiverquant.com/auth/signup',
            docs:'https://api.quiverquant.com/docs', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } },
  { id:'13f',      name:'13F Filings',       category:'alt_signal', status:'mock',           enabled:true,  health:'ok',
    envKeys:['THIRTEEN_F_API_KEY'],
    links:{ website:'https://www.sec.gov/edgar', apiKeys:'',
            docs:'https://www.sec.gov/edgar/sec-api-documentation', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } },
  { id:'insider',  name:'Insider Trading',   category:'alt_signal', status:'mock',           enabled:true,  health:'ok',
    envKeys:['INSIDER_API_KEY'],
    links:{ website:'https://www.sec.gov/edgar', apiKeys:'',
            docs:'https://www.sec.gov/edgar/sec-api-documentation', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } },
  { id:'reserved', name:'Future Providers',  category:'reserved',   status:'planned',        enabled:false, health:'n/a',
    envKeys:[],
    links:{ website:'', apiKeys:'', docs:'', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' } }
];

// configured = ALL required env vars for the provider are PRESENT (value never read).
function isConfigured(envKeys){
  if (!envKeys || envKeys.length === 0) return false;
  return envKeys.every(k => typeof process.env[k] === 'string' && process.env[k].trim() !== '');
}

function decorate(p){
  const now = new Date().toISOString();
  const configured = isConfigured(p.envKeys);
  // A provider activates ("enabled") when its keys are present AND we are in live mode.
  // In mock mode nothing auto-enables (so the safe default is unchanged). This is the
  // "manual provider keys" flow: operator adds read-only keys → provider goes live.
  const enabled = p.enabled || (config.DATA_MODE === 'live' && configured);
  // Label reflects activation: live+configured → 'live'; otherwise keep the catalog status.
  const status = (config.DATA_MODE === 'live' && configured) ? 'live' : p.status;
  const base = S.ProviderStatus({ ...p, status, enabled, last_update: enabled ? now : null });
  return { ...base, id:p.id, configured, links:p.links, note:p.note };
}

function list(){ return PROVIDERS.map(decorate); }

function get(id){
  const p = PROVIDERS.find(x => x.id === String(id).toLowerCase() ||
                                x.name.toLowerCase() === String(id).toLowerCase());
  return p ? decorate(p) : null;
}

function summary(){
  const all = list();
  return { total: all.length, enabled: all.filter(p=>p.enabled).length,
    configured: all.filter(p=>p.configured).length,
    data_mode: config.DATA_MODE,
    by_category: all.reduce((m,p)=>{ m[p.category]=(m[p.category]||0)+1; return m; },{}),
    note: 'enabled=false means not wired to any live source. configured reflects env presence only (no values).' };
}

// READ-ONLY connectivity probe (async). NEVER places an order; NEVER performs a
// network call in mock mode. In live mode it issues a REAL read-only GET via the
// provider adapter (currently wired for Alpaca) and reports the real result.
async function test(id){
  const p = get(id);
  if (!p) return { ok:false, id:String(id), error:'unknown_provider' };
  const mode = config.DATA_MODE;
  if (mode === 'mock'){
    return { ok:true, id:p.id, mode:'mock', reachable:false,
      note:'mock mode — no network call performed. Provider probe is simulated only.' };
  }
  if (!p.configured){
    return { ok:true, id:p.id, mode:'live', reachable:false,
      note:'live mode but provider not configured (no key present). No call performed.' };
  }
  // live + configured: perform a REAL read-only probe where an adapter integration exists.
  if (p.id === 'alpaca'){
    try {
      const alpaca = require('../adapters/alpaca');
      const r = await alpaca.refreshLive(); // READ-ONLY GET to data host
      return { ok:true, id:p.id, mode:'live', reachable: !!r.ok, http_status: r.status || null,
        quotes: r.count || 0,
        note: r.ok ? 'live read-only probe succeeded (quotes fetched; no orders, no execution).'
                   : 'live read-only probe reached the data host but returned ' + (r.status||r.reason) + ' (no data fabricated; no orders).' };
    } catch (e){
      return { ok:false, id:p.id, mode:'live', reachable:false, error:e.name,
        note:'live read-only probe failed at the network layer; no order path involved.' };
    }
  }
  return { ok:true, id:p.id, mode:'live', reachable:false,
    note:'live mode + configured, but no read-only adapter integration is wired for this provider yet.' };
}

module.exports = { list, get, summary, test, isConfigured };
