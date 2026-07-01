'use strict';
/**
 * module_registry.js — PRIORITY 6. Registry of INSTALLED modules.
 * Read-only metadata: name, version, status, installed date, dependencies, health.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, 'installed_modules.json');
function list(){ try { return JSON.parse(fs.readFileSync(STORE,'utf8')).modules; } catch { return []; } }
module.exports = { list };
