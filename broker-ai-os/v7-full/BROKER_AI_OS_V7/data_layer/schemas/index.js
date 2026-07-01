'use strict';
/**
 * schemas/index.js — Unified data schemas (the normalization contract).
 * Every adapter MUST normalize its output into these shapes via normalizeData().
 * Pure shape definitions + validators. No I/O, no network, no secrets.
 */

// All records carry mock:true in this phase and a source provider id.
const SCHEMA_VERSION = '1.0.0';

// ---- Shape factories (return normalized objects) ----
function Quote({ provider, symbol, price, currency = 'USD', ts }) {
  return { kind: 'quote', provider, symbol, price: Number(price), currency, ts: ts || iso(), mock: true };
}
function NewsItem({ provider, id, headline, url = null, symbols = [], sentiment = null, ts }) {
  return { kind: 'news', provider, id: String(id), headline, url, symbols, sentiment, ts: ts || iso(), mock: true };
}
function Signal({ provider, id, symbol, direction, confidence = null, rationale = '', ts }) {
  return { kind: 'signal', provider, id: String(id), symbol, direction, confidence, rationale, ts: ts || iso(), mock: true };
}
function EconomicEvent({ provider, id, name, importance = 'medium', forecast = null, previous = null, ts }) {
  return { kind: 'econ_event', provider, id: String(id), name, importance, forecast, previous, ts: ts || iso(), mock: true };
}
function Position({ provider, symbol, qty, avg_price, market_value = null }) {
  // PAPER positions only. Never represents a real brokerage position.
  return { kind: 'position', provider, symbol, qty: Number(qty), avg_price: Number(avg_price), market_value, paper: true, mock: true };
}
function ProviderStatus({ name, category, status = 'mock', enabled = false, last_update = null, health = 'unknown' }) {
  return { kind: 'provider_status', name, category, status, enabled, last_update, health };
}

function iso() { return new Date().toISOString(); }

// ---- Validators (lightweight; throw on contract violation) ----
const DIRECTIONS = ['long', 'short', 'neutral'];
function validate(rec) {
  if (!rec || !rec.kind) return { ok: false, error: 'missing kind' };
  switch (rec.kind) {
    case 'quote': return need(rec, ['provider', 'symbol', 'price']);
    case 'news': return need(rec, ['provider', 'id', 'headline']);
    case 'signal':
      if (rec.direction && !DIRECTIONS.includes(rec.direction)) return { ok: false, error: 'bad direction' };
      return need(rec, ['provider', 'id', 'symbol']);
    case 'econ_event': return need(rec, ['provider', 'id', 'name']);
    case 'position': return need(rec, ['provider', 'symbol', 'qty', 'avg_price']);
    case 'provider_status': return need(rec, ['name', 'category']);
    default: return { ok: false, error: 'unknown kind ' + rec.kind };
  }
}
function need(rec, fields) {
  for (const f of fields) if (rec[f] === undefined || rec[f] === null || rec[f] === '') return { ok: false, error: 'missing ' + f };
  return { ok: true };
}

module.exports = {
  SCHEMA_VERSION, Quote, NewsItem, Signal, EconomicEvent, Position, ProviderStatus,
  validate, DIRECTIONS
};
