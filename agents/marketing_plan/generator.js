'use strict';
// agents/marketing_plan/generator.js — produces a full four-pillar marketing plan per client.
// FIXED (Worker 04): reads canonical intake field target_audience (not audience), no country placeholder.
const ai = require('../../runtime/ai.js');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function input_defaults(input) {
  return {
    industry:  input.industry  || 'general business',
    audience:  input.target_audience || input.audience || 'your target audience',
    platform:  input.platform  || 'Meta + Google',
    country:   input.country   || '',
    offer:     input.offer     || 'core product/service',
    company:   input.company   || input.name || '',
    budget:    input.budget    || 'medium',
    revenue_goal: input.revenue_goal || input.revenue_target || '',
    pain_points:  input.pain_points  || input.pains || '',
    competitors:  input.competitors  || '',
  };
}

// ---- Pillar 1: Strategy ----
function strategy(i) {
  const market = i.country ? ` (${i.country})` : '';
  const co = i.company || 'this business';
  return `## 1. Marketing Strategy

**Business:** ${co} — ${i.industry}${market}
**Primary offer:** ${i.offer}
**Revenue goal:** ${i.revenue_goal || 'set a 12-month target'}

**Objectives (SMART):**
- Brand awareness: grow reach + ${i.platform} following.
- Lead generation: capture qualified leads for ${i.offer}.
- Conversion: turn leads into paying customers.
- Retention: repeat purchase / referral.

**Target audience:** ${i.audience}. Refine via testing into 2-3 personas.
**Pain points:** ${i.pain_points || 'identify through customer interviews'}

**Unique value proposition:** State clearly what sets ${co} apart (quality, speed, price, expertise). All copy flows from this USP.

**Marketing mix:**
- Paid media for fast results (search + social, cold + remarketing).
- Owned/organic for long-term growth (SEO, content, email).
- Earned/partnerships (PR, influencers, referrals).

**Budget posture (${i.budget}):** small/medium firms typically spend 6-12% of revenue on marketing.

**KPIs:** awareness = impressions/reach; acquisition = CTR/CPC; conversion = CVR/CPA; retention = repeat rate/email opens.`;
}

// ---- Pillar 2: Paid Campaigns ----
function paid(i) {
  const co = i.company || 'this business';
  return `## 2. Paid Advertising Campaigns

### Google Search — Lead Gen
- Objective: capture high-intent searchers in ${i.country || 'target market'}.
- Creative: Headlines (<=30 chars) e.g. "Get ${i.offer} Today"; Desc (<=90) "Try risk-free. Contact us!"; CTA "Sign Up".
- Budget (daily): Low €20 / Med €100 / High €300+. Bidding: Enhanced CPC -> Target CPA.
- KPIs: CTR 5-7%, CVR 2-5%, CPA, ROAS.

### Google Display — Remarketing
- Objective: re-engage past visitors + awareness.
- Creative: responsive display, 1200x628 + 1200x1200, "Remember us? Save 10%".
- Budget: €10-50/day, Target CPM/CPA. KPIs: view-through conv, CTR.

### Meta (Facebook/Instagram)
- Awareness + Lead Gen + Retargeting campaigns.
- Creative: 1080x1080 / 1080x1350 feed, 1080x1920 Reels/Stories, 15-30s video.
- Audience targeting: ${i.audience}. Build custom + lookalike from email list.
- Budget: Low €5-20 / Med €50-100 / High €200+/day. Pixel-based audiences.
- KPIs: CTR, CPM, CPL, ROAS.

### TikTok / YouTube / LinkedIn (as relevant)
- TikTok: 9:16 native video, hook in first 3s. YouTube: 15-30s skippable.
- LinkedIn: B2B targeting if ${i.audience} includes professionals.

| Platform | Objective | Budget/day | Primary KPI |
|---|---|---|---|
| Google Search | Conversions | €20-300 | CPA / ROAS |
| Google Display | Remarketing | €10-50 | View-thru conv |
| Meta | Awareness+Leads | €5-200 | CPL / ROAS |
| TikTok/YouTube | Awareness | €20-100 | Views / CTR |`;
}

// ---- Pillar 3: 12-month Organic Plan ----
function organic(i) {
  const themes = ['Foundation & SEO setup','Audience building','Content engine','Email nurture',
    'Partnerships','Mid-year campaign','UGC & social proof','SEO scaling','Community',
    'Q4 push / launches','Retention & referrals','Review & plan next year'];
  let cal = '| Month | Theme | Focus |\n|---|---|---|\n';
  MONTHS.forEach((m, n) => { cal += `| ${m} | ${themes[n]} | content + ${i.platform} + email |\n`; });
  return `## 3. One-Year Organic Growth Plan

**Channels:** SEO (keyword research, on-page, link-building), social calendar (daily/weekly on ${i.platform}), email (newsletter + drip nurture), community, partnerships.

**Content pillars:** how-to guides, case studies, behind-the-scenes, thought leadership for ${i.audience}.

**12-month calendar:**
${cal}
**Measurement:** Google Analytics, Search Console, social insights, email open/click rates.`;
}

// ---- Pillar 4: Data & Roadmap ----
function roadmap(i) {
  const co = i.company || 'this business';
  return `## 4. Data & 90-Day Roadmap

### Week 1-2 (Setup)
- Install tracking: Google Analytics 4, Meta Pixel, email platform.
- Baseline: document current traffic, leads, sales, conversion rate.
- Launch first campaign on ${i.platform}.

### Month 1 (Launch)
- Run test campaigns: A/B test 2 creatives, 2 audiences.
- Publish 4 organic pieces. Start email list building.
- Review: what's working? Double down on winners.

### Month 2-3 (Scale)
- Scale winning campaigns: increase budget on positive ROAS.
- SEO: publish 8-12 optimised articles. Build 5+ backlinks.
- Email: launch drip sequence (5 emails) for new leads.
- Target: ${i.revenue_goal ? 'on track to ' + i.revenue_goal : 'hit 80% of revenue goal'}.

### Competitors to watch
${i.competitors || 'List 3-5 direct competitors and monitor monthly.'}

### KPI Dashboard (review weekly)
| KPI | Baseline | Target Month 3 |
|---|---|---|
| Monthly traffic | — | +50% |
| Monthly leads | — | +3x |
| Conversion rate | — | 2-5% |
| CAC | — | Reduce 20% |
| ROAS | — | 3:1+ |`;
}

function buildPlan(input) {
  const i = input_defaults(input);
  const header = `# Marketing Plan — ${i.company || 'Business'}\n\n**Industry:** ${i.industry} | **Market:** ${i.country || 'global'} | **Offer:** ${i.offer}\n\n---\n\n`;
  return header + strategy(i) + '\n\n' + paid(i) + '\n\n' + organic(i) + '\n\n' + roadmap(i);
}

async function generate(input) {
  const i = input_defaults(input);
  const offline = buildPlan(input);
  if (!ai.isLive()) return { ok: true, plan_md: offline, ai_used: false, ai_status: 'OFFLINE_MODE' };
  const prompt = `Write a complete 4-pillar marketing plan for ${i.company || 'a business'} in ${i.industry}${i.country ? ' (' + i.country + ')' : ''}. Audience: ${i.audience}. Offer: ${i.offer}. Revenue goal: ${i.revenue_goal}. Pain points: ${i.pain_points}. Competitors: ${i.competitors}. Platform focus: ${i.platform}. Cover: (1) Strategy, (2) Paid campaigns, (3) 12-month organic calendar, (4) 90-day roadmap with KPIs. Be specific — use the client data, not generic templates.`;
  const result = await ai.generate(prompt, { max_tokens: 4000 });
  if (!result.ok) return { ok: true, plan_md: offline, ai_used: false, ai_status: result.status, ai_error: result.error };
  return { ok: true, plan_md: result.text, ai_used: true, ai_status: result.status };
}

module.exports = { generate, buildPlan, input_defaults };
