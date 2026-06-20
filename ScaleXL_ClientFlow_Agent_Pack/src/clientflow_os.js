'use strict';

const path = require('path');

function loadAgent(name) {
  return require(path.join(__dirname, '..', 'agents', name, 'agent'));
}

const BOOKING_KEYWORDS = ['book', 'appointment', 'schedule', 'reserve'];
const ECOMMERCE_KEYWORDS = ['order', 'buy', 'cart', 'product', 'shop', 'price', 'how much'];
const SUPPORT_KEYWORDS = ['help', 'support', 'issue', 'problem', 'broken', 'refund', 'charge', 'error'];

function processMessage(input) {
  const { message = '', channel = 'unknown', lead_profile = {}, customer_id = 'guest' } = input || {};
  const msg = message.toLowerCase();
  const steps = [];

  const safety = loadAgent('safety_compliance_agent').run({ message, broadcast_request: null, sender_history: {} });
  steps.push({ step: 1, agent: 'safety_compliance_agent', result: safety });
  if (!safety.allowed) {
    return { pipeline_steps: steps, final_decision: 'blocked', agent_used: 'safety_compliance_agent', follow_up: null };
  }

  const triage = loadAgent('inbox_triage_agent').run({ conversation: { last_message: message }, channel, timestamp: new Date().toISOString() });
  steps.push({ step: 2, agent: 'inbox_triage_agent', result: triage });

  const scoring = loadAgent('lead_scoring_agent').run({ message, lead_profile });
  steps.push({ step: 3, agent: 'lead_scoring_agent', result: scoring });

  const campaign = loadAgent('campaign_router_agent').run({ lead_profile, source: lead_profile.source || 'website', channel, tags: [], message });
  steps.push({ step: 4, agent: 'campaign_router_agent', result: campaign });

  let mainResult, agentUsed;
  if (triage.urgency === 'critical' || scoring.score === 'needs-human') {
    mainResult = loadAgent('human_handoff_agent').run({ message, conversation_history: [], escalation_flags: [] });
    agentUsed = 'human_handoff_agent';
  } else if (SUPPORT_KEYWORDS.some(k => msg.includes(k))) {
    mainResult = loadAgent('support_agent').run({ message, conversation_history: [], customer_id });
    agentUsed = 'support_agent';
  } else if (BOOKING_KEYWORDS.some(k => msg.includes(k))) {
    mainResult = loadAgent('booking_agent').run({ message, existing_booking_data: {} });
    agentUsed = 'booking_agent';
  } else if (ECOMMERCE_KEYWORDS.some(k => msg.includes(k))) {
    mainResult = loadAgent('ecommerce_order_agent').run({ message, catalog_context: {}, customer_id });
    agentUsed = 'ecommerce_order_agent';
  } else {
    mainResult = loadAgent('sales_agent').run({ message, lead_profile, channel });
    agentUsed = 'sales_agent';
  }
  steps.push({ step: 5, agent: agentUsed, result: mainResult });

  const followUp = loadAgent('follow_up_agent').run({ lead_profile, last_message_timestamp: new Date().toISOString(), funnel_stage: campaign.funnel_stage, last_score: scoring.score });
  steps.push({ step: 6, agent: 'follow_up_agent', result: followUp });

  return { pipeline_steps: steps, final_decision: mainResult, agent_used: agentUsed, follow_up: followUp };
}

module.exports = { processMessage };
