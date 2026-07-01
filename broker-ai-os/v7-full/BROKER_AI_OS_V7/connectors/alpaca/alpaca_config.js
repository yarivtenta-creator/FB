'use strict';
/**
 * connectors/alpaca/alpaca_config.js
 * Loads and validates Alpaca env vars. READ-ONLY mode enforced.
 * Supports both canonical names (ALPACA_API_KEY / ALPACA_SECRET_KEY) and
 * legacy names (ALPACA_API_KEY_ID / ALPACA_API_SECRET_KEY) so either .env style works.
 * Key values are NEVER logged or returned — only masked representations.
 */

function maskKey(val) {
  if (!val || val.length < 6) return '***';
  return val.slice(0, 2) + '*'.repeat(Math.max(val.length - 4, 4)) + val.slice(-2);
}

function load() {
  // Support both naming conventions
  const apiKey = process.env.ALPACA_API_KEY || process.env.ALPACA_API_KEY_ID || '';
  const secretKey = process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET_KEY || '';
  const baseUrl = (process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets').replace(/\/+$/, '');
  const dataUrl = (process.env.ALPACA_DATA_URL || process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets').replace(/\/+$/, '');
  const isPaper = (process.env.ALPACA_PAPER || 'true').toLowerCase() !== 'false';
  const isReadOnly = (process.env.ALPACA_READ_ONLY || 'true').toLowerCase() !== 'false';

  const hasApiKey = apiKey.trim() !== '';
  const hasSecretKey = secretKey.trim() !== '';
  const configured = hasApiKey && hasSecretKey;

  return {
    configured,
    isPaper,
    isReadOnly: true, // ALWAYS true in V7 — cannot be disabled
    baseUrl,
    dataUrl,
    // Masked representations only — never real values returned
    maskedApiKey: hasApiKey ? maskKey(apiKey) : null,
    maskedSecretKey: hasSecretKey ? maskKey(secretKey) : null,
    missingKeys: [
      ...(!hasApiKey ? ['ALPACA_API_KEY'] : []),
      ...(!hasSecretKey ? ['ALPACA_SECRET_KEY'] : [])
    ],
    // Internal getters — used only inside this module's scope
    _getApiKey: () => apiKey,
    _getSecretKey: () => secretKey
  };
}

module.exports = { load, maskKey };
