'use strict';
/**
 * connectors/alpaca/alpaca_execution.js — OPTION B: real PAPER order placement.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE CHANGING ANYTHING IN THIS FILE.
 *
 * Until Option B, BROKER_AI_OS_V7 contacted Alpaca with GET only. This module is
 * the ONLY place in the entire system that issues a POST/DELETE to a broker.
 * It exists because the operator explicitly asked for orders to reach their
 * Alpaca PAPER account so the paper balance actually moves.
 *
 * It is NOT a live-trading module. Five independent guards must ALL pass before
 * a single order is sent, and any one of them failing blocks the order:
 *
 *   1. OPT_IN        ALPACA_EXECUTE=true must be set. Default is off.
 *   2. PAPER_HOST    Base URL host must be exactly paper-api.alpaca.markets.
 *                    A live host (api.alpaca.markets) is refused outright.
 *   3. PAPER_KEY     API key must start with "PK". Live keys start with "AK"
 *                    and are refused — a live key can never reach this code.
 *   4. KEYS_PRESENT  Both key and secret must exist.
 *   5. PAPER_ACCOUNT GET /v2/account must return an account_number beginning
 *                    with "PA", which Alpaca uses only for paper accounts.
 *
 * There is no env var, flag, or argument that disables guards 2, 3, or 5.
 * Setting ALPACA_EXECUTE=true against a live host or a live key does not enable
 * live trading — it produces a blocked result and an audit record.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const fs = require('fs');
const path = require('path');

const PAPER_HOST = 'paper-api.alpaca.markets';
const AUDIT_FILE = path.join(__dirname, '..', '..', 'runtime', 'execution_audit.json');
const MAX_AUDIT = 500;

function _key()    { return (process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '').trim(); }
function _secret() { return (process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '').trim(); }
function _base()   { return (process.env.ALPACA_BASE_URL || 'https://' + PAPER_HOST).replace(/\/+$/, ''); }

function _mask(v) {
  if (!v || v.length < 6) return '***';
  return v.slice(0, 2) + '*'.repeat(Math.max(v.length - 4, 4)) + v.slice(-2);
}

function _headers() {
  return {
    'APCA-API-KEY-ID': _key(),
    'APCA-API-SECRET-KEY': _secret(),
    'accept': 'application/json',
    'content-type': 'application/json'
  };
}

// ── Audit trail: every order attempt, allowed or blocked ──────────────────────
function _audit(entry) {
  try {
    let list = [];
    try { const j = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8')); if (Array.isArray(j)) list = j; } catch {}
    list.push({ ...entry, at: new Date().toISOString() });
    fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(list.slice(-MAX_AUDIT), null, 2));
  } catch {}
}

function auditLog(limit) {
  try {
    const j = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    const list = Array.isArray(j) ? j : [];
    return list.slice(-(Number(limit) || 100)).reverse();
  } catch { return []; }
}

// ── Guards 1-4: synchronous, no network ──────────────────────────────────────
/**
 * Static safety checks. Returns every check with its own pass/fail so the
 * dashboard can show exactly which guard is blocking, never a bare "denied".
 */
function guardStatic() {
  const key = _key();
  const secret = _secret();
  const base = _base();

  let host = null;
  try { host = new URL(base).host; } catch { host = null; }

  const checks = [
    {
      id: 'OPT_IN', label: 'ALPACA_EXECUTE=true',
      pass: String(process.env.ALPACA_EXECUTE || '').trim().toLowerCase() === 'true',
      detail: 'Explicit opt-in. Default is off — no orders are sent without it.'
    },
    {
      id: 'PAPER_HOST', label: `Base URL host is ${PAPER_HOST}`,
      pass: host === PAPER_HOST,
      detail: `ALPACA_BASE_URL resolves to ${host || 'an unparseable URL'}. Only the paper host is accepted.`
    },
    {
      id: 'PAPER_KEY', label: 'API key is a paper key (PK…)',
      pass: /^PK/.test(key),
      detail: key ? `Key ${_mask(key)} starts with "${key.slice(0, 2)}". Live keys start with AK and are refused.`
                  : 'No API key present.'
    },
    {
      id: 'KEYS_PRESENT', label: 'Key and secret both present',
      pass: key !== '' && secret !== '',
      detail: `key=${key ? 'present' : 'missing'} secret=${secret ? 'present' : 'missing'}`
    }
  ];

  const failed = checks.filter(c => !c.pass);
  return { allowed: failed.length === 0, checks, blocked_by: failed.map(c => c.id) };
}

// ── Guard 5: confirm the account really is a paper account ───────────────────
const _acct = { ok: false, number: null, equity: null, ts: 0, error: null };
const ACCT_TTL_MS = 60000;
let _acctInflight = null;   // shared promise — see the race note below

/**
 * A tick opens many trades at once, so this is called many times in parallel.
 * The cache timestamp must NOT be stamped before the request resolves: doing so
 * makes every concurrent caller read a "fresh" cache that still holds the
 * pre-request ok=false, and they all get wrongly blocked. Concurrent callers
 * therefore share ONE in-flight promise, and the timestamp is written only
 * after the answer is known.
 */
async function verifyPaperAccount(force) {
  if (!force && _acct.ts && (Date.now() - _acct.ts) < ACCT_TTL_MS) return { ..._acct, cached: true };
  if (_acctInflight) return _acctInflight;
  _acctInflight = _verifyPaperAccountNow().finally(() => { _acctInflight = null; });
  return _acctInflight;
}

async function _verifyPaperAccountNow() {
  try {
    const res = await fetch(`${_base()}/v2/account`, { method: 'GET', headers: _headers() });
    if (!res.ok) {
      _acct.ok = false; _acct.error = 'http_' + res.status; _acct.number = null;
      _acct.ts = Date.now();
      return { ..._acct, cached: false };
    }
    const j = await res.json();
    const num = String(j.account_number || '');
    _acct.ok = /^PA/.test(num);          // PA = paper account number
    _acct.number = num ? _mask(num) : null;
    _acct.equity = Number(j.equity) || null;
    _acct.error = _acct.ok ? null : 'account_number_not_paper';
    _acct.ts = Date.now();
    return { ..._acct, cached: false };
  } catch (e) {
    _acct.ok = false; _acct.error = e.message; _acct.number = null;
    _acct.ts = Date.now();
    return { ..._acct, cached: false };
  }
}

/** Full guard: static checks plus the live paper-account verification. */
async function guard() {
  const stat = guardStatic();
  // Don't burn a network call if a static guard already blocks.
  if (!stat.allowed) {
    return {
      ...stat,
      checks: stat.checks.concat([{
        id: 'PAPER_ACCOUNT', label: 'Account number is a paper account (PA…)',
        pass: false, detail: 'Not checked — a static guard already blocks execution.'
      }])
    };
  }
  const acct = await verifyPaperAccount();
  const check = {
    id: 'PAPER_ACCOUNT', label: 'Account number is a paper account (PA…)',
    pass: acct.ok === true,
    detail: acct.ok ? `Account ${acct.number} confirmed paper.`
                    : `Could not confirm a paper account (${acct.error || 'unknown'}).`
  };
  const checks = stat.checks.concat([check]);
  const failed = checks.filter(c => !c.pass);
  return { allowed: failed.length === 0, checks, blocked_by: failed.map(c => c.id) };
}

// ── Order submission ─────────────────────────────────────────────────────────
/**
 * Submit ONE market order to the Alpaca PAPER account.
 * Every guard runs on every call — there is no cached "already allowed" path.
 * Returns {ok, order?, blocked?, reason?, guard} and never throws.
 */
async function submitOrder(input) {
  const symbol = String((input && input.symbol) || '').toUpperCase().replace(/[^A-Z0-9.\-]/g, '');
  const side = String((input && input.side) || '').toLowerCase();
  const qty = Math.floor(Number(input && input.qty));

  if (!symbol)                       return { ok: false, blocked: true, reason: 'invalid_symbol' };
  if (side !== 'buy' && side !== 'sell')
    return { ok: false, blocked: true, reason: 'invalid_side', detail: 'side must be buy or sell' };
  if (!Number.isFinite(qty) || qty < 1)
    return { ok: false, blocked: true, reason: 'invalid_qty' };

  const g = await guard();
  if (!g.allowed) {
    const rec = { event: 'order_blocked', symbol, side, qty, blocked_by: g.blocked_by };
    _audit(rec);
    return { ok: false, blocked: true, reason: 'guard_blocked', blocked_by: g.blocked_by, guard: g };
  }

  const body = {
    symbol, qty: String(qty), side,
    type: 'market', time_in_force: 'day',
    client_order_id: `V7-${Date.now()}-${symbol}-${side}`.slice(0, 48)
  };

  try {
    const res = await fetch(`${_base()}/v2/orders`, {
      method: 'POST', headers: _headers(), body: JSON.stringify(body)
    });
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch {}

    if (!res.ok) {
      _audit({ event: 'order_rejected', symbol, side, qty, status: res.status,
               message: (j && (j.message || j.error)) || text.slice(0, 200) });
      return { ok: false, blocked: false, reason: 'broker_rejected', status: res.status,
               message: (j && (j.message || j.error)) || text.slice(0, 200) };
    }

    _audit({ event: 'order_accepted', symbol, side, qty,
             broker_order_id: j && j.id, client_order_id: body.client_order_id });
    return {
      ok: true, paper: true, live: false,
      order: {
        broker_order_id: j && j.id,
        client_order_id: j && j.client_order_id,
        symbol: j && j.symbol, side: j && j.side, qty: j && j.qty,
        status: j && j.status, submitted_at: j && j.submitted_at
      },
      note: 'Order sent to the Alpaca PAPER account. No real money is involved.'
    };
  } catch (e) {
    _audit({ event: 'order_error', symbol, side, qty, message: e.message });
    return { ok: false, blocked: false, reason: 'network_error', message: e.message };
  }
}

// ── Read-back: what the broker actually holds ────────────────────────────────
async function _get(pathname) {
  const g = guardStatic();
  // Reads only need keys + paper host, not the execute opt-in.
  const need = g.checks.filter(c => c.id !== 'OPT_IN' && !c.pass);
  if (need.length) return { ok: false, reason: 'guard_blocked', blocked_by: need.map(c => c.id) };
  try {
    const res = await fetch(`${_base()}${pathname}`, { method: 'GET', headers: _headers() });
    if (!res.ok) return { ok: false, reason: 'http_' + res.status };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, reason: 'network_error', message: e.message };
  }
}

async function positions() {
  const r = await _get('/v2/positions');
  if (!r.ok) return r;
  return {
    ok: true, count: r.data.length,
    positions: r.data.map(p => ({
      symbol: p.symbol, qty: p.qty, side: p.side,
      avg_entry_price: p.avg_entry_price, market_value: p.market_value,
      unrealized_pl: p.unrealized_pl, unrealized_plpc: p.unrealized_plpc
    }))
  };
}

async function orders(status) {
  const q = `/v2/orders?status=${encodeURIComponent(status || 'all')}&limit=50&direction=desc`;
  const r = await _get(q);
  if (!r.ok) return r;
  return {
    ok: true, count: r.data.length,
    orders: r.data.map(o => ({
      id: o.id, client_order_id: o.client_order_id, symbol: o.symbol,
      side: o.side, qty: o.qty, filled_qty: o.filled_qty,
      status: o.status, submitted_at: o.submitted_at, filled_at: o.filled_at,
      filled_avg_price: o.filled_avg_price
    }))
  };
}

/** Dashboard summary: is execution armed, and if not, exactly what blocks it. */
async function status() {
  const g = await guard();
  return {
    system: 'BROKER_AI_OS_V7',
    mode: g.allowed ? 'PAPER_EXECUTION_ARMED' : 'EXECUTION_BLOCKED',
    execution_enabled: g.allowed,
    live_trading: false,          // structurally impossible — see PAPER_HOST/PAPER_KEY guards
    paper_only: true,
    base_url: _base(),
    masked_key: _key() ? _mask(_key()) : null,
    account_number: _acct.number,
    account_equity: _acct.equity,
    guards: g.checks,
    blocked_by: g.blocked_by,
    note: g.allowed
      ? 'Orders WILL be sent to your Alpaca PAPER account. Your paper balance will move. No real money.'
      : `Execution is blocked by: ${g.blocked_by.join(', ')}. No orders are being sent.`
  };
}

module.exports = {
  guard, guardStatic, verifyPaperAccount, submitOrder,
  positions, orders, status, auditLog, PAPER_HOST
};
