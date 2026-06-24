'use strict';
/**
 * auth.js — Auth core for Broker AI OS v2.
 * Local-only authentication (no OAuth, no external IdP). Sessions are in-memory
 * tokens with timeout + optional remember-me. Provides identity-stamped helpers
 * for approvals and audit so the system records WHO did WHAT WHEN.
 *
 * SAFETY: no trading, no broker, no execution. Approval here only records the
 * decision + identity; it does not place orders.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { verify } = require('./hashing');
const roles = require('./roles');

const USERS_FILE = path.join(__dirname, 'store', 'users.json');
const APPROVALS_FILE = path.join(__dirname, 'store', 'approval_identity.json');
const AUDIT_FILE = path.join(__dirname, 'store', 'auth_audit.json');

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;        // 30 min idle
const REMEMBER_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sessions = new Map(); // token -> { username, role, expires, remember }

function _load(file, key){ try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return { [key]: [] }; } }
function _save(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

function _users(){ return _load(USERS_FILE, 'users').users; }

// ── Audit (identity-stamped) ──────────────────────────────
function audit(user, action, component, detail){
  const d = _load(AUDIT_FILE, 'events');
  d.events.push({
    id: d.events.length ? d.events[d.events.length-1].id + 1 : 1,
    user: user || 'anonymous', action, component: component || 'auth',
    detail: detail || '', time: new Date().toISOString()
  });
  _save(AUDIT_FILE, d);
}
function auditList(limit){ const e = _load(AUDIT_FILE,'events').events; return limit ? e.slice(-Number(limit)) : e; }

// ── Login / logout / sessions ─────────────────────────────
function login(username, password, remember){
  const u = _users().find(x => x.username === username && x.active !== false);
  if (!u || !verify(password, u.password_hash)) {
    audit(username, 'login_failed', 'auth', 'bad credentials');
    return { ok:false, error:'invalid_credentials' };
  }
  const token = crypto.randomBytes(24).toString('hex');
  const ttl = remember ? REMEMBER_TIMEOUT_MS : SESSION_TIMEOUT_MS;
  sessions.set(token, { username: u.username, role: u.role, expires: Date.now()+ttl, remember: !!remember });
  audit(u.username, 'login', 'auth', remember ? 'remember-me' : 'session');
  return { ok:true, token, username:u.username, role:u.role, expires_in_ms: ttl };
}

function logout(token){
  const s = sessions.get(token);
  if (s) audit(s.username, 'logout', 'auth', '');
  sessions.delete(token);
  return { ok:true };
}

function sessionOf(token){
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expires){ sessions.delete(token); return null; }
  // sliding timeout: refresh on activity
  s.expires = Date.now() + (s.remember ? REMEMBER_TIMEOUT_MS : SESSION_TIMEOUT_MS);
  return { username: s.username, role: s.role };
}

function whoami(token){
  const s = sessionOf(token);
  if (!s) return { ok:false, error:'no_session' };
  return { ok:true, username:s.username, role:s.role, permissions: roles.permissionsFor(s.role) };
}

// ── Approval identity ─────────────────────────────────────
// Records WHO approved/rejected. Does NOT execute anything.
function recordApproval(token, signalId, decision){
  const s = sessionOf(token);
  if (!s) return { ok:false, error:'no_session' };
  if (!roles.can(s.role, 'approvals.decide')) return { ok:false, error:'forbidden' };
  if (!['approve','reject'].includes(decision)) return { ok:false, error:'invalid_decision' };
  const d = _load(APPROVALS_FILE, 'approvals');
  const entry = {
    id: d.approvals.length ? d.approvals[d.approvals.length-1].id + 1 : 1,
    username: s.username, role: s.role, signal_id: Number(signalId),
    decision, time: new Date().toISOString(), executed: false
  };
  d.approvals.push(entry);
  _save(APPROVALS_FILE, d);
  audit(s.username, `approval_${decision}`, 'governance', `signal #${signalId}`);
  // executed:false — identity layer never places an order.
  return { ok:true, record: entry,
    summary: `${roles.ROLES[s.role].label} ${decision==='approve'?'Approved':'Rejected'} Signal #${signalId} ${entry.time}` };
}
function approvalList(){ return _load(APPROVALS_FILE,'approvals').approvals; }

// ── User listing (no secrets exposed) ─────────────────────
function listUsers(){
  return _users().map(u => ({ username:u.username, role:u.role, active:u.active!==false, password_status: u.password_hash ? 'Configured' : 'Missing' }));
}

module.exports = {
  login, logout, sessionOf, whoami,
  recordApproval, approvalList,
  audit, auditList, listUsers,
  SESSION_TIMEOUT_MS, REMEMBER_TIMEOUT_MS
};
