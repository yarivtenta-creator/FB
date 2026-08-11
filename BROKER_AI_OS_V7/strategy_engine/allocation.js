'use strict';
/**
 * allocation.js — divides the account between the strategies.
 *
 * WHY THIS EXISTS
 * Before allocation, every slot sized its positions off the FULL account equity.
 * With 12 slots running at once that is not "investing $100k across 12
 * strategies" — it is twelve strategies each independently believing it owns the
 * whole $100k, which can commit several times the account. The numbers looked
 * plausible and were meaningless.
 *
 * Now the account is split into per-slot buckets. A slot sizes from its OWN
 * bucket and can never deploy more than its bucket holds, so the totals add up
 * to the real account.
 *
 * MODES
 *   equal     (default) every enabled slot gets the same share
 *   weighted  each slot gets weight_i / sum(weights)
 *
 * RESERVE
 *   reserve_pct is held back and not given to any slot. Default 0.
 *
 * Only ENABLED slots receive capital. Turning a slot off frees its share for
 * the others on the next tick — the split always covers exactly what is running.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'runtime', 'allocation.json');
const SLOT_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const MODES = ['equal', 'weighted'];

function _defaults() {
  const weights = {};
  for (const id of SLOT_IDS) weights[id] = 1;
  return { mode: 'equal', weights, reserve_pct: 0, updated_at: null };
}

function read() {
  const d = _defaults();
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (MODES.includes(j.mode)) d.mode = j.mode;
    for (const id of SLOT_IDS) {
      const w = Number(j.weights && j.weights[id]);
      if (Number.isFinite(w) && w >= 0) d.weights[id] = w;
    }
    const r = Number(j.reserve_pct);
    if (Number.isFinite(r)) d.reserve_pct = Math.min(90, Math.max(0, r));
    d.updated_at = j.updated_at || null;
  } catch { /* first run — defaults */ }
  return d;
}

function _write(cfg) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    cfg.updated_at = new Date().toISOString();
    fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2));
    return true;
  } catch { return false; }
}

/**
 * Split `equity` across `enabledIds`.
 * Returns per-slot dollar buckets plus the reserve, always summing to equity.
 */
function allocate(equity, enabledIds) {
  const cfg = read();
  const eq = Number(equity) > 0 ? Number(equity) : 0;
  const ids = (enabledIds || []).filter(id => SLOT_IDS.includes(id));

  const reserve = +(eq * (cfg.reserve_pct / 100)).toFixed(2);
  const investable = +(eq - reserve).toFixed(2);

  const per = {};
  for (const id of SLOT_IDS) per[id] = 0;

  if (ids.length && investable > 0) {
    if (cfg.mode === 'weighted') {
      const total = ids.reduce((a, id) => a + (cfg.weights[id] || 0), 0);
      // All weights zero would divide by zero — fall back to an even split.
      if (total > 0) {
        for (const id of ids) per[id] = +(investable * (cfg.weights[id] || 0) / total).toFixed(2);
      } else {
        for (const id of ids) per[id] = +(investable / ids.length).toFixed(2);
      }
    } else {
      for (const id of ids) per[id] = +(investable / ids.length).toFixed(2);
    }
  }

  const allocated = +Object.values(per).reduce((a, b) => a + b, 0).toFixed(2);
  return {
    mode: cfg.mode,
    equity: eq,
    reserve_pct: cfg.reserve_pct,
    reserve,
    investable,
    slots_funded: ids.length,
    per_slot: per,
    allocated,
    // Rounding to cents across 12 buckets leaves a few cents; report it rather
    // than hide it, so the dashboard totals are explainable.
    unallocated: +(investable - allocated).toFixed(2)
  };
}

function setMode(mode) {
  if (!MODES.includes(mode)) return { ok: false, error: 'unknown_mode', valid: MODES };
  const cfg = read();
  cfg.mode = mode;
  _write(cfg);
  return { ok: true, mode };
}

function setWeight(id, weight) {
  const key = String(id).toUpperCase();
  if (!SLOT_IDS.includes(key)) return { ok: false, error: 'unknown_slot', slot: id };
  const w = Number(weight);
  if (!Number.isFinite(w) || w < 0) return { ok: false, error: 'weight_must_be_a_number_gte_0' };
  const cfg = read();
  cfg.weights[key] = w;
  _write(cfg);
  return { ok: true, slot: key, weight: w, mode: cfg.mode };
}

function setReserve(pct) {
  const r = Number(pct);
  if (!Number.isFinite(r) || r < 0 || r > 90) return { ok: false, error: 'reserve_pct_must_be_0_to_90' };
  const cfg = read();
  cfg.reserve_pct = r;
  _write(cfg);
  return { ok: true, reserve_pct: r };
}

function reset() {
  const d = _defaults();
  _write(d);
  return { ok: true, ...d };
}

module.exports = { read, allocate, setMode, setWeight, setReserve, reset, SLOT_IDS, MODES, FILE };
