'use strict';
/** adapters/calendar — DATA-ONLY mock economic calendar. Future: CPI/PPI/NFP/FOMC/GDP/Retail. */
const S = require('../../schemas');
const PROVIDER = 'econ_calendar_mock';
const EVENTS = [
  { id:1, name:'CPI (YoY)', importance:'high', forecast:'3.1%', previous:'3.3%' },
  { id:2, name:'NFP', importance:'high', forecast:'180K', previous:'175K' },
  { id:3, name:'FOMC Rate Decision', importance:'high', forecast:'hold', previous:'hold' },
  { id:4, name:'Retail Sales', importance:'medium', forecast:'0.3%', previous:'0.2%' }
];
function status(){ return S.ProviderStatus({ name:'Economic Calendar (mock)', category:'macro', status:'mock', enabled:true, last_update:new Date().toISOString(), health:'ok' }); }
function getCalendar(){ return EVENTS.map(e=> S.EconomicEvent({ provider:PROVIDER, ...e })); }
module.exports = { PROVIDER, status, getCalendar };
