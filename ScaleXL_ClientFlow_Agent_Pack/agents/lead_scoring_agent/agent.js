'use strict';

const HOT_SIGNALS = ['urgent', 'asap', 'buy', 'purchase', 'ready', 'budget', 'price', 'how much', 'order'];
const SPAM_SIGNALS = ['mass message', 'broadcast', 'click here', 'free money', 'win prize'];
const WARM_SIGNALS = ['interested', 'maybe', 'considering', 'tell me more', 'curious'];
const COLD_SIGNALS = ['just browsing', 'not interested', 'maybe later', 'no thanks', 'not ready'];

function run(input) {
  const { message = '', lead_profile = {} } = input || {};
  const msg = message.toLowerCase();

  if (SPAM_SIGNALS.some(s => msg.includes(s)) || (message.length > 10 && message === message.toUpperCase())) {
    return { score: 'spam', numeric_score: 0, reasoning: 'Spam patterns detected' };
  }
  if (COLD_SIGNALS.some(s => msg.includes(s))) {
    return { score: 'cold', numeric_score: 15, reasoning: 'Cold signals detected' };
  }

  const hotMatches = HOT_SIGNALS.filter(s => msg.includes(s));
  if (hotMatches.length >= 2) {
    return { score: 'hot', numeric_score: Math.min(70 + hotMatches.length * 5, 100), reasoning: 'Multiple hot signals: ' + hotMatches.join(', ') };
  }
  if (WARM_SIGNALS.some(s => msg.includes(s)) || hotMatches.length === 1) {
    return { score: 'warm', numeric_score: 55, reasoning: 'Warm interest signals detected' };
  }

  return { score: 'cold', numeric_score: 20, reasoning: 'No strong intent signals' };
}

module.exports = { run };
