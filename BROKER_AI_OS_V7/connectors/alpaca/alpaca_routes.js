'use strict';
/**
 * connectors/alpaca/alpaca_routes.js
 * BROKER_AI_OS_V7 — Express router for Alpaca READ-ONLY endpoints.
 *
 * NO order endpoints. NO write endpoints. GET only.
 * All responses are JSON. Missing keys → 503 with KEYS_REQUIRED code.
 */

const express = require('express');
const router = express.Router();
const provider = require('./alpaca_provider');

// GET /api/alpaca/status — provider config status (no keys required)
router.get('/status', async (req, res) => {
  try {
    const s = await provider.getStatus();
    res.json(s);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'status_check_failed', message: e.message });
  }
});

// Missing credentials → 503 (service not configured). Real call that failed → 502.
function _statusFor(result) {
  if (result.ok) return 200;
  const missing = result.code === 'KEYS_REQUIRED' || result.alpaca_state === 'MOCK_NO_KEYS';
  return missing ? 503 : 502;
}

// GET /api/alpaca/test — connection test (keys required for real test)
router.get('/test', async (req, res) => {
  try {
    const result = await provider.testConnection();
    res.status(_statusFor(result)).json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'test_failed', message: e.message });
  }
});

// GET /api/alpaca/account — read-only account status (keys required)
router.get('/account', async (req, res) => {
  try {
    const result = await provider.getAccount();
    res.status(_statusFor(result)).json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'account_read_failed', message: e.message });
  }
});

// GET /api/alpaca/market/:symbol — latest quote for a symbol
router.get('/market/:symbol', async (req, res) => {
  const symbol = (req.params.symbol || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!symbol) return res.status(400).json({ ok: false, error: 'invalid_symbol' });
  try {
    const result = await provider.getMarketData(symbol);
    res.status(_statusFor(result)).json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'market_data_failed', message: e.message });
  }
});

// GET /api/alpaca/mock/:symbol — mock quote, no keys needed
router.get('/mock/:symbol', (req, res) => {
  const symbol = (req.params.symbol || 'AAPL').toUpperCase().replace(/[^A-Z]/g, '');
  res.json(provider.getMockQuote(symbol));
});

// Block any attempt to POST/PUT/DELETE (safety guard)
router.all('*', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Alpaca connector is READ-ONLY. Write operations are disabled in BROKER_AI_OS_V7.'
    });
  }
  next();
});

module.exports = router;
