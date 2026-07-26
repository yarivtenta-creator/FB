'use strict';

const TECHNICAL_KEYWORDS = ['broken', 'not working', 'error', 'bug', 'crash', 'issue', 'glitch', 'fail'];
const BILLING_KEYWORDS = ['charge', 'refund', 'payment', 'invoice', 'charged', 'billing', 'overcharged', 'fee'];
const COMPLAINT_KEYWORDS = ['angry', 'terrible', 'lawsuit', 'disgusting', 'horrible', 'worst', 'unacceptable'];
const FAQ_KEYWORDS = ['how', 'what', 'where', 'when', 'help', 'info', 'explain'];

function run(input) {
  const { message = '', conversation_history = [], customer_id = 'unknown' } = input || {};
  const msg = message.toLowerCase();

  if (COMPLAINT_KEYWORDS.some(kw => msg.includes(kw))) {
    return { type: 'complaint', response: 'We sincerely apologize. A senior agent will contact you immediately.', confidence: 90 };
  }
  if (BILLING_KEYWORDS.some(kw => msg.includes(kw))) {
    return { type: 'billing', response: 'I can help with billing issues. Let me pull up your account details.', confidence: 88 };
  }
  if (TECHNICAL_KEYWORDS.some(kw => msg.includes(kw))) {
    return { type: 'technical', response: 'I understand you are experiencing a technical issue. Let me help you troubleshoot.', confidence: 85 };
  }
  if (FAQ_KEYWORDS.some(kw => msg.includes(kw))) {
    return { type: 'faq', response: 'Great question! Let me provide you with the information you need.', confidence: 75 };
  }

  return { type: 'faq', response: 'Thank you for reaching out. How can I assist you today?', confidence: 60 };
}

module.exports = { run };
