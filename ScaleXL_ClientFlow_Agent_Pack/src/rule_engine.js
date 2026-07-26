'use strict';

function matchKeywords(text, keywords) {
  const lower = (text || '').toLowerCase();
  return keywords.filter(kw => lower.includes(kw));
}

function matchPatterns(text, patterns) {
  return patterns.filter(p => p.test(text));
}

function scoreKeywords(matches, baseScore, perMatch) {
  return Math.min(baseScore + matches.length * perMatch, 100);
}

module.exports = { matchKeywords, matchPatterns, scoreKeywords };
