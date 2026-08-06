'use strict';
/**
 * strategy_engine/routes.js — auth-gated endpoints for the multi-account strategy
 * engine and the persistent Pause/Resume control.
 *
 * All endpoints are paper-only / read-only-data. None places a real order.
 * Mount in server.js:  app.use('/api/strategy', requireAuth, require('./strategy_engine/routes'));
 */
const express = require('express');
const router = express.Router();
const engine = require('./index');
const runState = require('./run_state');

// Status of all three accounts/strategies + current pause state.
router.get('/status', (req, res) => res.json(engine.status()));

// Run one engine tick now (score + open qualifying paper trades unless paused).
router.post('/tick', (req, res) => res.json(engine.tick(req.body || {})));

// Per-slot paper ledger.
router.get('/trades/:account', (req, res) => res.json(engine.trades(req.params.account)));

// All strategies in the catalog.
router.get('/strategies', (req, res) => res.json({ count: engine.strategies().length, strategies: engine.strategies() }));

// Every paper trade across all slots.
router.get('/trades', (req, res) => res.json(engine.allTrades()));

// Force a read-only refresh of real Alpaca paper equity.
router.post('/equity/refresh', async (req, res) => {
  try { res.json(await engine.refreshEquity()); }
  catch (e) { res.status(500).json({ ok:false, error:'equity_refresh_failed', message:e.message }); }
});

// ── Persistent Pause / Resume (survives shutdown) ───────────────────────────────
router.get('/run-state', (req, res) => res.json(runState.read()));
router.post('/pause',  (req, res) => res.json(runState.pause((req.body || {}).reason)));
router.post('/resume', (req, res) => res.json(runState.resume((req.body || {}).reason)));

module.exports = router;
