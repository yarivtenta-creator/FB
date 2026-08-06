'use strict';
/**
 * adapters/research — signals ingested from the /trade and /crypto analysis skills.
 *
 * This is the bridge between research done in Claude Code and the app's data
 * pipeline. A skill produces a Trade Score / Crypto Score; POST it here and it
 * becomes a first-class signal alongside the mock providers — scored by
 * signal_scoring, consumed by the strategy engine, counted in statistics.
 *
 * SAFETY: ingesting a signal NEVER places an order. Signals feed paper
 * simulation only. There is no execution path from this file.
 *
 * Storage: runtime/research_signals.json (survives restart).
 */
const fs = require('fs');
const path = require('path');
const S = require('../../schemas');

const FILE = path.join(__dirname, '..', '..', '..', 'runtime', 'research_signals.json');
const PROVIDER = 'research';
const MAX_SIGNALS = 500;
const VALID_DIRECTIONS = ['long', 'short', 'neutral'];

function _read() {
  try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); return Array.isArray(j) ? j : []; }
  catch { return []; }
}

function _write(list) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(list.slice(-MAX_SIGNALS), null, 2));
    return true;
  } catch { return false; }
}

/**
 * Validate + store one research signal.
 * Required: symbol, direction (long|short|neutral), score 0..1
 * Optional: skill, confidence, rationale, price, horizon_days, tags
 */
function ingest(input) {
  const errors = [];
  const symbol = String((input && input.symbol) || '').toUpperCase().replace(/[^A-Z0-9.\-]/g, '');
  if (!symbol) errors.push('symbol is required');

  const direction = String((input && input.direction) || '').toLowerCase();
  if (!VALID_DIRECTIONS.includes(direction)) {
    errors.push(`direction must be one of: ${VALID_DIRECTIONS.join(', ')}`);
  }

  // Accept 0..1 or 0..100 (skills emit scores out of 100).
  let score = Number(input && input.score);
  if (!Number.isFinite(score)) errors.push('score is required (0-1 or 0-100)');
  else {
    if (score > 1) score = score / 100;
    if (score < 0 || score > 1) errors.push('score out of range after normalization');
  }

  let confidence = Number(input && input.confidence);
  if (!Number.isFinite(confidence)) confidence = score;
  else if (confidence > 1) confidence = confidence / 100;

  if (errors.length) return { ok: false, errors };

  const rec = {
    id: Date.now().toString(36) + Math.floor(performance.now() % 1000).toString(36),
    provider: PROVIDER,
    symbol,
    direction,
    score: Number(score.toFixed(4)),
    confidence: Number(confidence.toFixed(4)),
    skill: String((input.skill || 'manual')).slice(0, 40),
    rationale: String(input.rationale || '').slice(0, 500),
    price: Number(input.price) > 0 ? Number(input.price) : null,
    horizon_days: Number.isFinite(Number(input.horizon_days)) ? Number(input.horizon_days) : null,
    tags: Array.isArray(input.tags) ? input.tags.slice(0, 8).map(t => String(t).slice(0, 24)) : [],
    ingested_at: new Date().toISOString(),
    paper: true,       // hard invariant — research never becomes a real order
    executed: false
  };

  const list = _read();
  // Newer research on the same symbol+skill supersedes the older entry.
  const idx = list.findIndex(x => x.symbol === rec.symbol && x.skill === rec.skill);
  if (idx >= 0) list[idx] = rec; else list.push(rec);
  _write(list);
  return { ok: true, signal: rec, total: Math.min(list.length, MAX_SIGNALS) };
}

function ingestMany(arr) {
  if (!Array.isArray(arr)) return { ok: false, errors: ['expected an array'] };
  const accepted = [], rejected = [];
  for (const item of arr.slice(0, 100)) {
    const r = ingest(item);
    if (r.ok) accepted.push(r.signal); else rejected.push({ input: item, errors: r.errors });
  }
  return { ok: rejected.length === 0, accepted: accepted.length, rejected: rejected.length,
    signals: accepted, errors: rejected };
}

function list() { return _read(); }

// Normalized for the data hub, matching the shape of the mock adapters.
function getSignals() {
  return _read().map(r => S.Signal
    ? S.Signal({ provider: PROVIDER, symbol: r.symbol, direction: r.direction, confidence: r.confidence })
    : { provider: PROVIDER, symbol: r.symbol, direction: r.direction, confidence: r.confidence });
}

function stats() {
  const l = _read();
  const bySkill = {}, byDirection = {}, bySymbol = {};
  for (const r of l) {
    bySkill[r.skill] = (bySkill[r.skill] || 0) + 1;
    byDirection[r.direction] = (byDirection[r.direction] || 0) + 1;
    bySymbol[r.symbol] = (bySymbol[r.symbol] || 0) + 1;
  }
  const scores = l.map(r => r.score);
  return {
    total: l.length,
    by_skill: bySkill, by_direction: byDirection,
    symbols_covered: Object.keys(bySymbol).length,
    avg_score: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(4)) : null,
    top_score: scores.length ? Math.max(...scores) : null,
    newest: l.length ? l[l.length - 1].ingested_at : null,
    paper: true, executed: false
  };
}

function clear() { _write([]); return { ok: true, cleared: true }; }

function remove(id) {
  const l = _read();
  const next = l.filter(r => r.id !== id);
  _write(next);
  return { ok: next.length < l.length, removed: l.length - next.length };
}

function status() {
  const l = _read();
  return { kind: 'provider_status', name: 'Research (skills)', category: 'alt_signal',
    status: l.length ? 'live' : 'not_configured', enabled: l.length > 0,
    last_update: l.length ? l[l.length - 1].ingested_at : null,
    health: l.length ? 'ok' : 'mock' };
}

module.exports = { PROVIDER, ingest, ingestMany, list, getSignals, stats, clear, remove, status, FILE };
