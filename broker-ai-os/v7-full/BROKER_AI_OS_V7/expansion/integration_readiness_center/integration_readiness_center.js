'use strict';
/**
 * integration_readiness_center.js — PRIORITY 8. Readiness tracker (registry only).
 * Tracks readiness for future integrations. NO connections. Supersedes the bare
 * future_connectors_registry by adding: status, missing requirements, docs, risk.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, 'readiness.json');
function list(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')).integrations; } catch { return []; } }
module.exports = { list };
