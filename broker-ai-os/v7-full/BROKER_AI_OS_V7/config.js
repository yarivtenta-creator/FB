'use strict';
/**
 * config.js — Broker AI OS v2 runtime configuration.
 *
 * SAFETY CONTRACT (do not weaken):
 *  - EXECUTION_MODE defaults to "manual". There is NO "live" mode anywhere.
 *  - AUTO_RESUME defaults to false. Boot never silently resumes any engine.
 *  - This file reads NO credentials. It never touches .env keys, Alpaca keys,
 *    broker keys, tokens, or passwords. It only reads two non-secret flags.
 *  - This instance is mock-only. It does not connect to the 3023 system, to
 *    SQLite, or to any broker endpoint.
 */

const VALID_MODES = ['manual', 'auto-paper', 'off'];
const VALID_DATA_MODES = ['mock', 'live'];

function readMode() {
  const raw = (process.env.EXECUTION_MODE || 'manual').trim().toLowerCase();
  if (!VALID_MODES.includes(raw)) return 'manual'; // unknown -> safest
  return raw;
}

// DATA_MODE controls the DATA path only (never execution). "mock" = static fixtures,
// no network. "live" = read-only market data ONLY, and only when a provider key is
// present in env. There is NO order/execution path in any mode.
function readDataMode() {
  const raw = (process.env.DATA_MODE || 'mock').trim().toLowerCase();
  if (!VALID_DATA_MODES.includes(raw)) return 'mock'; // unknown -> safest (mock)
  return raw;
}

function readAutoResume() {
  // Only the literal string "true" enables resume. Anything else = false.
  return (process.env.AUTO_RESUME || 'false').trim().toLowerCase() === 'true';
}

const config = {
  PORT: Number(process.env.PORT || 6060),
  INSTANCE: 'BROKER_AI_OS_V7',
  EXECUTION_MODE: readMode(),
  AUTO_RESUME: readAutoResume(),
  VALID_MODES,
  // Data path mode (read-only data only). Defaults to "mock". Never affects execution.
  DATA_MODE: readDataMode(),
  VALID_DATA_MODES,
  // Explicitly no live endpoint. Present so health checks can report it.
  LIVE_ENDPOINT_ENABLED: false,
  // Account B presence is a config flag only — never a credential.
  ACCOUNT_B_CONFIGURED: (process.env.ACCOUNT_B_CONFIGURED || 'false').trim().toLowerCase() === 'true'
};

module.exports = config;
