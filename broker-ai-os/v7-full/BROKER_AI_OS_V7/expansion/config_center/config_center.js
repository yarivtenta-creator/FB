'use strict';
/**
 * config_center.js — PRIORITY 7. View SAFE system settings only.
 * Shows: execution mode, auto resume, health check interval, mock-mode flags.
 * NEVER shows API keys, secrets, passwords, tokens, or broker credentials.
 * Read-only view; it does not persist changes in this build.
 */
const cfg = {
  execution_mode: (process.env.EXECUTION_MODE || 'manual').trim().toLowerCase(),
  auto_resume: (process.env.AUTO_RESUME || 'false').trim().toLowerCase() === 'true',
  health_check_interval_sec: Number(process.env.HEALTH_INTERVAL_SEC || 60),
  mock_mode: {
    t4: true, news: true, econ_calendar: true, broker: true
  },
  live_endpoint_enabled: false
};

// Hard allow-list: only these keys may ever be exposed.
const ALLOWED = ['execution_mode','auto_resume','health_check_interval_sec','mock_mode','live_endpoint_enabled'];

function view(){
  const safe = {};
  for (const k of ALLOWED) safe[k] = cfg[k];
  // Defensive: never include anything secret-like.
  return { settings: safe, note: 'Safe settings only. No keys/secrets/tokens/credentials are stored or shown.' };
}
module.exports = { view, ALLOWED };
