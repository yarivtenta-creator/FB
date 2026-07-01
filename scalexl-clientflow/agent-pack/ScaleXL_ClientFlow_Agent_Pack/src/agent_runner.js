'use strict';

const path = require('path');

function runAgent(agentName, input) {
  const agentPath = path.join(__dirname, '..', 'agents', agentName, 'agent.js');
  const agent = require(agentPath);
  return agent.run(input);
}

function listAgents() {
  return ['sales_agent','support_agent','booking_agent','lead_scoring_agent','follow_up_agent','human_handoff_agent','ecommerce_order_agent','campaign_router_agent','inbox_triage_agent','safety_compliance_agent'];
}

module.exports = { runAgent, listAgents };
