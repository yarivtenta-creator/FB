'use strict';

function run(input) {
  const lead_profile = input.lead_profile || {};
  const source = input.source || '';
  const businessType = (lead_profile.business_type || '').toLowerCase();

  if (source === 'facebook_ad' && businessType === 'ecommerce') {
    return { campaign_id: 'CAMP-FB-ECOM-001', funnel_stage: 'awareness', next_action: 'Send welcome message', reason: 'Facebook ecommerce lead' };
  }
  if (source === 'facebook_ad') {
    return { campaign_id: 'CAMP-FB-001', funnel_stage: 'awareness', next_action: 'Qualify lead', reason: 'Facebook ad lead' };
  }
  if (source === 'instagram') {
    return { campaign_id: 'CAMP-IG-001', funnel_stage: 'awareness', next_action: 'Engage with content', reason: 'Instagram lead' };
  }
  if (source === 'referral') {
    return { campaign_id: 'CAMP-REF-001', funnel_stage: 'decision', next_action: 'Send offer', reason: 'Referral lead' };
  }
  return { campaign_id: 'CAMP-DEFAULT-001', funnel_stage: 'awareness', next_action: 'Qualify lead', reason: 'Default campaign route' };
}

module.exports = { run };
