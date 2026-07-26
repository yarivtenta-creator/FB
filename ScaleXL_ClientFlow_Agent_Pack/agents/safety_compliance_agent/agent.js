'use strict';

function run(input) {
  const message = input.message || '';
  const broadcast_request = input.broadcast_request || null;
  const msg = message.toLowerCase();

  if (broadcast_request) {
    const optedOutUsers = broadcast_request.opted_out_users || [];
    const optedOutCount = broadcast_request.opted_out_count || 0;
    if (optedOutUsers.length > 0 || optedOutCount > 0) {
      return { allowed: false, reason: 'Broadcast contains opted-out recipients', action: 'block' };
    }
  }

  const PROFANITY = ['fuck', 'shit', 'asshole', 'bitch', 'bastard'];
  if (PROFANITY.some(w => msg.includes(w))) {
    return { allowed: false, reason: 'Profanity detected', action: 'flag' };
  }
  if (/\b(free money|win prize|click here|limited time)\b/i.test(message)) {
    return { allowed: false, reason: 'Spam pattern detected', action: 'block' };
  }

  return { allowed: true, reason: 'Message passed all safety checks', action: 'allow' };
}

module.exports = { run };
