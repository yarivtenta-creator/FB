'use strict';

const TEMPLATES = {
  hot: 'Hi {name}, I noticed your strong interest! Ready to move forward?',
  warm: 'Hi {name}, just checking in on your inquiry. Can I answer any questions?',
  cold: 'Hi {name}, we have some new offers that might interest you.',
  'needs-human': 'Hi {name}, a dedicated advisor will reach out to assist you personally.'
};

function run(input) {
  const { lead_profile = {}, last_message_timestamp, funnel_stage = 'awareness', last_score = 'cold' } = input || {};

  if (last_score === 'spam') {
    return { should_follow_up: false, delay_hours: 0, message_template: '', method: null };
  }

  const delayMap = { hot: 1, warm: 24, cold: 72, 'needs-human': 2 };
  const methodMap = { hot: 'whatsapp', warm: 'email', cold: 'email', 'needs-human': 'whatsapp' };

  return {
    should_follow_up: true,
    delay_hours: delayMap[last_score] || 48,
    message_template: TEMPLATES[last_score] || TEMPLATES.cold,
    method: methodMap[last_score] || 'email'
  };
}

module.exports = { run };
