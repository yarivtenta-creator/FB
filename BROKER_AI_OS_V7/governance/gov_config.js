'use strict';
/**
 * gov_config.js — Governance configuration (safety defaults).
 *
 * SAFETY CONTRACT (do not weaken):
 *  - EXECUTION_MODE default = "manual". There is NO "live" mode. Ever.
 *  - AUTO_RESUME default = false. Boot must never silently resume an engine.
 *  - Reads NO credentials, NO .env keys, NO secrets.
 *  - Approving an item sets an "execution_allowed" GATE FLAG. It never places
 *    an order. There is no broker client in this package.
 */

const VALID_MODES = ['manual', 'auto-paper', 'off'];

function readMode() {
  const raw = (process.env.EXECUTION_MODE || 'manual').trim().toLowerCase();
  return VALID_MODES.includes(raw) ? raw : 'manual'; // unknown -> safest
}
function readAutoResume() {
  return (process.env.AUTO_RESUME || 'false').trim().toLowerCase() === 'true';
}

module.exports = {
  EXECUTION_MODE: readMode(),
  AUTO_RESUME: readAutoResume(),
  VALID_MODES,
  LIVE_ENDPOINT_ENABLED: false,   // always false
  // The flow this package enforces, for reference:
  FLOW: ['signal', 'pending_approval', 'human_approval', 'execution_allowed_gate'],
  // Even when an item is approved, execution is only *permitted*, never performed here.
  EXECUTION_IS_PERFORMED_HERE: false
};
