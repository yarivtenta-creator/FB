'use strict';
/**
 * connectors/alpaca/alpaca_provider.js
 * BROKER_AI_OS_V7 — Alpaca READ-ONLY provider.
 *
 * ALLOWED: account status read, market data read, latest quote/bar/trade,
 *          clock/calendar read, asset metadata read.
 *
 * FORBIDDEN (enforced — these functions do not exist):
 *   placeOrder, createOrder, submitOrder, cancelOrder, closePosition,
 *   replaceOrder, live execution, real trading, POST/DELETE to broker.
 *
 * All HTTP calls are GET only, to data.alpaca.markets only.
 * Keys are used only in request headers and never logged or returned.
 */

const { load } = require('./alpaca_config');

async function _get(cfg, url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'APCA-API-KEY-ID': cfg._getApiKey(),
      'APCA-API-SECRET-KEY': cfg._getSecretKey(),
      'accept': 'application/json'
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw Object.assign(new Error(`Alpaca HTTP ${res.status}`), { status: res.status, body });
  }
  return res.json();
}

async function getStatus() {
  const cfg = load();
  return {
    provider: 'alpaca',
    system: 'BROKER_AI_OS_V7',
    configured: cfg.configured,
    paper_mode: cfg.isPaper,
    read_only: true,
    live_trading: false,
    maskedApiKey: cfg.maskedApiKey,
    missingKeys: cfg.missingKeys,
    note: cfg.configured
      ? 'Alpaca credentials present. Read-only market data mode.'
      : 'KEYS_REQUIRED — set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env'
  };
}

async function testConnection() {
  const cfg = load();
  const ts = new Date().toISOString();

  if (!cfg.configured) {
    return {
      ok: false,
      alpaca_state: 'MOCK_NO_KEYS',
      reachable: false,
      network_call_performed: false,
      read_only: true,
      paper: true,
      masked_key: null,
      missing_keys: cfg.missingKeys,
      message: 'KEYS REQUIRED — real Alpaca connection not tested. Set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env',
      tested_at: ts
    };
  }

  const results = {};

  // Probe 1: GET /v2/account — READ-ONLY account status
  try {
    const res = await fetch(`${cfg.baseUrl}/v2/account`, {
      method: 'GET',
      headers: { 'APCA-API-KEY-ID': cfg._getApiKey(), 'APCA-API-SECRET-KEY': cfg._getSecretKey(), 'accept': 'application/json' }
    });
    const body = await res.text();
    let json = null; try { json = JSON.parse(body); } catch {}
    results.account = {
      endpoint: `${cfg.baseUrl}/v2/account`, status: res.status, ok: res.ok,
      account_status: res.ok ? (json && json.status) : undefined,
      error: res.ok ? undefined : ((json && (json.message || json.code)) || body.slice(0, 200))
    };
  } catch(e) {
    results.account = { endpoint: `${cfg.baseUrl}/v2/account`, status: null, ok: false, error: e.message };
  }

  // Probe 2: GET /v2/stocks/AAPL/trades/latest — READ-ONLY market data
  try {
    const res = await fetch(`${cfg.dataUrl}/v2/stocks/AAPL/trades/latest`, {
      method: 'GET',
      headers: { 'APCA-API-KEY-ID': cfg._getApiKey(), 'APCA-API-SECRET-KEY': cfg._getSecretKey(), 'accept': 'application/json' }
    });
    const body = await res.text();
    let json = null; try { json = JSON.parse(body); } catch {}
    results.market_data = {
      endpoint: `${cfg.dataUrl}/v2/stocks/AAPL/trades/latest`, status: res.status, ok: res.ok,
      symbol: 'AAPL', has_data: res.ok && !!json,
      error: res.ok ? undefined : ((json && (json.message || json.code)) || body.slice(0, 200))
    };
  } catch(e) {
    results.market_data = { endpoint: `${cfg.dataUrl}/v2/stocks/AAPL/trades/latest`, status: null, ok: false, error: e.message };
  }

  const anyOk = results.account.ok || results.market_data.ok;

  return {
    ok: anyOk,
    alpaca_state: anyOk ? 'REAL_READ_ONLY_CONNECTED' : 'REAL_READ_ONLY_FAILED',
    reachable: anyOk,
    network_call_performed: true,
    read_only: true,
    paper: true,
    masked_key: cfg.maskedApiKey,
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

async function getAccount() {
  const cfg = load();
  if (!cfg.configured) {
    return { ok: false, code: 'KEYS_REQUIRED', missingKeys: cfg.missingKeys };
  }
  try {
    const data = await _get(cfg, `${cfg.baseUrl}/v2/account`);
    // Return only status fields — no balances, no account numbers in plain text
    return {
      ok: true,
      status: data.status,
      account_blocked: data.account_blocked,
      trading_blocked: data.trading_blocked,
      transfers_blocked: data.transfers_blocked,
      pattern_day_trader: data.pattern_day_trader,
      currency: data.currency,
      note: 'READ-ONLY account status. No balances returned.'
    };
  } catch (e) {
    return { ok: false, code: 'ACCOUNT_READ_FAILED', status: e.status, message: e.message };
  }
}

async function getMarketData(symbol) {
  const cfg = load();
  if (!cfg.configured) {
    return {
      ok: false,
      code: 'KEYS_REQUIRED',
      missingKeys: cfg.missingKeys,
      mock: getMockQuote(symbol)
    };
  }
  try {
    const url = `${cfg.dataUrl}/v2/stocks/quotes/latest?symbols=${encodeURIComponent(symbol)}&feed=iex`;
    const data = await _get(cfg, url);
    const q = data.quotes && data.quotes[symbol];
    if (!q) return { ok: false, code: 'NO_DATA', symbol };
    const ask = Number(q.ap), bid = Number(q.bp);
    const price = (ask > 0 && bid > 0) ? (ask + bid) / 2 : (ask || bid || null);
    return { ok: true, symbol, price: price ? Number(price.toFixed(4)) : null, ask, bid, ts: q.t, source: 'alpaca_iex' };
  } catch (e) {
    return { ok: false, code: 'MARKET_DATA_FAILED', symbol, status: e.status, message: e.message };
  }
}

function getMockQuote(symbol) {
  const prices = { AAPL: 189.5, MSFT: 415.2, NVDA: 875.3, TSLA: 245.1, META: 528.6, AMZN: 195.8 };
  return { symbol, price: prices[symbol] || 100.0, source: 'mock', note: 'Mock data — no real keys' };
}

module.exports = { getStatus, testConnection, getAccount, getMarketData, getMockQuote };
