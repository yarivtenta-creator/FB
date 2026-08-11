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
const slotConfig = require('./slot_config');
const autoRunner = require('./auto_runner');
const allocation = require('./allocation');
const daily = require('./daily');

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

// ── Operator control: which strategies run ─────────────────────────────────
router.get('/slots', (req, res) => res.json(slotConfig.read()));
router.post('/slots/:id', (req, res) => {
  const body = req.body || {};
  res.json(slotConfig.setSlot(req.params.id, body.enabled !== false));
});
router.post('/slots-all', (req, res) => {
  const body = req.body || {};
  res.json(slotConfig.setAll(body.enabled !== false));
});

// ── Auto-tick: run the engine on a timer instead of clicking Tick ──────────
router.get('/auto', (req, res) => res.json(autoRunner.status()));
router.post('/auto', (req, res) => {
  const body = req.body || {};
  const r = slotConfig.setAuto(body.enabled !== false, body.interval_sec);
  if (!r.ok) return res.status(400).json(r);
  autoRunner.apply();
  res.json(autoRunner.status());
});

// ── Capital allocation: how the account is divided between strategies ──────
router.get('/allocation', (req, res) => {
  const st = engine.status();
  res.json({ config: allocation.read(), current: st.allocation });
});
router.post('/allocation/mode', (req, res) => {
  const r = allocation.setMode((req.body || {}).mode);
  res.status(r.ok ? 200 : 400).json(r);
});
router.post('/allocation/weight/:id', (req, res) => {
  const r = allocation.setWeight(req.params.id, (req.body || {}).weight);
  res.status(r.ok ? 200 : 400).json(r);
});
router.post('/allocation/reserve', (req, res) => {
  const r = allocation.setReserve((req.body || {}).reserve_pct);
  res.status(r.ok ? 200 : 400).json(r);
});
router.post('/allocation/reset', (req, res) => res.json(allocation.reset()));

// ── Daily snapshots: what changed since yesterday ──────────────────────────
router.get('/daily', (req, res) => res.json(daily.changes()));
router.get('/daily/status', (req, res) => res.json(daily.status()));
router.get('/daily/history', (req, res) => res.json({ ok: true, snapshots: daily.history(req.query.limit) }));
router.post('/daily/snapshot', async (req, res) => {
  try { res.json({ ok: true, snapshot: await daily.take() }); }
  catch (e) { res.status(500).json({ ok: false, error: 'snapshot_failed', message: e.message }); }
});

module.exports = router;
