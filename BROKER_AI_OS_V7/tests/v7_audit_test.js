'use strict';
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: 'localhost', port: 6060, path }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
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

    if (!process.env.ALPACA_API_KEY) {
      const alpTest = await get('/api/alpaca/test');
      assert('GET /api/alpaca/test without keys returns 503', alpTest.status === 503, `got ${alpTest.status}`);
      assert('GET /api/alpaca/test returns KEYS_REQUIRED', alpTest.body && alpTest.body.code === 'KEYS_REQUIRED', JSON.stringify(alpTest.body));
    } else {
      console.log('SKIP: KEYS_REQUIRED test (keys are set)');
    }

    const orders = await get('/api/alpaca/orders');
    assert('No order endpoint exposed (should be 404)', orders.status === 404, `got ${orders.status}`);

  } catch (e) {
    console.error('TEST ERROR:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
