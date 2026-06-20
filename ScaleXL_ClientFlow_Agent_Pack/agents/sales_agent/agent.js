'use strict';

const HOT_KEYWORDS = ['buy', 'price', 'purchase', 'how much', 'ready', 'interested', 'order', 'cost', 'pricing', 'deal', 'discount'];
const COLD_KEYWORDS = ['just browsing', 'maybe later', 'no thanks', 'not interested', 'not ready'];
const SPAM_PATTERNS = [/(.){5,}/, /https?:\/\/[^\s]+/i, /\b(free money|win|prize|click here)\b/i];

function run(input) {
  const { message = '', lead_profile = {}, channel = 'unknown' } = input || {};
  const msg = message.toLowerCase();

  const isAllCaps = message.length > 10 && message === message.toUpperCase();
  const isSpam = isAllCaps || SPAM_PATTERNS.some(p => p.test(message));
  if (isSpam) {
    return { action: 'disqualify', intent_score: 0, reason: 'Spam detected', next_step: 'block_sender' };
  }

  const isCold = COLD_KEYWORDS.some(kw => msg.includes(kw));
  if (isCold) {
    return { action: 'disqualify', intent_score: 10, reason: 'Cold lead - no buying intent', next_step: 'add_to_nurture_sequence' };
  }

  const hotMatches = HOT_KEYWORDS.filter(kw => msg.includes(kw));
  if (hotMatches.length > 0) {
    const intent_score = Math.min(60 + hotMatches.length * 10, 100);
    const action = intent_score >= 85 ? 'close' : 'pitch';
    return { action, intent_score, reason: `Hot keywords detected: ${hotMatches.join(', ')}`, next_step: 'send_pricing_info' };
  }

  return { action: 'qualify', intent_score: 40, reason: 'Neutral message, needs qualification', next_step: 'ask_qualifying_questions' };
}

module.exports = { run };
