'use strict';
/**
 * tests/endpoints.js — boots the real app on an ephemeral port, authenticates with the
 * documented dev credentials, and hits every required endpoint. Prints real JSON.
 * No external network: only localhost to our own server. Run: node tests/endpoints.js
 */
const app = require('../server');

const CREDS = { username: 'admin', password: 'ChangeMe-Admin-2026' };
const REQUIRED = [
  ['GET', '/api/data/hub/health'],
  ['GET', '/api/data/providers'],
  ['GET', '/api/data/signals'],
  ['GET', '/api/data/signals/ranked'],
  ['GET', '/api/data/paper/stats'],
  ['GET', '/api/data/providers/alpaca/status'],
  ['POST','/api/data/providers/alpaca/test'],
  ['GET', '/api/data/paper/candidates'],
];

function short(obj){ const s = JSON.stringify(obj); return s.length > 600 ? s.slice(0,600) + '…' : s; }

(async () => {
  const server = app.listen(0);
  await new Promise(r => server.once('listening', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  let pass = 0, fail = 0;
  const log = (ok, msg) => { console.log((ok ? '  PASS  ' : '  FAIL  ') + msg); ok ? pass++ : fail++; };

  try {
    // 1) Unauthenticated access must be 401
    const un = await fetch(base + '/api/data/hub/health');
    log(un.status === 401, `401 without token on /api/data/hub/health (got ${un.status})`);
    console.log('        body: ' + short(await un.json()));

    // 2) Login
    const lr = await fetch(base + '/api/auth/login', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(CREDS) });
    const lj = await lr.json();
    log(lr.status === 200 && lj.ok && lj.token, `login as ${CREDS.username} (status ${lr.status}, ok=${lj.ok})`);
    const token = lj.token;
    const H = { 'x-auth-token': token, 'Content-Type':'application/json' };

    // 3) Required endpoints (authenticated)
    console.log('\n--- AUTHENTICATED ENDPOINT RESULTS ---');
    for (const [method, p] of REQUIRED){
      const r = await fetch(base + p, { method, headers: H });
      const body = await r.json();
      log(r.status === 200, `${method} ${p} → ${r.status}`);
      console.log('        ' + short(body));
    }

    // 4) Paper stats safety: paper:true present
    const ps = await (await fetch(base + '/api/data/paper/stats', { headers: H })).json();
    log(ps.paper === true, `paper/stats carries paper:true (got ${ps.paper})`);

    // 5) Provider test is read-only (mock → reachable:false)
    const pt = await (await fetch(base + '/api/data/providers/alpaca/test', { method:'POST', headers: H })).json();
    log(pt.mode === 'mock' && pt.reachable === false, `provider test read-only/mock (mode=${pt.mode}, reachable=${pt.reachable})`);

  } catch (e) {
    fail++; console.log('  FAIL  exception :: ' + e.message);
  } finally {
    server.close();
  }

  console.log('\n────────────────────────────────────────');
  console.log('ENDPOINT RESULT  pass=' + pass + '  fail=' + fail);
  if (fail){ process.exit(1); }
  console.log('ALL ENDPOINT TESTS PASSED');
})();
