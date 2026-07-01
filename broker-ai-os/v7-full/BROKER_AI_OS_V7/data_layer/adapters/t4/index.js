'use strict';
/**
 * adapters/t4 — DATA-ONLY mock futures adapter.
 * Future (read-only): ES NQ YM RTY CL GC SI ZN quotes. NEVER order routing/FIX/credentials.
 */
const S = require('../../schemas');
const PROVIDER = 't4';
const FUTURES = { ES:5300, NQ:18500, YM:39000, RTY:2100, CL:78.5, GC:2350, SI:30.2, ZN:110.5 };

function status() {
  return S.ProviderStatus({ name:'T4 / Plus500 (futures data)', category:'futures', status:'mock',
    enabled:false, last_update:new Date().toISOString(), health:'mock' });
}
function getQuotes() {
  return Object.keys(FUTURES).map(sym=> S.Quote({ provider:PROVIDER, symbol:sym, price:FUTURES[sym] }));
}
module.exports = { PROVIDER, status, getQuotes, symbols:Object.keys(FUTURES) };
