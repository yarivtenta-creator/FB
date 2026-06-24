'use strict';
/**
 * routes.js — Optional Express router for the Governance pack.
 * Mount in v2 with: app.use('/api/governance', require('./governance/routes'));
 * Read-only + status-change-only. No endpoint here can place an order.
 */
const express = require('express');
const router = express.Router();
const gov = require('./governance');

router.get('/status',   (req, res) => res.json(gov.status()));
router.get('/signals',  (req, res) => res.json(gov.listSignals()));
router.post('/signals/:id/promote', (req, res) => res.json(gov.promoteSignal(req.params.id)));
router.get('/orders',   (req, res) => res.json(gov.listOrders()));
router.post('/orders/:id/approve', (req, res) => res.json(gov.decide(req.params.id, 'approve', req.body && req.body.actor)));
router.post('/orders/:id/reject',  (req, res) => res.json(gov.decide(req.params.id, 'reject',  req.body && req.body.actor)));
router.get('/history',  (req, res) => res.json(gov.listHistory()));
router.get('/audit',    (req, res) => res.json(gov.listAudit(req.query.limit)));

module.exports = router;
