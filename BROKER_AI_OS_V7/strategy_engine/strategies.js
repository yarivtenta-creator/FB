'use strict';
/**
 * strategy_engine/strategies.js — BROKER_AI_OS_V7 strategy catalog.
 *
 * 12 strategy profiles. Each defines HOW signals are filtered and sized.
 * SCORING + PAPER SIMULATION ONLY. No broker client, no orders, no execution.
 *
 * Fields:
 *   threshold   minimum signal score to act on (higher = more selective)
 *   maxOpen     max simultaneous open paper positions
 *   allowSides  which directions the strategy will take
 *   riskPct     % of account equity risked per position (paper sizing)
 *   maxHoldDays target holding period (informational)
 *   sources     preferred signal providers ([] = any)
 */

const STRATEGIES = {
  conservative: {
    label: 'Conservative', tier: 'low-risk',
    threshold: 0.72, maxOpen: 2, allowSides: ['long'], riskPct: 1.0, maxHoldDays: 60,
    sources: ['13f_mock'],
    note: 'Highest-confidence long-only. Institutional (13F) signals. Very few positions.'
  },
  balanced: {
    label: 'Balanced', tier: 'medium-risk',
    threshold: 0.62, maxOpen: 4, allowSides: ['long','short'], riskPct: 2.0, maxHoldDays: 30,
    sources: [],
    note: 'Medium-confidence both directions. Moderate position count.'
  },
  aggressive: {
    label: 'Aggressive', tier: 'high-risk',
    threshold: 0.50, maxOpen: 8, allowSides: ['long','short','neutral'], riskPct: 3.0, maxHoldDays: 14,
    sources: [],
    note: 'Takes weaker signals too. Both directions. Many positions.'
  },
  momentum: {
    label: 'Momentum', tier: 'medium-risk',
    threshold: 0.65, maxOpen: 5, allowSides: ['long'], riskPct: 2.0, maxHoldDays: 21,
    sources: [],
    note: 'Rides trend-aligned signals. Long-only, cuts fast.'
  },
  mean_reversion: {
    label: 'Mean Reversion', tier: 'medium-risk',
    threshold: 0.58, maxOpen: 5, allowSides: ['long','short'], riskPct: 1.5, maxHoldDays: 10,
    sources: [],
    note: 'Fades extremes. Counter-trend, short holding period.'
  },
  insider_follow: {
    label: 'Insider Follow', tier: 'medium-risk',
    threshold: 0.55, maxOpen: 6, allowSides: ['long','short'], riskPct: 2.0, maxHoldDays: 45,
    sources: ['insider_mock'],
    note: 'Follows corporate insider buying/selling signals only.'
  },
  congress_follow: {
    label: 'Congress Follow', tier: 'medium-risk',
    threshold: 0.55, maxOpen: 6, allowSides: ['long','short'], riskPct: 2.0, maxHoldDays: 45,
    sources: ['congress_mock'],
    note: 'Mirrors disclosed congressional trades.'
  },
  institutional_13f: {
    label: 'Institutional 13F', tier: 'low-risk',
    threshold: 0.60, maxOpen: 8, allowSides: ['long'], riskPct: 1.5, maxHoldDays: 90,
    sources: ['13f_mock'],
    note: 'Tracks 13F institutional accumulation. Long-only, long hold.'
  },
  high_conviction: {
    label: 'High Conviction', tier: 'low-risk',
    threshold: 0.75, maxOpen: 3, allowSides: ['long','short'], riskPct: 4.0, maxHoldDays: 60,
    sources: [],
    note: 'Only the very best signals, but sized much larger.'
  },
  diversified: {
    label: 'Diversified', tier: 'low-risk',
    threshold: 0.52, maxOpen: 15, allowSides: ['long','short','neutral'], riskPct: 0.75, maxHoldDays: 30,
    sources: [],
    note: 'Many small positions. Spreads risk widely.'
  },
  swing: {
    label: 'Swing', tier: 'medium-risk',
    threshold: 0.63, maxOpen: 6, allowSides: ['long','short'], riskPct: 2.5, maxHoldDays: 7,
    sources: [],
    note: 'Short-term swings. Fast in, fast out.'
  },
  contrarian: {
    label: 'Contrarian', tier: 'high-risk',
    threshold: 0.55, maxOpen: 5, allowSides: ['short','neutral'], riskPct: 2.0, maxHoldDays: 20,
    sources: [],
    note: 'Leans against consensus. Short/neutral bias.'
  }
};

const NAMES = Object.keys(STRATEGIES);

function get(name){
  const k = String(name || '').trim().toLowerCase();
  return STRATEGIES[k] || null;
}

function list(){
  return NAMES.map(n => ({ id: n, ...STRATEGIES[n] }));
}

module.exports = { STRATEGIES, NAMES, get, list };
