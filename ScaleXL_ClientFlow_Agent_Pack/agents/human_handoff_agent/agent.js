'use strict';

const IMMEDIATE_TRIGGERS = ['lawsuit', 'legal action', 'sue', 'lawyer', 'attorney', 'police', 'fraud', 'speak to your manager', 'talk to your manager', 'speak to manager', 'talk to manager', 'want to speak to', 'manager now'];
const HIGH_TRIGGERS = ['speak to human', 'real person', 'supervisor', 'escalate', 'this is unacceptable', 'manager'];
const ANGER_SIGNALS = ['angry', 'furious', 'outraged', 'terrible service', 'worst', 'disgusting'];

function run(input) {
  const { message = '', conversation_history = [], escalation_flags = {} } = input || {};
  const lower = message.toLowerCase();

  if (IMMEDIATE_TRIGGERS.some(t => lower.includes(t))) {
    return {
      should_handoff: true,
      urgency: 'immediate',
      reason: 'Manager request or legal/fraud threat detected',
      handoff_object: { handoff_id: 'HO-' + Date.now(), urgency: 'immediate', assigned_queue: 'emergency', created_at: new Date().toISOString() }
    };
  }
  if (HIGH_TRIGGERS.some(t => lower.includes(t)) || ANGER_SIGNALS.some(t => lower.includes(t))) {
    return {
      should_handoff: true,
      urgency: 'high',
      reason: 'Human agent requested or anger detected',
      handoff_object: { handoff_id: 'HO-' + Date.now(), urgency: 'high', assigned_queue: 'priority', created_at: new Date().toISOString() }
    };
  }

  return { should_handoff: false, urgency: null, reason: 'No handoff triggers detected', handoff_object: null };
}

module.exports = { run };
