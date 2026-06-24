'use strict';
/** adapters/13f — DATA-ONLY mock 13F institutional filings → Signal schema. */
const S = require('../../schemas');
const PROVIDER = '13f_mock';
const FILINGS = [
  { id:'f1', symbol:'GOOGL', direction:'long', confidence:0.65, rationale:'Increased institutional position (mock)' },
  { id:'f2', symbol:'TSLA', direction:'neutral', confidence:0.4, rationale:'Position unchanged (mock)' }
];
function status(){ return S.ProviderStatus({ name:'13F Filings (mock)', category:'alt_signal', status:'mock', enabled:true, last_update:new Date().toISOString(), health:'ok' }); }
function getSignals(){ return FILINGS.map(t=> S.Signal({ provider:PROVIDER, ...t })); }
module.exports = { PROVIDER, status, getSignals };
