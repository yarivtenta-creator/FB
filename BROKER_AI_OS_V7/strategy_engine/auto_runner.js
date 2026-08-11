'use strict';
/**
 * auto_runner.js — optional timer that ticks the engine automatically.
 *
 * Without this you must click "Tick now" for anything to happen. With it on,
 * the engine evaluates signals on an interval and opens qualifying PAPER trades.
 *
 * SAFETY:
 *  - Honors the PAUSE flag. Paused means read + score only, no new trades.
 *  - OFF by default, and AUTO_RESUME=false means a restart never silently
 *    resumes it — it only restarts if you previously turned it on AND the
 *    engine is not paused.
 *  - Ticking opens PAPER trades in the internal ledger. It never contacts a
 *    broker and never places a real order.
 */
const slotConfig = require('./slot_config');
const runState = require('./run_state');

let _timer = null;
let _lastRun = null;
let _lastResult = null;
let _runCount = 0;
let _lastError = null;

function _tickOnce() {
  try {
    // Require lazily to avoid a circular import at module load.
    const engine = require('./index');
    const r = engine.tick({});
    _lastRun = new Date().toISOString();
    _runCount += 1;
    _lastResult = { paused: r.paused, opened: r.opened_now,
      slots_active: r.slots_active, ranked: r.ranked_count };
    _lastError = null;
  } catch (e) {
    _lastError = e.message;
    _lastRun = new Date().toISOString();
  }
}

function stop() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}

/** Start/stop the timer to match the persisted config. */
function apply() {
  stop();
  const cfg = slotConfig.read();
  if (!cfg.auto.enabled) return status();
  const ms = cfg.auto.interval_sec * 1000;
  _timer = setInterval(_tickOnce, ms);
  if (_timer.unref) _timer.unref();   // never hold the process open
  return status();
}

/** Called once at boot. Only resumes if it was left on AND we're not paused. */
function init() {
  const cfg = slotConfig.read();
  if (cfg.auto.enabled && !runState.isPaused()) return apply();
  return status();
}

function status() {
  const cfg = slotConfig.read();
  return {
    enabled: cfg.auto.enabled,
    running: !!_timer,
    interval_sec: cfg.auto.interval_sec,
    min_interval_sec: slotConfig.MIN_INTERVAL_SEC,
    paused: runState.isPaused(),
    runs: _runCount,
    last_run: _lastRun,
    last_result: _lastResult,
    last_error: _lastError,
    note: cfg.auto.enabled
      ? (runState.isPaused()
          ? 'Auto-tick is ON but the engine is PAUSED — scoring only, no new trades.'
          : `Auto-tick every ${cfg.auto.interval_sec}s. Opens PAPER trades only.`)
      : 'Auto-tick is OFF. Use "Tick now" to run a pass manually.'
  };
}

module.exports = { apply, init, stop, status, tickOnce: _tickOnce };
