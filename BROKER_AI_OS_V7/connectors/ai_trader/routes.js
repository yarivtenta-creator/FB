'use strict';
/**
 * connectors/ai_trader/routes.js — AI-Trader feed endpoints.
 * Read + local ingest only. Nothing here publishes to AI-Trader or places orders.
 */
const express = require('express');
const router = express.Router();
const ai = require('./index');

router.get('/status', (req, res) => res.json(ai.status()));

router.get('/whoami', async (req, res) => {
  const r = await ai.whoami();
  res.status(r.ok ? 200 : (r.error === 'KEYS_REQUIRED' ? 503 : 502)).json(r);
});

router.get('/feed', async (req, res) => {
  const r = await ai.feed(req.query.limit);
  res.status(r.ok ? 200 : 502).json(r);
});

router.get('/market-intel/:section?', async (req, res) => {
  const r = await ai.marketIntel(req.params.section);
  res.status(r.ok ? 200 : 502).json(r);
});

// Pull the feed and ingest it into this system's research signals.
router.post('/sync', async (req, res) => {
  const r = await ai.sync((req.body || {}).limit);
  res.status(r.ok ? 200 : 502).json(r);
});

module.exports = router;
