'use strict';
/**
 * paper_bridge — GOVERNANCE → PAPER bridge.
 *
 * Turns an APPROVED governance order (execution_allowed:true) into a PAPER candidate,
 * and lets the operator SIMULATE it into a paper trade priced from the Data Hub.
 *
 * HARD SAFETY:
 *  - There is NO broker client here. No placeOrder/submitOrder/cancel/close/replace/transfer/execute.
 *  - Every object returned carries paper:true and executed:false.
 *  - "simulate" opens a LOCAL paper trade only (paper_trading). It never reaches a market.
 *  - Approval (in governance) opens a permission GATE; this bridge only ever simulates.
 */
const gov = require('../../governance/governance');
const paper = require('../paper_trading');
const hub = require('../data_hub_v2');

// Project approved governance orders into paper candidates (no execution).
function candidatesFromGovernance(){
  let orders = [];
  try { orders = gov.listOrders() || []; } catch { orders = []; }
  return orders
    .filter(o => o && o.execution_allowed === true && o.status === 'approved')
    .map(o => ({
      id: o.id,
      from_order: o.id,
      from_signal: o.from_signal,
      symbol: o.symbol,
      side: o.side === 'sell' ? 'short' : 'long',
      qty: o.qty || 1,
      status: 'candidate',
      paper: true,        // hard invariant
      executed: false,    // hard invariant — bridge NEVER executes
      note: 'Paper candidate derived from an approved governance gate. No order placed.'
    }));
}

// Simulate a candidate into a local paper trade (priced from the hub). Paper only.
function simulate(orderId){
  const cand = candidatesFromGovernance().find(c => c.id === Number(orderId));
  if (!cand) return { ok:false, error:'no_approved_candidate_for_order', id:Number(orderId), executed:false };
  const r = paper.openTrade({ symbol:cand.symbol, side:cand.side, qty:cand.qty });
  if (!r.ok) return { ok:false, error:r.error, from_order:cand.id, paper:true, executed:false };
  return {
    ok:true,
    from_order: cand.id,
    trade: r.trade,           // already flagged paper:true, mock:true by paper_trading
    paper: true,
    executed: false,
    note: 'PAPER simulation only — opened a local paper trade. No real order, no broker, no execution.'
  };
}

function stats(){
  const ps = paper.stats(); // includes paper:true
  const candidates = candidatesFromGovernance();
  return {
    ...ps,
    candidates: candidates.length,
    paper: true,
    executed: false,
    note: 'Aggregated paper-trade stats + count of approved-but-unexecuted paper candidates.'
  };
}

// Expose the hub price source used, for transparency (read-only).
function priceSource(symbol){ const q = hub.getQuotes().find(x=>x.symbol===symbol); return q ? q.price : null; }

module.exports = { candidatesFromGovernance, simulate, stats, priceSource };
