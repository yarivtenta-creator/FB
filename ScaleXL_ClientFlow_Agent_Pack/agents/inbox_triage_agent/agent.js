'use strict';

const CRITICAL_SIGNALS = ['angry', 'furious', 'lawsuit', 'fraud', 'scam', 'charged twice', 'double charge', 'legal', 'payment issue', 'sue', 'payment failed', 'account hacked'];
const HIGH_SIGNALS = ['urgent', 'asap', 'not working', 'broken', 'help me now'];
const HOURS_24 = 24 * 60 * 60 * 1000;

function getMessageText(conversation) {
  if (!conversation) return '';
  if (conversation.last_message) return conversation.last_message;
  if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
    const last = conversation.messages[conversation.messages.length - 1];
    return last.text || last.message || '';
  }
  return '';
}

function run(input) {
  const { conversation = {}, channel = 'unknown', timestamp = null } = input || {};
  const message = getMessageText(conversation);
  const lower = message.toLowerCase();

  if (CRITICAL_SIGNALS.some(s => lower.includes(s))) {
    return { urgency: 'critical', status: 'needs_response', tags: ['escalation', 'priority'], assigned_to: 'senior_agent' };
  }

  const isStale = timestamp && (Date.now() - new Date(timestamp).getTime()) > HOURS_24;
  if (HIGH_SIGNALS.some(s => lower.includes(s)) || isStale) {
    return { urgency: 'high', status: 'needs_response', tags: ['follow_up'], assigned_to: 'support_team' };
  }

  if (conversation.status === 'resolved') {
    return { urgency: 'low', status: 'resolved', tags: ['closed'], assigned_to: null };
  }

  return { urgency: 'medium', status: 'needs_response', tags: ['standard'], assigned_to: 'agent_pool' };
}

module.exports = { run };
