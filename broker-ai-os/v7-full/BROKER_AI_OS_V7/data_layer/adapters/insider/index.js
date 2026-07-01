'use strict';
/** adapters/insider — DATA-ONLY mock insider transactions → Signal schema. */
const S = require('../../schemas');
const PROVIDER = 'insider_mock';
const TX = [
  { id:'i1', symbol:'AAPL', direction:'short', confidence:0.45, rationale:'Insider sale (mock)' },
  { id:'i2', symbol:'MSFT', direction:'long', confidence:0.55, rationale:'Insider buy (mock)' }
];
function status(){ return S.ProviderStatus({ name:'Insider Trading (mock)', category:'alt_signal', status:'mock', enabled:true, last_update:new Date().toISOString(), health:'ok' }); }
function getSignals(){ return TX.map(t=> S.Signal({ provider:PROVIDER, ...t })); }
module.exports = { PROVIDER, status, getSignals };
