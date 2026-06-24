'use strict';
/**
 * governance.js — Governance Engine.
 *
 * Enforces the required flow:
 *   Signal  ->  Pending Approval  ->  Human Approval  ->  execution ALLOWED (gate)
 *
 * CRITICAL: This engine NEVER places an order. "Approve" sets a gate flag
 * (execution_allowed=true). Whether anything is ever executed later is the
 * responsibility of a separate, future, human-gated component — NOT this one.
 * There is no broker client imported anywhere in this package.
 *
 * Stores (flat JSON, under ./store):
 *   pending_signals.json   incoming signals awaiting triage
 *   pending_orders.json    proposed orders awaiting human approval
 *   approval_history.json  immutable record of approve/reject decisions
 *   safety_audit_log.json  (via audit_log.js) every governance action
 */
const fs = require('fs');
const path = require('path');
const cfg = require('./gov_config');
const audit = require('./audit_log');

const DIR = path.join(__dirname, 'store');
const F = {
  signals: path.join(DIR, 'pending_signals.json'),
  orders: path.join(DIR, 'pending_orders.json'),
  history: path.join(DIR, 'approval_history.json')
};

function _load(file, key) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { [key]: [] }; }
}
function _save(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

// ── Mode / safety status (read-only) ──────────────────────
function status() {
  return {
    execution_mode: cfg.EXECUTION_MODE,
    auto_resume: cfg.AUTO_RESUME,
    valid_modes: cfg.VALID_MODES,
    live_endpoint_enabled: cfg.LIVE_ENDPOINT_ENABLED, // false
    execution_is_performed_here: cfg.EXECUTION_IS_PERFORMED_HERE, // false
    flow: cfg.FLOW
  };
}

// ── Pending signals ───────────────────────────────────────
function listSignals() { return _load(F.signals, 'pending_signals').pending_signals; }

// ── Pending orders (proposals awaiting approval) ──────────
function listOrders() { return _load(F.orders, 'pending_orders').pending_orders; }

// Promote a pending signal into a pending ORDER proposal (still nothing executes).
function promoteSignal(signalId) {
  const sData = _load(F.signals, 'pending_signals');
  const sig = sData.pending_signals.find(s => s.id === Number(signalId));
  if (!sig) return { ok: false, error: 'signal_not_found' };
  if (sig.status !== 'pending') return { ok: false, error: 'signal_not_pending' };

  const oData = _load(F.orders, 'pending_orders');
  const newId = oData.pending_orders.length
    ? Math.max(...oData.pending_orders.map(o => o.id)) + 1 : 201;
  const order = {
    id: newId,
    from_signal: sig.id,
    source: sig.source,
    symbol: sig.symbol,
    side: sig.direction === 'short' ? 'sell' : 'buy',
    qty: 1,
    type: 'market',
    status: 'pending_approval',
    execution_allowed: false,           // gate starts closed
    note: 'Proposal only. Approval opens a gate; it does not place an order.',
    created_at: new Date().toISOString()
  };
  oData.pending_orders.push(order);
  _save(F.orders, oData);

  sig.status = 'promoted';
  _save(F.signals, sData);

  audit.record('signal_promoted', `signal ${sig.id} -> order ${order.id}`, { signal: sig.id, order: order.id });
  return { ok: true, order, executed: false };
}

// ── Human approval (the gate) ─────────────────────────────
function decide(orderId, decision, actor) {
  if (!['approve', 'reject'].includes(decision)) {
    return { ok: false, error: 'invalid_decision', allowed: ['approve', 'reject'] };
  }
  const oData = _load(F.orders, 'pending_orders');
  const order = oData.pending_orders.find(o => o.id === Number(orderId));
  if (!order) return { ok: false, error: 'order_not_found' };

  if (decision === 'approve') {
    order.status = 'approved';
    order.execution_allowed = true;     // GATE OPENS — permission only, not execution
    order.note = 'Approved: execution is now PERMITTED but NOT performed by this package.';
  } else {
    order.status = 'rejected';
    order.execution_allowed = false;
    order.note = 'Rejected: execution remains blocked.';
  }
  order.decided_at = new Date().toISOString();
  order.decided_by = actor || 'human';
  _save(F.orders, oData);

  // Immutable history entry
  const hData = _load(F.history, 'approval_history');
  hData.approval_history.push({
    id: hData.approval_history.length ? hData.approval_history[hData.approval_history.length - 1].id + 1 : 1,
    order_id: order.id, symbol: order.symbol, side: order.side,
    decision, actor: actor || 'human',
    execution_allowed: order.execution_allowed,
    at: order.decided_at
  });
  _save(F.history, hData);

  audit.record('approval_decision', `order ${order.id} ${decision}`, {
    order: order.id, decision, execution_allowed: order.execution_allowed, executed: false
  });

  // Note the explicit executed:false — approval never executes.
  return { ok: true, order, executed: false };
}

// ── Approval history (read-only) ──────────────────────────
function listHistory() { return _load(F.history, 'approval_history').approval_history; }

// ── Safety audit log (read-only passthrough) ──────────────
function listAudit(limit) { return audit.list(limit); }

module.exports = {
  status, listSignals, listOrders, promoteSignal,
  decide, listHistory, listAudit
};
