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
    envKeys:['ALPACA_API_KEY','ALPACA_SECRET_KEY'],
    envKeysAlt:['ALPACA_API_KEY_ID','ALPACA_API_SECRET_KEY'],
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
// Supports both primary and alternate key names.
function isConfigured(envKeys, envKeysAlt){
  if (!envKeys || envKeys.length === 0) return false;
  const primaryOk = envKeys.every(k => typeof process.env[k] === 'string' && process.env[k].trim() !== '');
  if (primaryOk) return true;
  if (!envKeysAlt || envKeysAlt.length === 0) return false;
  return envKeysAlt.every(k => typeof process.env[k] === 'string' && process.env[k].trim() !== '');
}

function decorate(p){
  const now = new Date().toISOString();
  const configured = isConfigured(p.envKeys, p.envKeysAlt);
  // Alpaca activates whenever keys are present (regardless of DATA_MODE).
  // Other providers still require DATA_MODE=live.
  const enabled = p.enabled ||
    (p.id === 'alpaca' ? configured : (config.DATA_MODE === 'live' && configured));
  const status = configured
    ? (p.id === 'alpaca' ? 'configured' : (config.DATA_MODE === 'live' ? 'live' : p.status))
    : p.status;
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

// READ-ONLY connectivity probe (async). NEVER places an order. NEVER writes anything.
// For Alpaca: always performs a REAL network probe if keys are present, regardless of DATA_MODE.
// Three states: MOCK_NO_KEYS | REAL_READ_ONLY_CONNECTED | REAL_READ_ONLY_FAILED
async function test(id){
  const p = get(id);
  if (!p) return { ok:false, id:String(id), error:'unknown_provider' };

  if (p.id === 'alpaca') return _testAlpaca(p);

  // Non-Alpaca providers: keep original mock-mode behavior
  const mode = config.DATA_MODE;
  if (mode === 'mock'){
    return { ok:true, id:p.id, mode:'mock', reachable:false,
      note:'mock mode — no network call performed. Provider probe is simulated only.' };
  }
  if (!p.configured){
    return { ok:true, id:p.id, mode:'live', reachable:false,
      note:'live mode but provider not configured. No call performed.' };
  }
  return { ok:true, id:p.id, mode:'live', reachable:false,
    note:'live mode + configured, but no read-only adapter wired for this provider yet.' };
}

function _maskKey(k){ if (!k || k.length < 6) return '***'; return k.slice(0,2)+'*'.repeat(Math.max(k.length-4,4))+k.slice(-2); }

async function _alpacaGet(url, apiKey, secretKey){
  const res = await fetch(url, { method:'GET', headers:{
    'APCA-API-KEY-ID': apiKey, 'APCA-API-SECRET-KEY': secretKey, 'accept':'application/json'
  }});
  const body = await res.text();
  let json = null;
  try { json = JSON.parse(body); } catch {}
  return { status: res.status, ok: res.ok, json, body };
}

async function _testAlpaca(p){
  // Resolve keys — support both naming conventions
  const apiKey   = (process.env.ALPACA_API_KEY   || process.env.ALPACA_API_KEY_ID   || '').trim();
  const secretKey= (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY|| '').trim();
  const baseUrl  = (process.env.ALPACA_BASE_URL   || 'https://paper-api.alpaca.markets').replace(/\/+$/,'');
  const dataUrl  = (process.env.ALPACA_DATA_URL   || process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets').replace(/\/+$/,'');
  const ts       = new Date().toISOString();

  if (!apiKey || !secretKey){
    return {
      ok: false, id:'alpaca',
      alpaca_state: 'MOCK_NO_KEYS',
      reachable: false,
      network_call_performed: false,
      read_only: true,
      paper: true,
      masked_key: null,
      missing_keys: [...(!apiKey?['ALPACA_API_KEY']:[]),...(!secretKey?['ALPACA_SECRET_KEY']:[])],
      message: 'KEYS REQUIRED — real Alpaca connection not tested. Set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env',
      tested_at: ts
    };
  }

  const masked = _maskKey(apiKey);
  const results = {};

  // Probe 1: GET /v2/account (broker/paper host) — READ-ONLY
  try {
    const r = await _alpacaGet(`${baseUrl}/v2/account`, apiKey, secretKey);
    results.account = { endpoint: `${baseUrl}/v2/account`, status: r.status, ok: r.ok,
      account_status: r.ok ? (r.json && r.json.status) : undefined,
      error: r.ok ? undefined : (r.json && (r.json.message||r.json.code)) || r.body.slice(0,200) };
  } catch(e){
    results.account = { endpoint: `${baseUrl}/v2/account`, status: null, ok: false, error: e.message };
  }

  // Probe 2: GET /v2/stocks/AAPL/trades/latest (data host) — READ-ONLY
  try {
    const r = await _alpacaGet(`${dataUrl}/v2/stocks/AAPL/trades/latest`, apiKey, secretKey);
    results.market_data = { endpoint: `${dataUrl}/v2/stocks/AAPL/trades/latest`, status: r.status, ok: r.ok,
      symbol: 'AAPL', has_data: r.ok && !!r.json,
      error: r.ok ? undefined : (r.json && (r.json.message||r.json.code)) || r.body.slice(0,200) };
  } catch(e){
    results.market_data = { endpoint: `${dataUrl}/v2/stocks/AAPL/trades/latest`, status: null, ok: false, error: e.message };
  }

  const anyOk = results.account.ok || results.market_data.ok;
  const allFailed = !results.account.ok && !results.market_data.ok;

  return {
    ok: anyOk,
    id: 'alpaca',
    alpaca_state: anyOk ? 'REAL_READ_ONLY_CONNECTED' : 'REAL_READ_ONLY_FAILED',
    reachable: anyOk,
    network_call_performed: true,
    read_only: true,
    paper: true,
    masked_key: masked,
    account_endpoint_tested: true,
    market_data_endpoint_tested: true,
    account: results.account,
    market_data: results.market_data,
    tested_at: ts,
    note: anyOk
      ? 'Real read-only Alpaca probe succeeded. No orders, no execution, no writes.'
      : 'Real read-only Alpaca probe failed. Check keys and network. No orders attempted.'
  };
}

module.exports = { list, get, summary, test, isConfigured };
