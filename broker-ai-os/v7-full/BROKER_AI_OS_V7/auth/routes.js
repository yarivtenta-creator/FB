'use strict';
/**
 * routes.js — optional Express router for the Auth Pack.
 * Mount in v2: app.use('/api/auth', require('./auth/routes'));
 * Protect existing admin areas using middleware.requirePerm(...) (see HOW_TO_INSTALL.md).
 */
const express = require('express');
const router = express.Router();
const auth = require('./auth');
const roles = require('./roles');
const secrets = require('./secrets_status');
const { requireAuth, requirePerm } = require('./middleware');

// ── Public: login ─────────────────────────────────────────
router.post('/login', (req,res)=>{
  const { username, password, remember } = req.body || {};
  const r = auth.login(username, password, !!remember);
  res.status(r.ok ? 200 : 401).json(r);
});
router.post('/logout', (req,res)=>{
  const token = req.headers['x-auth-token'];
  res.json(auth.logout(token));
});
router.get('/whoami', (req,res)=> res.json(auth.whoami(req.headers['x-auth-token'])));

// ── Authenticated ─────────────────────────────────────────
router.get('/roles', requireAuth, (req,res)=> res.json(roles.listRoles()));
router.post('/approvals', requireAuth, (req,res)=>{
  const { signal_id, decision } = req.body || {};
  res.json(auth.recordApproval(req.headers['x-auth-token'], signal_id, decision));
});
router.get('/approvals', requireAuth, (req,res)=> res.json(auth.approvalList()));
router.get('/audit', requireAuth, (req,res)=> res.json(auth.auditList(req.query.limit)));

// ── Admin-only ────────────────────────────────────────────
router.get('/users', requirePerm('users.admin'), (req,res)=> res.json(auth.listUsers()));
router.get('/secrets/status', requirePerm('config.admin'), (req,res)=> res.json(secrets.report()));

module.exports = router;
