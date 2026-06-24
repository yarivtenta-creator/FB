'use strict';
/** adapters/news — DATA-ONLY mock. Future: NewsAPI/Finnhub/Polygon. Unified NewsItem schema. */
const S = require('../../schemas');
const PROVIDER = 'news_mock';
const FEED = [
  { id:1, headline:'Markets steady ahead of inflation data', symbols:['SPY'], sentiment:'neutral' },
  { id:2, headline:'Tech leads modest gains', symbols:['NVDA','MSFT'], sentiment:'positive' },
  { id:3, headline:'Energy slips on supply outlook', symbols:['CL'], sentiment:'negative' }
];
function status(){ return S.ProviderStatus({ name:'News (mock)', category:'news', status:'mock', enabled:true, last_update:new Date().toISOString(), health:'ok' }); }
function getNews(){ return FEED.map(n=> S.NewsItem({ provider:PROVIDER, ...n })); }
module.exports = { PROVIDER, status, getNews };
