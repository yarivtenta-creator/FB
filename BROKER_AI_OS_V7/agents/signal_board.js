'use strict';
/**
 * agents/signal_board.js — Paper Signal Board (read-only).
 * Reads mock signals; never executes. Mirrors real signals/decisions columns.
 */
const fs = require('fs');
const path = require('path');

const STORE = path.join(__dirname, '..', 'db', 'mock_signals.json');

function list() {
  try {
    const raw = JSON.parse(fs.readFileSync(STORE, 'utf8'));
    return raw.signals.map(s => ({
      source: s.source,
      symbol: s.symbol,
      direction: s.direction,
      strength: s.strength,
      confidence: s.confidence,
      reason: s.detail,
      time: s.created_at,
      status: s.status
    }));
  } catch {
    return [];
  }
}

module.exports = { list };
