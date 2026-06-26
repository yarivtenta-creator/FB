'use strict';
// intelligence_modules/viroscope_claude_video_router.js
// Viral Video Builder — Workflow bridge:
// Intake → ViroScope niche → ViroScope results → Claude prompt → Claude result → destination export
// Pure computation. No network, no secrets, no external calls.

// ── NICHE GENERATION ─────────────────────────────────────────────────────────

// Build niche angles from intake data. ViroScope max = 60 chars.
function generateNiches(input) {
  input = input || {};
  const company    = (input.company || input.business_name || '').trim();
  const industry   = (input.industry || input.sector || input.niche || '').trim();
  const offer      = (input.offer || input.service || input.product || '').trim();
  const audience   = (input.target_audience || input.audience || '').trim();
  const platform   = (input.platform || 'general').trim();
  const language   = (input.language || 'English').trim();

  // Synthesise base label: prefer offer, fall back to industry, fall back to company
  const base = offer || industry || company || 'marketing';

  // Derive audience label: first word or two for brevity
  const audShort = audience ? audience.split(/\s+/).slice(0, 3).join(' ') : '';

  // Generate 5 angle-based niches
  const candidates = [
    // Angle 1: offer + for + audience (most direct)
    audShort ? `${base} for ${audShort}` : `${base} tips and strategies`,
    // Angle 2: how-to / educational
    `how to grow with ${base}`,
    // Angle 3: results / transformation
    `${base} results that convert`,
    // Angle 4: industry authority
    industry ? `${industry} content that goes viral` : `${base} content that goes viral`,
    // Angle 5: platform-specific hook angle
    platform && platform !== 'general'
      ? `${base} on ${platform} for ${audShort || 'creators'}`
      : `viral ${base} content for ${audShort || 'beginners'}`,
  ].map(n => {
    // Enforce 60 char max — truncate at last space before limit
    if (n.length <= 60) return n;
    const cut = n.lastIndexOf(' ', 59);
    return cut > 20 ? n.slice(0, cut) : n.slice(0, 60);
  });

  // De-duplicate (keep first occurrence)
  const seen = new Set();
  const niches = candidates.filter(n => {
    const key = n.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    stage: 'niches_generated',
    recommended: niches[0],
    niches,
    viroscope_url: 'https://www.viroscopeai.com/generate',
    instructions: [
      '1. Copy the recommended niche prompt below.',
      '2. Open ViroScope at the URL above.',
      '3. Paste the niche into ViroScope and run the analysis.',
      '4. Copy all ViroScope results and paste them into the next stage.',
    ],
  };
}

// ── CLAUDE PROMPT GENERATION ─────────────────────────────────────────────────

function generateClaudePrompt(input) {
  input = input || {};
  const company        = (input.company || input.business_name || 'the client').trim();
  const industry       = (input.industry || '').trim();
  const offer          = (input.offer || input.service || '').trim();
  const audience       = (input.target_audience || input.audience || '').trim();
  const goal           = (input.need || input.goal || input.content_goal || '').trim();
  const selectedNiche  = (input.selected_viroscope_niche || '').trim();
  const rawViroscope   = (input.raw_viroscope_results || '').trim();
  const platform       = (input.platform || 'general').trim();
  const language       = (input.language || 'English').trim();
  const productionStyle = (input.production_style || 'modern, dynamic').trim();
  const contentGoal    = goal || (input.content_goal || 'drive awareness and conversions').trim();

  if (!selectedNiche) return { ok: false, error: 'selected_viroscope_niche is required' };
  if (!rawViroscope)  return { ok: false, error: 'raw_viroscope_results is required' };

  const prompt = `You are a world-class viral video strategist and production director.

CLIENT BRIEF:
- Business: ${company}
- Industry: ${industry || '(not specified)'}
- Offer / Service: ${offer || '(not specified)'}
- Target Audience: ${audience || '(not specified)'}
- Content Goal: ${contentGoal}
- Platform: ${platform}
- Language: ${language}
- Production Style: ${productionStyle}

VIROSCOPE NICHE ANALYSED:
"${selectedNiche}"

RAW VIROSCOPE RESULTS (pasted by user):
---
${rawViroscope}
---

YOUR TASK:
1. Read the ViroScope results and identify the single strongest viral idea that fits this client.
2. Explain in 2 sentences WHY that idea is the best match for the audience and goal.
3. Expand it into a full VIDEO PRODUCTION PACKAGE containing:

   a) VIDEO CONCEPT — hook angle, core message, emotional driver
   b) HOOK (first 3 seconds) — exact words or visual action
   c) SCRIPT OUTLINE — intro / main content / CTA (bullet points)
   d) SCENE BREAKDOWN — 3-6 scenes with visual description, on-screen text, voiceover
   e) PRODUCTION STYLE NOTES — camera movement, pacing, music mood, colour palette
   f) CAPTION / OVERLAY COPY — key text shown on screen
   g) CALL TO ACTION — exact wording for end card or verbal CTA
   h) PLATFORM OPTIMISATION — specs and timing for ${platform}

ORIGINALITY RULE:
Never reproduce competitor content. Use only hook structure, pacing principles, audience psychology,
topic angle, and format pattern. Every word, scene, and visual must be 100% original.

Deliver the full production package in ${language}. Be specific, creative, and production-ready.`;

  return {
    stage: 'claude_prompt_generated',
    ok: true,
    prompt,
    instructions: [
      '1. Copy the Claude prompt below.',
      '2. Open Claude (claude.ai) in a new tab.',
      '3. Paste the prompt and let Claude generate the full video production package.',
      '4. Copy Claude\'s entire response and paste it into the next stage.',
    ],
  };
}

// ── EXPORT PROMPT GENERATOR ───────────────────────────────────────────────────

const EXPORT_BUILDERS = {

  higgsfield: function(input) {
    const pkg = input.pasted_claude_result || '';
    const style = input.production_style || 'cinematic, dynamic';
    const platform = input.platform || 'general';
    const ar = platform.toLowerCase().includes('tiktok') || platform.toLowerCase().includes('reels')
      ? '9:16' : platform.toLowerCase().includes('youtube') ? '16:9' : '9:16';
    return `HIGGSFIELD VIDEO GENERATION PROMPT
──────────────────────────────────────
Based on the following production package, generate a cinematic video clip:

PRODUCTION PACKAGE SUMMARY:
${pkg.slice(0, 1200)}${pkg.length > 1200 ? '\n[...continued above — use the full package for scene details]' : ''}

GENERATION PARAMETERS:
• Visual Style: ${style}
• Aspect Ratio: ${ar}
• Duration: 15–30 seconds (or as appropriate per scene)
• Camera Movement: Smooth tracking, slow push-in on key moments, dynamic cuts
• Mood: Match the emotional driver from the production package
• Negative Prompt: blurry footage, stock footage look, overexposed, shaky cam, watermarks, text overlays
• Output Goal: social-media-ready short-form video clip

Generate the opening scene / hero shot first, then continue scene by scene.`;
  },

  gemini: function(input) {
    const pkg = input.pasted_claude_result || '';
    return `GEMINI VIDEO GENERATION PROMPT
──────────────────────────────────────
Use the following video production package to generate a complete video:

${pkg.slice(0, 1500)}${pkg.length > 1500 ? '\n[...full package above]' : ''}

STRUCTURED OUTPUT REQUEST:
1. Generate each scene described above as a distinct visual segment.
2. Apply the specified production style, colour palette, and pacing.
3. Include the exact voiceover and on-screen text from the script.
4. Match the emotional arc: hook → value delivery → CTA.
5. Output format: video sequence with audio layer (voiceover + music bed).`;
  },

  claude: function(input) {
    const pkg = input.pasted_claude_result || '';
    return `CLAUDE VIDEO REFINEMENT PROMPTS
──────────────────────────────────────
Use these prompts to improve and audit the production package:

PROMPT 1 — SCRIPT PUNCH-UP:
"Review this video script and tighten every line. Remove filler words. Make the hook 3× stronger.
Ensure every scene has a clear purpose. Return the revised script only.\n\n${pkg.slice(0, 800)}"

PROMPT 2 — PRODUCTION AUDIT:
"Audit this video production package against best practices for viral ${input.platform || 'social media'} content.
Flag any weak points (hook, pacing, CTA, scene count). Suggest specific improvements.\n\n${pkg.slice(0, 800)}"

PROMPT 3 — VARIATION GENERATOR:
"Create 3 alternative hook variations for this video concept that test different emotional angles
(curiosity, urgency, aspiration). Keep each under 10 seconds of spoken content.\n\n${pkg.slice(0, 400)}"`;
  },

  runway: function(input) {
    const pkg = input.pasted_claude_result || '';
    return `RUNWAY ML GENERATION PROMPT
──────────────────────────────────────
Source material: Use the production package below as your creative direction.

${pkg.slice(0, 800)}

RUNWAY PARAMETERS:
• Mode: Text-to-Video or Image-to-Video (choose based on available assets)
• Style: Match the production style notes above
• Motion: Dynamic — avoid static shots; use motion for energy
• Duration: 4–8 seconds per clip, chain scenes in post
• Seed style: cinematic commercial`;
  },

  veo: function(input) {
    const pkg = input.pasted_claude_result || '';
    return `VEO VIDEO GENERATION PROMPT
──────────────────────────────────────
Generate a video based on this production brief:

${pkg.slice(0, 1000)}

VEO PARAMETERS:
• Resolution: 1080p or higher
• Frame rate: 24fps (cinematic) or 30fps (social)
• Style consistency: Maintain the visual language across all scenes
• Audio: Generate matching ambient audio and music bed`;
  },

  kling: function(input) {
    const pkg = input.pasted_claude_result || '';
    return `KLING AI GENERATION PROMPT
──────────────────────────────────────
Video brief for Kling generation:

${pkg.slice(0, 800)}

KLING SETTINGS:
• Mode: Professional / Cinematic
• Motion Strength: Medium-High for dynamic content
• Duration: Per scene as defined in the production package
• Style reference: Commercial / Brand content`;
  },

  editor_brief: function(input) {
    const pkg = input.pasted_claude_result || '';
    const platform = input.platform || 'social media';
    const company = input.company || input.business_name || 'client';
    return `VIDEO EDITOR BRIEF
──────────────────────────────────────
PROJECT: ${company} — Viral Video
PLATFORM: ${platform}
LANGUAGE: ${input.language || 'English'}

PRODUCTION PACKAGE (source of truth):
${pkg}

──────────────────────────────────────
EDITOR CHECKLIST:

SHOT LIST:
→ Use the scene breakdown above as your shot list.
→ Each scene = one cut or transition block.

VOICEOVER:
→ Record all voiceover copy from the script section.
→ Tone: match the production style notes (energy, warmth, pace).

TIMELINE:
→ Hook: 0–3 seconds (must stop scroll — use strongest visual first)
→ Value content: 4–[N] seconds (follow scene order)
→ CTA: Last 3–5 seconds (clear, single action)

CAPTIONS:
→ Burn in all on-screen text from the caption/overlay copy section.
→ Font: bold, high-contrast, platform-native style.
→ Animated entrance on key words for emphasis.

B-ROLL:
→ Layer relevant b-roll under voiceover sections.
→ Keep b-roll tight — no clip longer than 2 seconds unless intentional.

MUSIC DIRECTION:
→ Use music mood specified in production notes.
→ Duck music 3dB under voiceover, swell at CTA.

EXPORT SPECS (${platform}):
→ TikTok / Reels: 1080×1920, MP4, H.264, max 60s
→ YouTube Shorts: 1080×1920, MP4, max 60s
→ YouTube long-form: 1920×1080, MP4
→ LinkedIn: 1920×1080 or 1080×1080
→ Add captions as burned-in AND as SRT sidecar file.`;
  },

  youtube_upload_package: function(input) {
    const pkg = input.pasted_claude_result || '';
    const company = input.company || input.business_name || 'your brand';
    const niche = input.selected_viroscope_niche || 'viral content';
    const audience = input.target_audience || input.audience || 'your audience';
    return `YOUTUBE UPLOAD PACKAGE
──────────────────────────────────────
Generated from production package. Review and personalise before publishing.

TITLE OPTIONS (pick one, A/B test if possible):
Option A: [Extract the main hook from the script above and make it a YouTube title — punchy, under 60 chars]
Option B: "How [audience] [achieves result] with [offer] — [year]"
Option C: "[Curiosity gap question from the hook] | ${company}"

DESCRIPTION (YouTube SEO — 800–1000 chars):
Line 1: Restate the hook as the first sentence.
Line 2-4: Expand the 3 main value points from the video.
Line 5: CTA — subscribe / link in bio / download.
---
[Paste the script summary here as the description body]
---
About ${company}: [2-sentence company bio]
${audience} — this channel is for you.

TAGS (copy all):
${niche}, ${niche.split(' ').join(', ')}, viral video, ${company.toLowerCase()}, content marketing,
how to, tutorial, tips, ${input.industry || 'marketing'}, ${audience}, strategy 2026, growth

THUMBNAIL PROMPT (send to designer or AI image tool):
"Bold split-screen thumbnail. Left side: person with surprised/excited expression.
Right side: bold text '[KEY RESULT OR NUMBER] in [TIMEFRAME]'. Brand colours: [add yours].
Style: modern YouTube thumbnail, high contrast, readable at 120px width."

PINNED COMMENT (post immediately after upload):
"⬇️ Full resources mentioned in this video → [your link]
💬 Drop your biggest question below — I read every comment.
🔔 Subscribe if you want more [niche] content every week."

CHAPTERS (add if video > 3 minutes — adjust timestamps):
0:00 — Hook: [title of hook scene]
0:30 — [Scene 2 title]
1:00 — [Scene 3 title]
[Continue from scene breakdown in production package]
[Last 0:30] — CTA + Next steps`;
  },
};

function generateExport(input) {
  input = input || {};
  const dest = (input.selected_destination || '').toLowerCase().replace(/\s+/g, '_');

  const builder = EXPORT_BUILDERS[dest];
  if (!builder) {
    const valid = Object.keys(EXPORT_BUILDERS);
    return {
      ok: false,
      error: `Unknown destination: "${input.selected_destination}". Valid options: ${valid.join(', ')}`,
    };
  }

  if (!input.pasted_claude_result) {
    return { ok: false, error: 'pasted_claude_result is required before generating export' };
  }

  return {
    stage: 'export_generated',
    ok: true,
    destination: dest,
    exported_prompt: builder(input),
  };
}

// ── PROJECT SAVE ──────────────────────────────────────────────────────────────

function saveProject(input) {
  input = input || {};
  const now = new Date().toISOString();
  const id = 'vvr_' + now.replace(/[^0-9]/g, '').slice(0, 14);
  return {
    stage: 'project_saved',
    ok: true,
    project: {
      project_id:                id,
      intake_id:                 input.intake_id || '',
      client_name:               input.company || input.business_name || '',
      viroscope_niche_options:   input.viroscope_niche_options || [],
      selected_viroscope_niche:  input.selected_viroscope_niche || '',
      raw_viroscope_results:     input.raw_viroscope_results || '',
      generated_claude_prompt:   input.generated_claude_prompt || '',
      pasted_claude_result:      input.pasted_claude_result || '',
      selected_destination:      input.selected_destination || '',
      exported_prompt:           input.exported_prompt || '',
      created_at:                input.created_at || now,
      updated_at:                now,
    },
  };
}

// ── MAIN ORCHESTRATOR (assess = standard module entry point) ──────────────────

function assess(input) {
  input = input || {};
  const stage = input.stage || 'generate_niches';

  if (stage === 'generate_niches')      return generateNiches(input);
  if (stage === 'generate_claude_prompt') return generateClaudePrompt(input);
  if (stage === 'generate_export')      return generateExport(input);
  if (stage === 'save_project')         return saveProject(input);

  return {
    ok: false,
    error: `Unknown stage: "${stage}". Valid: generate_niches, generate_claude_prompt, generate_export, save_project`,
    module: 'viroscope_claude_video_router',
  };
}

module.exports = {
  assess,
  generateNiches,
  generateClaudePrompt,
  generateExport,
  saveProject,
  STATUS: 'ACTIVE',
};
