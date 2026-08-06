'use strict';
/**
 * adapters/keyless — READ-ONLY adapters for providers that need NO API key.
 *
 * All calls are HTTP GET to public endpoints. No credentials, no orders,
 * no execution. Each adapter returns normalized data or a structured error —
 * it never fabricates values and never silently falls back to fixtures.
 *
 * SEC requires a descriptive User-Agent with contact info; set SEC_USER_AGENT.
 */

const UA = process.env.SEC_USER_AGENT
  || 'BROKER_AI_OS_V7 research (set SEC_USER_AGENT in .env)';
const TIMEOUT_MS = Number(process.env.KEYLESS_TIMEOUT_MS || 12000);

async function _get(url, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json', 'user-agent': UA, ...headers },
      signal: ctrl.signal
    });
    const ms = Date.now() - started;
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    if (!res.ok) {
      return { ok: false, status: res.status, ms,
        error: (json && (json.message || json.error)) || text.slice(0, 160) };
    }
    return { ok: true, status: res.status, ms, json };
  } catch (e) {
    return { ok: false, status: null, ms: Date.now() - started,
      error: e.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : e.message };
  } finally {
    clearTimeout(timer);
  }
}

// ── SEC EDGAR — filings, 13F, Form 4 insider ────────────────────────────────
const sec = {
  id: 'sec_edgar',
  endpoint: 'https://data.sec.gov',
  async probe() {
    const r = await _get('https://data.sec.gov/submissions/CIK0000320193.json');
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, status: r.status, ms: r.ms,
      sample: { company: r.json && r.json.name, cik: r.json && r.json.cik } };
  },
  // Recent filings for a CIK (zero-padded to 10 digits).
  async filings(cik, formType) {
    const padded = String(cik).replace(/\D/g, '').padStart(10, '0');
    const r = await _get(`https://data.sec.gov/submissions/CIK${padded}.json`);
    if (!r.ok) return { ok: false, ...r };
    const rec = (r.json && r.json.filings && r.json.filings.recent) || {};
    const out = [];
    for (let i = 0; i < (rec.form || []).length && out.length < 40; i++) {
      if (formType && rec.form[i] !== formType) continue;
      out.push({ form: rec.form[i], filed: rec.filingDate[i],
        accession: rec.accessionNumber[i], doc: rec.primaryDocument[i] });
    }
    return { ok: true, company: r.json.name, cik: r.json.cik, count: out.length, filings: out };
  }
};

// ── US Treasury FiscalData — rates, yield curve ─────────────────────────────
const treasury = {
  id: 'treasury',
  endpoint: 'https://api.fiscaldata.treasury.gov',
  async probe() {
    const r = await _get('https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?page[size]=1&sort=-record_date');
    if (!r.ok) return { ok: false, ...r };
    const d = r.json && r.json.data && r.json.data[0];
    return { ok: true, status: r.status, ms: r.ms,
      sample: d ? { date: d.record_date, security: d.security_desc, rate: d.avg_interest_rate_amt } : null };
  },
  async avgRates(limit = 12) {
    const r = await _get(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?page[size]=${limit}&sort=-record_date`);
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, count: (r.json.data || []).length,
      rates: (r.json.data || []).map(d => ({ date: d.record_date,
        security: d.security_desc, rate: Number(d.avg_interest_rate_amt) })) };
  }
};

// ── CoinGecko — crypto prices ───────────────────────────────────────────────
const coingecko = {
  id: 'coingecko',
  endpoint: 'https://api.coingecko.com',
  _headers() {
    const k = (process.env.COINGECKO_API_KEY || '').trim();
    return k ? { 'x-cg-demo-api-key': k } : {};
  },
  async probe() {
    const r = await _get('https://api.coingecko.com/api/v3/ping', this._headers());
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, status: r.status, ms: r.ms, sample: r.json };
  },
  async prices(ids = 'bitcoin,ethereum,solana', vs = 'usd') {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}&include_24hr_change=true`;
    const r = await _get(url, this._headers());
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, prices: r.json };
  }
};

// ── Binance public — crypto market data (no account, read-only) ─────────────
const binance = {
  id: 'binance_public',
  endpoint: 'https://api.binance.com',
  async probe() {
    const r = await _get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, status: r.status, ms: r.ms,
      sample: r.json ? { symbol: r.json.symbol, price: r.json.price } : null };
  },
  async ticker(symbol = 'BTCUSDT') {
    const r = await _get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
    if (!r.ok) return { ok: false, ...r };
    const j = r.json || {};
    return { ok: true, symbol: j.symbol, price: Number(j.lastPrice),
      change_pct: Number(j.priceChangePercent), high: Number(j.highPrice),
      low: Number(j.lowPrice), volume: Number(j.volume) };
  }
};

// ── Frankfurter — ECB reference FX rates ────────────────────────────────────
const frankfurter = {
  id: 'frankfurter',
  endpoint: 'https://api.frankfurter.dev',
  async probe() {
    const r = await _get('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR');
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, status: r.status, ms: r.ms,
      sample: r.json ? { date: r.json.date, base: r.json.base, rates: r.json.rates } : null };
  },
  async rates(base = 'USD', symbols = 'EUR,GBP,JPY,CHF') {
    const r = await _get(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`);
    if (!r.ok) return { ok: false, ...r };
    return { ok: true, date: r.json.date, base: r.json.base, rates: r.json.rates };
  }
};

const ADAPTERS = { sec_edgar: sec, treasury, coingecko, binance_public: binance, frankfurter };

// Probe every keyless provider concurrently. Real network calls; honest results.
async function probeAll() {
  const ids = Object.keys(ADAPTERS);
  const results = await Promise.all(ids.map(async id => {
    const r = await ADAPTERS[id].probe();
    return { id, endpoint: ADAPTERS[id].endpoint, reachable: !!r.ok,
      status: r.status ?? null, ms: r.ms ?? null,
      sample: r.sample ?? null, error: r.ok ? null : (r.error || 'unknown') };
  }));
  const up = results.filter(r => r.reachable).length;
  return {
    checked: results.length, reachable: up, unreachable: results.length - up,
    results, tested_at: new Date().toISOString(),
    note: 'Live GET probes to public endpoints. No keys, no orders, no execution.'
  };
}

module.exports = { ...ADAPTERS, ADAPTERS, probeAll };
