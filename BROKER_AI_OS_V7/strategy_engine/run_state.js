'use strict';
/**
 * run_state.js — persistent PAUSE/RESUME state for the strategy engine.
 *
 * Survives shutdown: the paused flag is written to runtime/run_state.json on disk,
 * so turning the computer off and on keeps the chosen state. Ties into the existing
 * AUTO_RESUME=false safety rule — on boot the engine reads this file and stays
 * paused if it was paused, never auto-acting.
 *
 * SAFETY: this controls PAPER simulation only. Nothing here touches a broker, an
 * order, or real money. "Running" = the engine may open PAPER trades; "paused" =
 * it keeps reading live data and scoring signals, but opens NO new paper trades.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'runtime', 'run_state.json');

function _default(){
  return { paused: true, updated_at: new Date().toISOString(), reason: 'default_safe_paused' };
}

function read(){
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const s = JSON.parse(raw);
    return { paused: !!s.paused, updated_at: s.updated_at || null, reason: s.reason || null };
  } catch {
    // No file yet → safe default is PAUSED (operator must press Run).
    return _default();
  }
}

function _write(state){
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
    return true;
  } catch (e){
    return false;
  }
}

function pause(reason){
  const state = { paused: true, updated_at: new Date().toISOString(), reason: reason || 'operator_paused' };
  _write(state);
  return state;
}

function resume(reason){
  const state = { paused: false, updated_at: new Date().toISOString(), reason: reason || 'operator_resumed' };
  _write(state);
  return state;
}

function isPaused(){ return read().paused; }

module.exports = { read, pause, resume, isPaused, FILE };
