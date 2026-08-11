'use strict';
/**
 * connectors/ai_trader — AI-Trader (ai4trade.ai) signal feed.
 *
 * AI-Trader is an agent-native trading SIGNAL platform: other agents publish
 * positions and strategies, and you can read that feed. This connector pulls
 * that feed and turns each signal into a first-class research signal inside
 * BROKER_AI_OS_V7, so it flows through signal_scoring → statistics → the
 * strategy engine exactly like any other source.
 *
 * SCOPE (deliberately narrow):
 *  - READ the public/authenticated signal feed and market-intel snapshots.
 *  - INGEST them locally as research signals.
 *  - It does NOT publish your trades to AI-Trader, does not register you
 *    automatically, and does not place any order anywhere. Ingesting an
 *    AI-Trader signal is exactly as harmless as typing one into the dashboard.
 *
 * SCORING HONESTY: the AI-Trader feed does not supply a numeric conviction
 * score. We therefore assign a single transparent baseline (AITRADER_SCORE,
 * default 0.60) rather than inventing a per-signal number that looks like
 * analysis. 0.60 sits below most strategy thresholds on purpose — an external
 * agent's signal should not by itself trigger your aggressive slots.
 *
 * Auth: AITRADER_TOKEN (sent as X-Claw-Token). Some endpoints are readable
 * without it; those still work when no token is set.
 */
const research = require('../../data_layer/adapters/research');

const DEFAULT_BASE = 'https://ai4trade.ai';
const SKILL = 'ai_trader';

function _base() {
  return (process.env.AITRADER_BASE_URL || DEFAULT_BASE).replace(/\/+$/, '');
}
function _token() {
  return (process.env.AITRADER_TOKEN || '').trim();
}
function _mask(v) {
  if (!v || v.length < 6) return null;
  return v.slice(0, 2) + '*'.repeat(Math.max(v.length - 4, 4)) + v.slice(-2);
}
function _baseline() {
  const n = Number(process.env.AITRADER_SCORE);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.60;
}

function _headers() {
  const h = { accept: 'application/json' };
  const t = _token();
  if (t) h['X-Claw-Token'] = t;
  return h;
}

/** Every network call goes through here so failures are uniform and never throw. */
async function _get(pathname) {
  const url = `${_base()}${pathname}`;
  const started = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', headers: _headers() });
    const ms = Date.now() - started;
    const text = await res.text();
    let body = null; try { body = JSON.parse(text); } catch {}
    if (!res.ok) {
      return { ok: false, url, status: res.status, ms,
               error: (body && (body.message || body.detail)) || text.slice(0, 200) };
    }
    return { ok: true, url, status: res.status, ms, body };
  } catch (e) {
    return { ok: false, url, ms: Date.now() - started, error: e.message, network: true };
  }
}

function status() {
  const t = _token();
  return {
    provider: 'ai_trader',
    name: 'AI-Trader (ai4trade.ai)',
    base_url: _base(),
    token_present: t !== '',
    masked_token: t ? _mask(t) : null,
    baseline_score: _baseline(),
    reads_only: true,
    publishes_your_trades: false,
    places_orders: false,
    env_keys: ['AITRADER_TOKEN'],
    note: t
      ? 'Token present. Authenticated feed reads are available.'
      : 'No AITRADER_TOKEN set. Only endpoints that allow anonymous reads will work. ' +
        'Register at https://ai4trade.ai to get a token, then set AITRADER_TOKEN in .env.'
  };
}

/** Confirm the token is valid (GET /api/claw/agents/me). */
async function whoami() {
  if (!_token()) return { ok: false, error: 'KEYS_REQUIRED', env_keys: ['AITRADER_TOKEN'] };
  const r = await _get('/api/claw/agents/me');
  if (!r.ok) return r;
  const a = r.body || {};
  return { ok: true, agent_id: a.agent_id || a.id || null, name: a.name || null, ms: r.ms };
}

/** Raw signal feed, normalized. Does not ingest. */
async function feed(limit) {
  const n = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const r = await _get(`/api/signals/feed?limit=${n}`);
  if (!r.ok) return r;
  const raw = Array.isArray(r.body) ? r.body : (r.body && r.body.signals) || [];
  return { ok: true, count: raw.length, ms: r.ms, signals: raw.map(_normalize) };
}

function _normalize(s) {
  const side = String(s.side || '').toLowerCase();
  return {
    source_id: s.id != null ? String(s.id) : null,
    agent: s.agent_name || (s.agent_id != null ? `agent#${s.agent_id}` : 'unknown'),
    type: s.type || null,
    symbol: String(s.symbol || '').toUpperCase().replace(/[^A-Z0-9.\-]/g, ''),
    direction: side === 'short' || side === 'sell' ? 'short'
             : side === 'long' || side === 'buy' ? 'long' : 'neutral',
    price: Number(s.entry_price) > 0 ? Number(s.entry_price) : null,
    quantity: s.quantity != null ? Number(s.quantity) : null,
    content: String(s.content || '').slice(0, 300),
    timestamp: s.timestamp || null
  };
}

/**
 * Pull the feed and ingest it as research signals.
 * Same symbol from the same skill supersedes, so repeated syncs do not
 * accumulate duplicates — that dedup is enforced by the research adapter.
 */
async function sync(limit) {
  const f = await feed(limit);
  if (!f.ok) return { ok: false, stage: 'feed', ...f };

  const score = _baseline();
  const usable = f.signals.filter(s => s.symbol && s.direction !== 'neutral');
  const results = usable.map(s => research.ingest({
    symbol: s.symbol,
    direction: s.direction,
    score,
    skill: SKILL,
    price: s.price,
    rationale: `AI-Trader signal from ${s.agent}${s.content ? ': ' + s.content : ''}`,
    tags: ['ai_trader', s.type || 'signal']
  }));

  const ingested = results.filter(r => r.ok).length;
  return {
    ok: true,
    fetched: f.signals.length,
    usable: usable.length,
    ingested,
    rejected: results.length - ingested,
    skipped_neutral: f.signals.length - usable.length,
    baseline_score: score,
    note: `Ingested ${ingested} AI-Trader signals as research signals (score ${score}). ` +
          'They now appear in scoring and statistics. No order was placed.'
  };
}

/** Read-only market-intel snapshot (context, not a trade instruction). */
async function marketIntel(section) {
  const allowed = ['overview', 'news', 'macro-signals', 'etf-flows', 'stocks/featured'];
  const s = allowed.includes(section) ? section : 'overview';
  return _get(`/api/market-intel/${s}`);
}

module.exports = { status, whoami, feed, sync, marketIntel, SKILL };
