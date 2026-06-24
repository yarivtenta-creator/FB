'use strict';
/**
 * health/healthcheck.js — System Health Panel backend logic.
 *
 * Returns STATUS ENUMS ONLY. Never returns balances, positions, account
 * numbers, API keys, secrets, credentials, or raw error objects.
 *
 * This v2 instance is mock-only and does not hold broker credentials, so the
 * Alpaca checks report "not_configured" rather than attempting a live ping.
 * That is intentional and safe: a separate instance must not reach the broker.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const t4 = require('../connectors/t4/t4_mock_connector');

// Allowed enums (the only strings any check may return)
const ENUMS = [
  'connected', 'disconnected', 'error', 'not_configured', 'mock',
  'available', 'not_available', 'running', 'stopped', 'ok'
];

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function fullHealth() {
  // Each check maps to an enum via try/catch. No check echoes any credential.
  const checks = {};

  // Alpaca A/B — this instance holds no creds by design.
  checks.alpaca_account_a = config.ACCOUNT_B_CONFIGURED ? 'not_configured' : 'not_configured';
  checks.alpaca_account_b = config.ACCOUNT_B_CONFIGURED ? 'not_configured' : 'not_configured';

  // Database (mock JSON store for v2)
  try {
    checks.database = exists(path.join(__dirname, '..', 'db', 'mock_signals.json')) ? 'connected' : 'disconnected';
  } catch { checks.database = 'error'; }

  // Market data feed — mock instance, no live feed
  checks.market_data_feed = 'mock';

  // AI Agents / Strategy Engine / Legacy Bot / Wheel — surfaced from runtime state, never auto-started
  const rt = readRuntime();
  checks.ai_agents       = rt.agents_running ? 'running' : 'stopped';
  checks.strategy_engine = rt.strategy_engine_running ? 'running' : 'stopped';
  checks.legacy_bot      = rt.legacy_bot_running ? 'running' : 'stopped';
  checks.wheel_strategy  = rt.wheel_running ? 'running' : 'stopped';

  // Matching engine — local sim placeholder
  checks.matching_engine = 'ok';

  // T4 connector — mock
  try { checks.t4_connector = t4.status(); } catch { checks.t4_connector = 'error'; }

  // n8n registry — static availability
  try {
    checks.n8n_registry = exists(path.join(__dirname, '..', 'registry', 'n8n', 'template_registry.json'))
      ? 'available' : 'not_available';
  } catch { checks.n8n_registry = 'error'; }

  // Validate every value is an allowed enum (defensive)
  for (const k of Object.keys(checks)) {
    if (!ENUMS.includes(checks[k])) checks[k] = 'error';
  }

  return {
    instance: config.INSTANCE,
    execution_mode: config.EXECUTION_MODE,
    auto_resume: config.AUTO_RESUME,
    live_endpoint_enabled: config.LIVE_ENDPOINT_ENABLED, // always false
    checks,
    checked_at: new Date().toISOString()
  };
}

function readRuntime() {
  // Reads a non-secret runtime flag file. Defaults to everything stopped.
  const p = path.join(__dirname, '..', 'runtime', 'runtime_state.json');
  try {
    if (!exists(p)) return {};
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return {}; }
}

module.exports = { fullHealth, ENUMS };
