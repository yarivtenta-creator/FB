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

// Performance
router.get('/performance', (req,res)=> res.json(perf.report()));

// Merged (Agent 3): governance → paper bridge (candidates / simulate / bridge stats).
require('./paper_bridge_routes.stub')(router);

module.exports = router;
