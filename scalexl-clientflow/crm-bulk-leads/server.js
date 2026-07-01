'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { processMessage } = require('./src/clientflow_os');
const crm     = require('./ScaleXL_ClientFlow_Agent_Pack/src/mock_crm');
const clients = require('./ScaleXL_ClientFlow_Agent_Pack/src/mock_clients');
const intake  = require('./ScaleXL_ClientFlow_Agent_Pack/src/mock_intake');

const AGENTS = ['sales_agent','support_agent','booking_agent','lead_scoring_agent','follow_up_agent','human_handoff_agent','ecommerce_order_agent','campaign_router_agent','inbox_triage_agent','safety_compliance_agent'];
const MIME   = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, data, status) {
  setCORS(res);
  res.writeHead(status || 200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch(e) { resolve({}); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p   = url.pathname;

  if (req.method === 'OPTIONS') { setCORS(res); res.writeHead(204); res.end(); return; }

  // ── Health / Agents ──────────────────────────────────────────────────────────
  if (p === '/api/health') {
    return json(res, { status: 'ok', agents: AGENTS.length, version: '2.0.0' });
  }
  if (p === '/api/agents') {
    return json(res, { agents: AGENTS });
  }

  // ── Single agent run ─────────────────────────────────────────────────────────
  if (p === '/api/run' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.agent || !AGENTS.includes(body.agent)) {
      return json(res, { error: 'Unknown agent: ' + body.agent }, 400);
    }
    try {
      const agent = require(path.join(__dirname, 'agents', body.agent, 'agent'));
      return json(res, { agent: body.agent, result: agent.run(body.input || {}) });
    } catch(e) { return json(res, { error: e.message }, 500); }
  }

  // ── Pipeline ─────────────────────────────────────────────────────────────────
  if (p === '/api/pipeline' && req.method === 'POST') {
    const body = await readBody(req);
    try { return json(res, processMessage(body)); }
    catch(e) { return json(res, { error: e.message }, 500); }
  }

  // ── Clients ──────────────────────────────────────────────────────────────────
  if (p === '/api/clients' && req.method === 'GET') {
    return json(res, { clients: clients.getAllClients() });
  }
  if (p === '/api/clients' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.name) return json(res, { error: 'name is required' }, 400);
    const client = clients.createClient(body.name);
    return json(res, { client }, 201);
  }

  // ── Intake upload ─────────────────────────────────────────────────────────────
  // POST /api/intake  { client_name?, client_id?, data:{} }
  // Creates client if client_id not given, then creates intake record and links it.
  if (p === '/api/intake' && req.method === 'POST') {
    const body = await readBody(req);
    let client;
    if (body.client_id) {
      client = clients.getClientById(body.client_id);
      if (!client) return json(res, { error: 'Client not found' }, 404);
    } else {
      if (!body.client_name) return json(res, { error: 'client_name or client_id required' }, 400);
      client = clients.createClient(body.client_name);
    }
    const rec = intake.createIntake(client.id, body.data || {});
    clients.linkIntake(client.id, rec.id);
    return json(res, { client, intake: rec }, 201);
  }

  // ── Leads ─────────────────────────────────────────────────────────────────────
  if (p === '/api/leads' && req.method === 'GET') {
    return json(res, { leads: crm.getAllLeads() });
  }

  // POST /api/leads/import  { client_id, leads:[{name,email,...}] }
  // Imports multiple leads and attaches them all to the given client.
  if (p === '/api/leads/import' && req.method === 'POST') {
    const body = await readBody(req);
    const { client_id, leads: rows } = body;
    if (!client_id) return json(res, { error: 'client_id is required' }, 400);
    if (!clients.getClientById(client_id)) return json(res, { error: 'Client not found' }, 404);
    if (!Array.isArray(rows) || rows.length === 0) return json(res, { error: 'leads array is required' }, 400);
    const imported = rows.map(row => crm.addLead(Object.assign({}, row, { client_id })));
    return json(res, { imported: imported.length, leads: imported }, 201);
  }

  // POST /api/leads/delete-all — removes every lead in the store
  if (p === '/api/leads/delete-all' && req.method === 'POST') {
    const count = crm.deleteAllLeads();
    return json(res, { deleted: count });
  }

  // POST /api/leads/advance-all — moves every "intake" lead to "qualified"
  if (p === '/api/leads/advance-all' && req.method === 'POST') {
    const advanced = crm.advanceAllIntakeLeads();
    return json(res, { advanced });
  }

  // ── Static dashboard ──────────────────────────────────────────────────────────
  let filePath = p === '/' ? '/dashboard/index.html' : '/dashboard' + p;
  filePath = path.join(__dirname, filePath);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    setCORS(res);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    json(res, { error: 'Not found' }, 404);
  }
});

const PORT = 2222;
server.listen(PORT, () => console.log('ScaleXL ClientFlow OS running at http://localhost:' + PORT));
