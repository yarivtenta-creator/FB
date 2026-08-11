'use strict';
/**
 * slot_config.js — persistent per-slot control.
 *
 * Lets the operator choose WHICH of the 12 strategies actually run, and whether
 * the engine ticks automatically. Survives restart.
 *
 * SAFETY: this only gates PAPER simulation. Enabling a slot never authorizes a
 * real order — no order path exists anywhere in the engine.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'runtime', 'slot_config.json');
const SLOT_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const MIN_INTERVAL_SEC = 30;      // floor, so a typo can't hammer the loop
const MAX_INTERVAL_SEC = 86400;

function _defaults() {
  const slots = {};
  for (const id of SLOT_IDS) slots[id] = { enabled: true };
  return { slots, auto: { enabled: false, interval_sec: 300 }, updated_at: null };
}

function read() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const d = _defaults();
    // Merge so a partial/old file can't drop slots.
    for (const id of SLOT_IDS) {
      if (j.slots && j.slots[id] && typeof j.slots[id].enabled === 'boolean') {
        d.slots[id].enabled = j.slots[id].enabled;
      }
    }
    if (j.auto) {
      d.auto.enabled = !!j.auto.enabled;
      const s = Number(j.auto.interval_sec);
      if (Number.isFinite(s)) d.auto.interval_sec = Math.min(MAX_INTERVAL_SEC, Math.max(MIN_INTERVAL_SEC, s));
    }
    d.updated_at = j.updated_at || null;
    return d;
  } catch { return _defaults(); }
}

function _write(cfg) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    cfg.updated_at = new Date().toISOString();
    fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2));
    return true;
  } catch { return false; }
}

function isEnabled(id) {
  const cfg = read();
  return !!(cfg.slots[String(id).toUpperCase()] || {}).enabled;
}

function setSlot(id, enabled) {
  const key = String(id).toUpperCase();
  if (!SLOT_IDS.includes(key)) return { ok: false, error: 'unknown_slot', slot: id };
  const cfg = read();
  cfg.slots[key].enabled = !!enabled;
  _write(cfg);
  return { ok: true, slot: key, enabled: !!enabled };
}

function setAll(enabled) {
  const cfg = read();
  for (const id of SLOT_IDS) cfg.slots[id].enabled = !!enabled;
  _write(cfg);
  return { ok: true, all: !!enabled, slots: cfg.slots };
}

function setAuto(enabled, intervalSec) {
  const cfg = read();
  cfg.auto.enabled = !!enabled;
  if (intervalSec !== undefined && intervalSec !== null) {
    const s = Number(intervalSec);
    if (!Number.isFinite(s)) return { ok: false, error: 'interval_must_be_a_number' };
    cfg.auto.interval_sec = Math.min(MAX_INTERVAL_SEC, Math.max(MIN_INTERVAL_SEC, Math.round(s)));
  }
  _write(cfg);
  return { ok: true, auto: cfg.auto, min_interval_sec: MIN_INTERVAL_SEC };
}

module.exports = { read, setSlot, setAll, setAuto, isEnabled, SLOT_IDS, MIN_INTERVAL_SEC, FILE };
