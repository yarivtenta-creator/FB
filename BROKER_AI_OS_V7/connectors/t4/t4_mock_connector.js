'use strict';
/**
 * t4_mock_connector.js — T4 / Plus500 MOCK connector.
 *
 * SAFETY: This is a DATA-ONLY mock. It:
 *   - reads static JSON quotes from disk
 *   - has NO order routing, NO account connection, NO credentials
 *   - exposes NO write/execute functions
 *
 * Future real integration must keep order routing OUT of this module and behind
 * the Approval Layer. See SAFETY_RULES.md.
 */
const fs = require('fs');
const path = require('path');

const QUOTES = path.join(__dirname, 'mock_futures_quotes.json');
const MAP = path.join(__dirname, 't4_symbol_map.json');

function getQuotes() {
  try {
    const raw = JSON.parse(fs.readFileSync(QUOTES, 'utf8'));
    return { mode: 'mock', generated_at: raw.generated_at, quotes: raw.quotes };
  } catch (e) {
    return { mode: 'mock', error: 'mock_quotes_unavailable', quotes: [] };
  }
}

function getSymbolMap() {
  try {
    return JSON.parse(fs.readFileSync(MAP, 'utf8')).symbols;
  } catch (e) {
    return {};
  }
}

function status() {
  // Always "mock" — never "connected", because there is no real connection.
  const ok = fs.existsSync(QUOTES);
  return ok ? 'mock' : 'not_configured';
}

module.exports = { getQuotes, getSymbolMap, status };
