'use strict';
/**
 * routes.js — Optional combined Express router for the Expansion Pack.
 * Mount in v2: app.use('/api/expansion', require('./expansion/routes'));
 * All endpoints are read-only or status/diagnostic only. None place orders.
 */
const express = require('express');
const router = express.Router();

const acc = require('./agent_control_center_v2/agent_control_center_v2');
const audit = require('./audit_center/audit_center');
const hub = require('./data_hub/data_hub');
const explain = require('./signal_explainer/signal_explainer');
const smap = require('./system_map/system_map');
const mods = require('./module_registry/module_registry');
const conf = require('./config_center/config_center');
const ready = require('./integration_readiness_center/integration_readiness_center');

// P1 Agent Control Center v2
router.get('/agents', (req,res)=>res.json(acc.list()));
router.get('/agents/:id/diag', (req,res)=>res.json(acc.diagnostics(req.params.id)));
router.get('/agents/:id/output', (req,res)=>res.json(acc.lastOutput(req.params.id)));
router.post('/agents/:id/test', (req,res)=>res.json(acc.testAgent(req.params.id)));
router.post('/agents/:id/start', (req,res)=>res.json(acc.setRunning(req.params.id,true)));
router.post('/agents/:id/stop', (req,res)=>res.json(acc.setRunning(req.params.id,false)));
// P2 Audit Center
router.get('/audit', (req,res)=>res.json(audit.query(req.query)));
router.get('/audit/facets', (req,res)=>res.json(audit.facets()));
// P3 Data Hub
router.get('/data', (req,res)=>res.json(hub.unified(req.query.provider)));
router.get('/data/describe', (req,res)=>res.json(hub.describe()));
// P4 Signal Explainer
router.get('/explain', (req,res)=>res.json(explain.all()));
router.get('/explain/:id', (req,res)=>res.json(explain.explain(req.params.id)));
// P5 System Map
router.get('/map', (req,res)=>res.json(smap.map()));
// P6 Module Registry
router.get('/modules', (req,res)=>res.json(mods.list()));
// P7 Config Center
router.get('/config', (req,res)=>res.json(conf.view()));
// P8 Integration Readiness
router.get('/readiness', (req,res)=>res.json(ready.list()));

module.exports = router;
