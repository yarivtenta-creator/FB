'use strict';
/**
 * audit_log.js — Safety Audit Log (append-only).
 * Records every governance action. Redacts anything that looks like a secret.
 * No secrets are ever written here on purpose.
 */
const fs = require('fs');
const path = require('path');

const STORE = path.join(__dirname, 'store', 'safety_audit_log.json');
const SECRETISH = /\b[A-Za-z0-9_\-]{20,}\b/g;

function _redact(s) {
  return String(s).replace(SECRETISH, '[redacted]');
}
function _load() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); }
  catch { return { events: [] }; }
}
function _save(d) { fs.writeFileSync(STORE, JSON.stringify(d, null, 2)); }

function record(action, detail, meta) {
  const d = _load();
  const ev = {
    id: d.events.length ? d.events[d.events.length - 1].id + 1 : 1,
    action: String(action),
    detail: _redact(detail || ''),
    meta: meta ? JSON.parse(_redact(JSON.stringify(meta))) : null,
    at: new Date().toISOString()
  };
  d.events.push(ev);
  _save(d);
  return ev;
}
function list(limit) {
  const ev = _load().events;
  return limit ? ev.slice(-Number(limit)) : ev;
}

module.exports = { record, list };
