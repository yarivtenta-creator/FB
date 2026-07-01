'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { processMessage } = require('./src/clientflow_os');

const AGENTS = ['sales_agent','support_agent','booking_agent','lead_scoring_agent','follow_up_agent','human_handoff_agent','ecommerce_order_agent','campaign_router_agent','inbox_triage_agent','safety_compliance_agent'];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  if (req.method === 'OPTIONS') { setCORS(res); res.writeHead(204); res.end(); return; }

  // API routes
  if (url.pathname === '/api/health') {
    return json(res, { status: 'ok', agents: AGENTS.length, version: '1.0.0' });
  }

  if (url.pathname === '/api/agents') {
    return json(res, { agents: AGENTS });
  }

  if (url.pathname === '/api/run' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body.agent || !AGENTS.includes(body.agent)) {
      return json(res, { error: 'Unknown agent: ' + body.agent }, 400);
    }
    try {
      const agent = require(path.join(__dirname, 'agents', body.agent, 'agent'));
      const result = agent.run(body.input || {});
      return json(res, { agent: body.agent, result });
    } catch(e) {
      return json(res, { error: e.message }, 500);
    }
  }

  if (url.pathname === '/api/pipeline' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const result = processMessage(body);
      return json(res, result);
    } catch(e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // Static files — serve dashboard/
  let filePath = url.pathname === '/' ? '/dashboard/index.html' : '/dashboard' + url.pathname;
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
