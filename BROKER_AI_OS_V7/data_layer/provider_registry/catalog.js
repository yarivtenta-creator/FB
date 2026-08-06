'use strict';
/**
 * provider_registry/catalog.js — BROKER_AI_OS_V7 provider catalog.
 *
 * Every provider here is READ-ONLY market data / research. None of them is an
 * execution venue. Adding a key never enables order placement anywhere.
 *
 * Fields:
 *   envKeys     required env var names (ALL must be present to count as configured)
 *   envKeysAlt  alternate accepted names
 *   keyless     true = works with NO key at all
 *   freeTier    what you get without paying
 *   signup      direct link to create the key
 */

const PROVIDERS = [
  // ── BROKER / MARKET DATA ────────────────────────────────────────────────────
  {
    id:'alpaca', name:'Alpaca', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false,
    envKeys:['ALPACA_API_KEY','ALPACA_SECRET_KEY'],
    envKeysAlt:['ALPACA_API_KEY_ID','ALPACA_API_SECRET_KEY'],
    freeTier:'Unlimited paper account + IEX real-time data, free',
    links:{ website:'https://alpaca.markets',
            apiKeys:'https://app.alpaca.markets/paper/dashboard/overview',
            docs:'https://docs.alpaca.markets/docs/getting-started',
            setupGuide:'/docs/operator/CONNECT_ALPACA.md' }
  },

  // ── KEYLESS: work immediately, no signup ────────────────────────────────────
  {
    id:'sec_edgar', name:'SEC EDGAR', category:'filings', status:'keyless',
    enabled:true, health:'ok', keyless:true, envKeys:[],
    freeTier:'FREE, no key. 13F, Form 4 insider, 10-K/10-Q. 10 req/sec limit.',
    note:'Requires a User-Agent header with contact email (SEC policy).',
    links:{ website:'https://www.sec.gov/edgar', apiKeys:'',
            docs:'https://www.sec.gov/edgar/sec-api-documentation', setupGuide:'' }
  },
  {
    id:'treasury', name:'US Treasury FiscalData', category:'macro', status:'keyless',
    enabled:true, health:'ok', keyless:true, envKeys:[],
    freeTier:'FREE, no key. Yield curve, rates, debt, exchange rates.',
    links:{ website:'https://fiscaldata.treasury.gov', apiKeys:'',
            docs:'https://fiscaldata.treasury.gov/api-documentation/', setupGuide:'' }
  },
  {
    id:'coingecko', name:'CoinGecko', category:'crypto', status:'keyless',
    enabled:true, health:'ok', keyless:true,
    envKeys:[], envKeysAlt:['COINGECKO_API_KEY'],
    freeTier:'FREE, no key: 10-30 req/min. Optional key raises limits.',
    links:{ website:'https://www.coingecko.com', apiKeys:'https://www.coingecko.com/en/api/pricing',
            docs:'https://docs.coingecko.com/reference/introduction', setupGuide:'' }
  },
  {
    id:'binance_public', name:'Binance Public', category:'crypto', status:'keyless',
    enabled:true, health:'ok', keyless:true, envKeys:[],
    freeTier:'FREE, no key for public market data (klines, tickers, depth).',
    note:'Public read-only endpoints only. No account, no trading.',
    links:{ website:'https://www.binance.com', apiKeys:'',
            docs:'https://developers.binance.com/docs/binance-spot-api-docs', setupGuide:'' }
  },
  {
    id:'frankfurter', name:'Frankfurter FX', category:'forex', status:'keyless',
    enabled:true, health:'ok', keyless:true, envKeys:[],
    freeTier:'FREE, no key. ECB reference rates, historical FX.',
    links:{ website:'https://frankfurter.dev', apiKeys:'',
            docs:'https://frankfurter.dev/', setupGuide:'' }
  },

  // ── FREE KEY (sign up, no card) ─────────────────────────────────────────────
  {
    id:'fred', name:'FRED (St. Louis Fed)', category:'macro', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['FRED_API_KEY'],
    freeTier:'FREE key, unlimited. 800k+ economic series: CPI, GDP, rates.',
    links:{ website:'https://fred.stlouisfed.org',
            apiKeys:'https://fredaccount.stlouisfed.org/apikeys',
            docs:'https://fred.stlouisfed.org/docs/api/fred/', setupGuide:'' }
  },
  {
    id:'finnhub', name:'Finnhub', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['FINNHUB_API_KEY'],
    freeTier:'FREE key: 60 req/min. Quotes, fundamentals, earnings, news.',
    links:{ website:'https://finnhub.io', apiKeys:'https://finnhub.io/register',
            docs:'https://finnhub.io/docs/api', setupGuide:'' }
  },
  {
    id:'alphavantage', name:'Alpha Vantage', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['ALPHAVANTAGE_API_KEY'],
    freeTier:'FREE key: 25 req/day. Quotes, indicators, FX, crypto.',
    links:{ website:'https://www.alphavantage.co',
            apiKeys:'https://www.alphavantage.co/support/#api-key',
            docs:'https://www.alphavantage.co/documentation/', setupGuide:'' }
  },
  {
    id:'twelvedata', name:'Twelve Data', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['TWELVEDATA_API_KEY'],
    freeTier:'FREE key: 800 req/day. Stocks, forex, crypto, indicators.',
    links:{ website:'https://twelvedata.com', apiKeys:'https://twelvedata.com/pricing',
            docs:'https://twelvedata.com/docs', setupGuide:'' }
  },
  {
    id:'polygon', name:'Polygon.io', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['POLYGON_API_KEY'],
    freeTier:'FREE key: 5 req/min, end-of-day. Stocks, options, forex, crypto.',
    links:{ website:'https://polygon.io', apiKeys:'https://polygon.io/dashboard/signup',
            docs:'https://polygon.io/docs', setupGuide:'' }
  },
  {
    id:'tiingo', name:'Tiingo', category:'equities', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['TIINGO_API_KEY'],
    freeTier:'FREE key: 500 req/hr. EOD prices, news, crypto, fundamentals.',
    links:{ website:'https://www.tiingo.com', apiKeys:'https://www.tiingo.com/account/api/token',
            docs:'https://www.tiingo.com/documentation/general/overview', setupGuide:'' }
  },
  {
    id:'fmp', name:'Financial Modeling Prep', category:'fundamentals', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['FMP_API_KEY'],
    freeTier:'FREE key: 250 req/day. Financials, ratios, DCF, insider trades.',
    links:{ website:'https://site.financialmodelingprep.com',
            apiKeys:'https://site.financialmodelingprep.com/developer/docs',
            docs:'https://site.financialmodelingprep.com/developer/docs', setupGuide:'' }
  },
  {
    id:'news', name:'NewsAPI', category:'news', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['NEWS_API_KEY'],
    freeTier:'FREE key: 100 req/day, dev use only.',
    links:{ website:'https://newsapi.org', apiKeys:'https://newsapi.org/register',
            docs:'https://newsapi.org/docs', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' }
  },
  {
    id:'marketaux', name:'Marketaux', category:'news', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['MARKETAUX_API_KEY'],
    freeTier:'FREE key: 100 req/day. Financial news with sentiment + entities.',
    links:{ website:'https://www.marketaux.com', apiKeys:'https://www.marketaux.com/register',
            docs:'https://www.marketaux.com/documentation', setupGuide:'' }
  },
  {
    id:'coinmarketcap', name:'CoinMarketCap', category:'crypto', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['COINMARKETCAP_API_KEY'],
    freeTier:'FREE key: 10k credits/mo. Prices, market cap, rankings.',
    links:{ website:'https://coinmarketcap.com', apiKeys:'https://pro.coinmarketcap.com/signup',
            docs:'https://coinmarketcap.com/api/documentation/v1/', setupGuide:'' }
  },
  {
    id:'etherscan', name:'Etherscan', category:'onchain', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['ETHERSCAN_API_KEY'],
    freeTier:'FREE key: 5 req/sec. ETH txs, balances, contracts, whale moves.',
    links:{ website:'https://etherscan.io', apiKeys:'https://etherscan.io/register',
            docs:'https://docs.etherscan.io', setupGuide:'' }
  },

  // ── ALT SIGNAL (paid or limited free) ───────────────────────────────────────
  {
    id:'congress', name:'Congress Trades', category:'alt_signal', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['CONGRESS_API_KEY'],
    freeTier:'Quiver Quant — limited free tier, paid for full access.',
    links:{ website:'https://www.quiverquant.com', apiKeys:'https://www.quiverquant.com/auth/signup',
            docs:'https://api.quiverquant.com/docs', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' }
  },
  {
    id:'13f', name:'13F Filings', category:'alt_signal', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['THIRTEEN_F_API_KEY'],
    freeTier:'Also available FREE via SEC EDGAR (see sec_edgar).',
    links:{ website:'https://www.sec.gov/edgar', apiKeys:'',
            docs:'https://www.sec.gov/edgar/sec-api-documentation', setupGuide:'' }
  },
  {
    id:'insider', name:'Insider Trading', category:'alt_signal', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['INSIDER_API_KEY'],
    freeTier:'Also available FREE via SEC EDGAR Form 4 (see sec_edgar).',
    links:{ website:'https://www.sec.gov/edgar', apiKeys:'',
            docs:'https://www.sec.gov/edgar/sec-api-documentation', setupGuide:'' }
  },
  {
    id:'calendar', name:'Economic Calendar', category:'macro', status:'not_configured',
    enabled:false, health:'mock', keyless:false, envKeys:['ECON_CALENDAR_API_KEY'],
    freeTier:'Trading Economics — limited free tier.',
    links:{ website:'https://www.tradingeconomics.com', apiKeys:'https://developer.tradingeconomics.com',
            docs:'https://docs.tradingeconomics.com', setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' }
  },

  // ── DATA/STATUS ONLY — never an order path ──────────────────────────────────
  {
    id:'t4', name:'T4 / Plus500', category:'futures', status:'mock',
    enabled:false, health:'mock', keyless:false, envKeys:[],
    freeTier:'Mock only in this system.',
    note:'DATA/STATUS ONLY. No execution, no FIX. Never an order path.',
    links:{ website:'https://www.cqg.com/products/t4', apiKeys:'',
            docs:'https://www.cqg.com/partners/api-documentation',
            setupGuide:'/docs/operator/PROVIDER_SETUP_CENTER.md' }
  }
];

module.exports = { PROVIDERS };
