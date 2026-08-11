'use strict';
const http = require('http');

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = token ? { 'x-auth-token': token } : {};
    const req = http.get({ host: 'localhost', port: 6060, path, headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy(new Error('timeout')));
  });
}

function postJson(path, payload, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload || {});
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['x-auth-token'] = token;
    const req = http.request({ host: 'localhost', port: 6060, path, method: 'POST', headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  let passed = 0, failed = 0;
  function assert(name, condition, detail) {
    if (condition) { console.log('PASS:', name); passed++; }
    else { console.log('FAIL:', name, detail || ''); failed++; }
  }

  try {
    const health = await get('/health');
    assert('GET /health returns 200', health.status === 200, `got ${health.status}`);
    assert('GET /health returns ok', health.body && health.body.status === 'ok', JSON.stringify(health.body));

    const apiHealth = await get('/api/health');
    assert('GET /api/health returns 200', apiHealth.status === 200, `got ${apiHealth.status}`);

    const alpStatus = await get('/api/alpaca/status');
    assert('GET /api/alpaca/status returns 200', alpStatus.status === 200, `got ${alpStatus.status}`);
    assert('GET /api/alpaca/status returns system name', alpStatus.body && alpStatus.body.system === 'BROKER_AI_OS_V7', JSON.stringify(alpStatus.body));
    assert('GET /api/alpaca/status shows read_only=true', alpStatus.body && alpStatus.body.read_only === true, JSON.stringify(alpStatus.body));

    // Ask the SERVER whether it has keys (not this test process's env).
    const serverHasKeys = !!(alpStatus.body && alpStatus.body.configured);
    const alpTest = await get('/api/alpaca/test');
    if (!serverHasKeys) {
      assert('GET /api/alpaca/test without keys returns 503', alpTest.status === 503, `got ${alpTest.status}`);
      assert('GET /api/alpaca/test reports MOCK_NO_KEYS', alpTest.body && alpTest.body.alpaca_state === 'MOCK_NO_KEYS', JSON.stringify(alpTest.body));
      assert('MOCK_NO_KEYS performs no network call', alpTest.body && alpTest.body.network_call_performed === false, JSON.stringify(alpTest.body));
    } else {
      const st = alpTest.body && alpTest.body.alpaca_state;
      assert('With keys, state is REAL_* (never mock)',
        st === 'REAL_READ_ONLY_CONNECTED' || st === 'REAL_READ_ONLY_FAILED', `got ${st}`);
      assert('With keys, a real network call was performed',
        alpTest.body && alpTest.body.network_call_performed === true, JSON.stringify(alpTest.body && alpTest.body.network_call_performed));
      assert('With keys, API key is masked in response',
        !!(alpTest.body && alpTest.body.masked_key && alpTest.body.masked_key.includes('*')), JSON.stringify(alpTest.body && alpTest.body.masked_key));
    }

    // Strategy engine — catalog must expose many strategies, all paper-only.
    const login = await postJson('/api/auth/login', { username:'admin', password:'ChangeMe-Admin-2026' });
    const token = login.body && login.body.token;
    assert('Login as admin succeeds', !!token, JSON.stringify(login.body));
    if (token) {
      const strat = await get('/api/strategy/strategies', token);
      assert('Strategy catalog returns 200', strat.status === 200, `got ${strat.status}`);
      assert('Strategy catalog has 10+ strategies', strat.body && strat.body.count >= 10, `count=${strat.body && strat.body.count}`);

      const stat = await get('/api/strategy/status', token);
      assert('Strategy status returns 200', stat.status === 200, `got ${stat.status}`);
      assert('Strategy engine has 10+ slots', stat.body && stat.body.slots_total >= 10, `slots=${stat.body && stat.body.slots_total}`);

      const tr = await get('/api/strategy/trades', token);
      assert('Trades endpoint returns 200', tr.status === 200, `got ${tr.status}`);
      const bad = (tr.body && tr.body.trades || []).filter(t => t.paper !== true);
      assert('Every trade is paper:true', bad.length === 0, `${bad.length} violations`);
      // executed:true is only legal when Option B execution is armed.
      const ghost = (tr.body && tr.body.trades || [])
        .filter(t => t.executed === true && tr.body.execution_armed !== true);
      assert('No trade claims executed while execution is disarmed', ghost.length === 0, `${ghost.length} violations`);
    }

    const orders = await get('/api/alpaca/orders');
    assert('Read-only Alpaca router exposes no order endpoint (404)', orders.status === 404, `got ${orders.status}`);

    // ── Option B execution guards ────────────────────────────────────────────
    const ex = await get('/api/alpaca-exec/status');
    assert('Execution status returns 200', ex.status === 200, `got ${ex.status}`);
    assert('Execution never reports live trading',
      ex.body && ex.body.live_trading === false && ex.body.paper_only === true,
      JSON.stringify(ex.body && { live: ex.body.live_trading, paper: ex.body.paper_only }));

    const guards = (ex.body && ex.body.guards) || [];
    const ids = guards.map(g => g.id).sort().join(',');
    assert('All five execution guards are present',
      ids === 'KEYS_PRESENT,OPT_IN,PAPER_ACCOUNT,PAPER_HOST,PAPER_KEY', ids);

    // The unbypassable guards, proven directly against the module.
    const exec = require('../connectors/alpaca/alpaca_execution');
    const saved = {
      e: process.env.ALPACA_EXECUTE, k: process.env.ALPACA_API_KEY,
      s: process.env.ALPACA_SECRET_KEY, b: process.env.ALPACA_BASE_URL
    };
    const set = (e, k, b) => {
      process.env.ALPACA_EXECUTE = e; process.env.ALPACA_API_KEY = k;
      process.env.ALPACA_SECRET_KEY = 'secret_placeholder'; process.env.ALPACA_BASE_URL = b;
    };
    const blockedBy = () => exec.guardStatic().blocked_by;

    set('true', 'AKLIVEKEY0000', 'https://paper-api.alpaca.markets');
    assert('A LIVE (AK) key is refused even with opt-in',
      blockedBy().includes('PAPER_KEY'), blockedBy().join(','));

    set('true', 'PKPAPERKEY000', 'https://api.alpaca.markets');
    assert('The LIVE host is refused even with a paper key',
      blockedBy().includes('PAPER_HOST'), blockedBy().join(','));

    set('false', 'PKPAPERKEY000', 'https://paper-api.alpaca.markets');
    assert('Without ALPACA_EXECUTE=true nothing is sent',
      blockedBy().includes('OPT_IN'), blockedBy().join(','));

    set('true', 'AKLIVEKEY0000', 'https://api.alpaca.markets');
    const blockedOrder = await exec.submitOrder({ symbol: 'AAPL', side: 'buy', qty: 1 });
    assert('submitOrder against a live key+host is blocked, not sent',
      blockedOrder.ok === false && blockedOrder.blocked === true, JSON.stringify(blockedOrder));

    process.env.ALPACA_EXECUTE = saved.e === undefined ? '' : saved.e;
    if (saved.k !== undefined) process.env.ALPACA_API_KEY = saved.k;
    if (saved.s !== undefined) process.env.ALPACA_SECRET_KEY = saved.s;
    if (saved.b !== undefined) process.env.ALPACA_BASE_URL = saved.b;

    // ── AI-Trader connector ──────────────────────────────────────────────────
    const at = await get('/api/ai-trader/status');
    assert('AI-Trader status returns 200', at.status === 200, `got ${at.status}`);
    assert('AI-Trader connector never places orders and never publishes trades',
      at.body && at.body.places_orders === false && at.body.publishes_your_trades === false,
      JSON.stringify(at.body));

  } catch (e) {
    console.error('TEST ERROR:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
