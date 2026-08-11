'use strict';
/**
 * routes.js — optional Express router for the Data Layer.
 * Mount in v2 (auth-gated): app.use('/api/data', requireAuth, require('./data_layer/routes'));
 * All endpoints are read-only or paper-simulation. No orders, no live calls, no secrets.
 */
const express = require('express');
const router = express.Router();
const hub = require('./data_hub_v2');
const registry = require('./provider_registry');
const scoring = require('./signal_scoring');
const paper = require('./paper_trading');
const perf = require('./performance_tracker');
const research = require('./adapters/research');

// Data Hub
router.get('/hub/health', (req,res)=> res.json(hub.health()));
router.get('/quotes', (req,res)=> res.json(hub.getQuotes()));
router.get('/news', (req,res)=> res.json(hub.getNews()));
router.get('/calendar', (req,res)=> res.json(hub.getCalendar()));
router.get('/signals', (req,res)=> res.json(hub.getSignals()));

// Provider registry
router.get('/providers', (req,res)=> res.json(registry.list()));
router.get('/providers/summary', (req,res)=> res.json(registry.summary()));
// Merged (Agent 1): per-provider read-only status + read-only test probe.
require('./provider_routes.stub')(router);

// Scoring
router.get('/signals/ranked', (req,res)=> res.json(scoring.rankSignals({ trend:req.query.trend })));

// Paper trading (simulation only)
router.get('/paper/trades', (req,res)=> res.json(paper.listTrades()));
router.get('/paper/stats', (req,res)=> res.json(paper.stats()));
router.post('/paper/open', (req,res)=> res.json(paper.openTrade(req.body||{})));
router.post('/paper/close', (req,res)=> res.json(paper.closeTrade((req.body||{}).id)));

// Research signals — ingested from the /trade and /crypto skills.
// Ingest NEVER places an order; these feed paper simulation and statistics only.
router.get('/research', (req,res)=> res.json({ count: research.list().length, signals: research.list() }));
router.get('/research/stats', (req,res)=> res.json(research.stats()));
router.post('/research', (req,res)=>{
  const body = req.body || {};
  const r = Array.isArray(body) ? research.ingestMany(body)
          : Array.isArray(body.signals) ? research.ingestMany(body.signals)
          : research.ingest(body);
  res.status(r.ok ? 200 : 400).json(r);
});
router.delete('/research/:id', (req,res)=> res.json(research.remove(req.params.id)));
router.post('/research/clear', (req,res)=> res.json(research.clear()));

// Performance
router.get('/performance', (req,res)=> res.json(perf.report()));

// ── Real market signals (momentum/trend from live Alpaca bars) ─────────────
const market = require('./adapters/market_signals');
router.get('/market-signals', (req,res)=> res.json({
  ...market.status(), signals: market.getSignals()
}));
router.post('/market-signals/refresh', async (req,res)=>{
  const r = await market.refresh();
  res.status(r.ok ? 200 : 502).json(r);
});
router.post('/market-signals/clear', (req,res)=> res.json(market.clear()));

// What the hub threw away and why — rejects used to vanish without a trace.
router.get('/rejects', (req,res)=> res.json(hub.rejects()));

// Merged (Agent 3): governance → paper bridge (candidates / simulate / bridge stats).
require('./paper_bridge_routes.stub')(router);

module.exports = router;
