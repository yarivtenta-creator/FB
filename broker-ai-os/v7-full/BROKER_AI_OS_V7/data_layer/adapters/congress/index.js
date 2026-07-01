'use strict';
/** adapters/congress — DATA-ONLY mock congressional trade disclosures → Signal schema. */
const S = require('../../schemas');
const PROVIDER = 'congress_mock';
const TRADES = [
  { id:'c1', symbol:'NVDA', direction:'long', confidence:0.6, rationale:'Disclosed purchase (mock)' },
  { id:'c2', symbol:'XOM', direction:'long', confidence:0.5, rationale:'Disclosed purchase (mock)' }
];
function status(){ return S.ProviderStatus({ name:'Congress Trades (mock)', category:'alt_signal', status:'mock', enabled:true, last_update:new Date().toISOString(), health:'ok' }); }
function getSignals(){ return TRADES.map(t=> S.Signal({ provider:PROVIDER, ...t })); }
module.exports = { PROVIDER, status, getSignals };
