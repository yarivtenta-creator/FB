'use strict';
/**
 * connectors/alpaca/alpaca_exec_routes.js — Option B execution endpoints.
 *
 * Mounted separately from the read-only /api/alpaca router so that router keeps
 * its GET-only contract intact. Everything here is PAPER-account only; the
 * guards in alpaca_execution.js are enforced on every single call.
 */
const express = require('express');
const router = express.Router();
const exec = require('./alpaca_execution');

// GET /api/alpaca-exec/status — armed or blocked, with per-guard detail.
router.get('/status', async (req, res) => {
  try { res.json(await exec.status()); }
  catch (e) { res.status(500).json({ ok: false, error: 'exec_status_failed', message: e.message }); }
});

// GET /api/alpaca-exec/positions — what the paper account actually holds.
router.get('/positions', async (req, res) => {
  const r = await exec.positions();
  res.status(r.ok ? 200 : 502).json(r);
});

// GET /api/alpaca-exec/orders — real broker order history.
router.get('/orders', async (req, res) => {
  const r = await exec.orders(req.query.status);
  res.status(r.ok ? 200 : 502).json(r);
});

// GET /api/alpaca-exec/audit — every order attempt, allowed or blocked.
router.get('/audit', (req, res) => {
  res.json({ ok: true, entries: exec.auditLog(req.query.limit) });
});

// POST /api/alpaca-exec/order — submit ONE market order to the paper account.
router.post('/order', async (req, res) => {
  const r = await exec.submitOrder(req.body || {});
  // Guard refusal is a 403 (we refused), broker refusal is a 502 (they refused).
  const code = r.ok ? 200 : (r.blocked ? 403 : 502);
  res.status(code).json(r);
});

module.exports = router;
