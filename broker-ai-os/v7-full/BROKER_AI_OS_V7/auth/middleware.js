'use strict';
/**
 * middleware.js — Express guards for RBAC.
 * Token comes from header 'x-auth-token' or cookie. requireRole / requirePerm
 * gate routes. Admin-only areas use requirePerm('config.admin') etc.
 */
const auth = require('./auth');
const roles = require('./roles');

function getToken(req){
  return req.headers['x-auth-token'] ||
         (req.headers.cookie && /(?:^|;\s*)auth=([^;]+)/.exec(req.headers.cookie)?.[1]) ||
         null;
}

function requireAuth(req, res, next){
  const s = auth.sessionOf(getToken(req));
  if (!s) return res.status(401).json({ error:'unauthorized' });
  req.user = s;
  next();
}

function requirePerm(permission){
  return (req, res, next) => {
    const s = auth.sessionOf(getToken(req));
    if (!s) return res.status(401).json({ error:'unauthorized' });
    if (!roles.can(s.role, permission)){
      auth.audit(s.username, 'access_denied', 'auth', permission);
      return res.status(403).json({ error:'forbidden', need: permission });
    }
    req.user = s;
    next();
  };
}

function requireRole(role){
  return (req, res, next) => {
    const s = auth.sessionOf(getToken(req));
    if (!s) return res.status(401).json({ error:'unauthorized' });
    if (s.role !== role){
      auth.audit(s.username, 'access_denied', 'auth', `role:${role}`);
      return res.status(403).json({ error:'forbidden', need_role: role });
    }
    req.user = s;
    next();
  };
}

module.exports = { getToken, requireAuth, requirePerm, requireRole };
