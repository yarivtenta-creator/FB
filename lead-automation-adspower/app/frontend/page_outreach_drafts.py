import streamlit as st
from app.frontend.mock_data import LEADS, DRAFTS, PROFILES
from app.frontend.theme import CHANNEL_ICONS, TONE_ICONS, FLAG_MAP

CHANNELS = ["email", "dm", "comment"]
TONES = ["soft", "direct", "professional"]
LANG_OPTIONS = {"en": "🇬🇧 English", "it": "🇮🇹 Italian", "fr": "🇫🇷 French", "de": "🇩🇪 German", "es": "🇪🇸 Spanish"}


def show():
    st.markdown('<div class="page-header"><h1>✉️ Outreach Drafts</h1><p class="page-subtitle">Generate and manage personalized outreach messages</p></div>', unsafe_allow_html=True)

    lead_opts = {f"{l['business_name']} (#{l['id']})": l["id"] for l in LEADS}
    presel = st.session_state.get("draft_lead_id")
    keys = list(lead_opts.keys())
    def_key = next((k for k, v in lead_opts.items() if v == presel), keys[0])

    selected_key = st.selectbox("Lead", keys, index=keys.index(def_key), label_visibility="collapsed")
    lead_id = lead_opts[selected_key]
    lead = next(l for l in LEADS if l["id"] == lead_id)
    profile = PROFILES.get(lead_id)

    # ── Lead context bar ─────────────────────────────────────────
    flag = FLAG_MAP.get(lead.get("language", "en"), "🌐")
    score = lead.get("lead_score", 0)
    sc = "#10b981" if score >= 75 else "#f59e0b" if score >= 50 else "#ef4444"
    st.markdown(f"""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
        <div>
            <span style="font-size:14px;font-weight:600;color:#f1f5f9">{lead['business_name']}</span>
            <span style="font-size:12px;color:#64748b;margin-left:10px">{flag} {lead.get('city','')}, {lead.get('country','')}</span>
        </div>
        <div style="display:flex;gap:16px;align-items:center">
            {'<div style="background:rgba(16,185,129,0.1);border-radius:8px;padding:4px 10px;font-size:12px;color:#34d399">Profile Ready ✓</div>' if profile else '<div style="background:rgba(245,158,11,0.1);border-radius:8px;padding:4px 10px;font-size:12px;color:#fbbf24">No Profile — Run Analysis first</div>'}
            <div style="font-size:13px;font-weight:700;color:{sc}">{score}/100</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab_gen, tab_all = st.tabs(["✨ Generate", "📋 All Drafts"])

    with tab_gen:
        _generate_tab(lead, profile)

    with tab_all:
        _all_drafts_tab(lead_id)


def _generate_tab(lead, profile):
    c1, c2, c3, c4 = st.columns(4)
    channel = c1.selectbox("Channel", CHANNELS, format_func=lambda x: f"{CHANNEL_ICONS.get(x,'')} {x.title()}")
    tone = c2.selectbox("Tone", TONES, format_func=lambda x: f"{TONE_ICONS.get(x,'')} {x.title()}")
    lang = c3.selectbox("Language", list(LANG_OPTIONS.keys()),
                        index=list(LANG_OPTIONS.keys()).index(lead.get("language","en")) if lead.get("language") in LANG_OPTIONS else 0,
                        format_func=lambda x: LANG_OPTIONS[x])
    gen_all = c4.checkbox("Generate all 9 variants")

    if st.button("✨ Generate Draft", type="primary"):
        with st.spinner("AI is writing your draft..."):
            import time; time.sleep(1.1)

        st.success("Draft generated!")
        channel_icon = CHANNEL_ICONS.get(channel, "✉️")
        tone_icon = TONE_ICONS.get(tone, "")

        # Show preview of generated draft
        preview_drafts = _get_mock_draft(lead, channel, tone, lang)
        if gen_all:
            st.markdown(f"### All 9 Variants Generated")
            for ch in CHANNELS:
                for tn in TONES:
                    with st.expander(f"{CHANNEL_ICONS.get(ch,'')} {ch.upper()} · {TONE_ICONS.get(tn,'')} {tn.title()}"):
                        st.text_area("", value=_get_mock_draft(lead, ch, tn, lang), height=120, key=f"gen_{ch}_{tn}", label_visibility="collapsed")
                        c_app, c_rej, _ = st.columns([1, 1, 3])
                        c_app.button("✅ Approve", key=f"app_gen_{ch}_{tn}")
                        c_rej.button("❌ Reject", key=f"rej_gen_{ch}_{tn}")
        else:
            st.markdown(f"### {channel_icon} {channel.upper()} · {tone_icon} {tone.title()} Draft")
            draft_text = st.text_area("Draft (editable)", value=preview_drafts, height=200, key="gen_preview")
            ca, cb, cc, _ = st.columns([1, 1, 1, 3])
            ca.button("✅ Approve Draft", type="primary")
            cb.button("❌ Reject")
            cc.button("🔄 Regenerate")

    # Prompt preview
    with st.expander("📄 View AI Prompt"):
        st.markdown(f"""```
SYSTEM: You are an expert outreach copywriter for the creative industry.
Generate a {tone} {channel} message in {LANG_OPTIONS.get(lang,'English')}.

LEAD: {lead['business_name']} · {lead.get('niche','').replace('_',' ').title()} · {lead.get('city','')}, {lead.get('country','')}
PROFILE: {PROFILES.get(lead['id'], {}).get('summary','No profile yet')[:200]}...
OPPORTUNITIES: {', '.join(PROFILES.get(lead['id'], {}).get('opportunities', [])[:2])}

OUTPUT: Write the message only. No explanations.
```""")


def _get_mock_draft(lead, channel, tone, lang):
    name = lead.get("contact_name", "there") or "there"
    first = name.split()[0] if name else "there"
    biz = lead["business_name"]

    it_soft = f"Ciao {first}! Ho scoperto {biz} e sono rimasto davvero colpito dal tuo lavoro. Ti contatto perché credo di poter aiutarti a raggiungere ancora più clienti ideali. Ti va se ti mando qualcosa?"
    it_direct = f"Ciao {first}, lavoro con fotografi e videografi come te per riempire il calendario con clienti premium. Ho un approccio specifico per il mercato italiano. 15 minuti per esplorare insieme?"
    it_prof = f"Gentile {first},\n\nHo avuto il piacere di scoprire {biz} e sono rimasto colpito dalla qualità del vostro lavoro.\n\nCollabero con studi creativi italiani per sviluppare strategie di acquisizione clienti efficaci. Sarebbe disponibile per una breve chiamata?\n\nCordiali saluti,\n[Il Tuo Nome]"

    en_soft_email = f"Subject: Loved your work, {first}!\n\nHi {first},\n\nI came across {biz} and I'm genuinely impressed by your storytelling. What you create is rare.\n\nI'd love to share something that could help you reach more of your ideal clients — would you be open to a quick message?\n\nWarm regards,\n[Your Name]"
    en_direct_email = f"Subject: Booking more premium clients for {biz}\n\nHi {first},\n\n{biz} has exactly what premium clients are looking for. I help studios like yours consistently fill their pipeline.\n\nHere's the short version: a proven outreach system that fits your style, no cold pitching.\n\nReady to see if it works? 15 minutes is all it takes.\n\n[Your Name]"
    en_prof_email = f"Subject: Collaboration opportunity for {biz}\n\nDear {first},\n\nI came across your portfolio and was impressed by the quality and consistency of your work.\n\nI specialize in helping creative studios grow their client pipeline through strategic, personalized outreach. I believe there's a strong fit with what you're building.\n\nWould you be available for a brief call this week?\n\nBest regards,\n[Your Name]"

    en_soft_dm = f"Hi {first}! Just discovered {biz} and honestly the work is stunning 😍 The emotion you capture is rare. Would love to share something that might help you reach even more dream clients — mind if I send a quick note?"
    en_direct_dm = f"Hi {first} — your portfolio caught my eye. I help wedding videographers consistently book premium clients with a system that fits their style. Would it be useful if I shared how it works? Takes 15 min."
    en_prof_dm = f"Hi {first}, I came across {biz} and was genuinely impressed. I work with creative studios on client acquisition strategy. Would you be open to a brief conversation?"

    en_soft_comment = f"This work is genuinely moving — the way you capture real emotion sets {biz} apart. Do you ever share behind-the-scenes of your process? 🎬"
    en_direct_comment = f"Stunning portfolio! The cinematic quality here is next level. Would love to connect — I work with videographers on growing their bookings 🙌"
    en_prof_comment = f"Beautiful work — the storytelling quality in your latest film is exceptional. Would be great to connect."

    it_comment = f"Che lavoro straordinario! La qualità cinematografica di {biz} è davvero rara. Complimenti 🎬"
    fr_soft = f"Bonjour {first}! Je suis tombé sur {biz} et j'ai été sincèrement touché par votre façon de raconter les histoires. Je serais ravi de partager quelque chose qui pourrait vous aider à attirer encore plus de clients idéaux."
    de_prof = f"Sehr geehrte/r {first},\n\nIch habe Ihr Portfolio entdeckt und bin von der Qualität Ihrer Arbeit sehr beeindruckt.\n\nIch arbeite mit kreativen Studios zusammen, um deren Kundengewinnung zu optimieren. Hätten Sie Zeit für ein kurzes Gespräch?\n\nMit freundlichen Grüßen,\n[Ihr Name]"

    if lang == "it":
        if channel == "comment": return it_comment
        if tone == "soft": return it_soft
        if tone == "direct": return it_direct
        return it_prof
    if lang == "fr": return fr_soft
    if lang == "de": return de_prof

    if channel == "email":
        if tone == "soft": return en_soft_email
        if tone == "direct": return en_direct_email
        return en_prof_email
    if channel == "dm":
        if tone == "soft": return en_soft_dm
        if tone == "direct": return en_direct_dm
        return en_prof_dm
    if tone == "soft": return en_soft_comment
    if tone == "direct": return en_direct_comment
    return en_prof_comment


def _all_drafts_tab(lead_id):
    drafts = [d for d in DRAFTS if d["lead_id"] == lead_id]
    if not drafts:
        st.info("No drafts yet. Use the Generate tab to create your first draft.")
        return

    st.markdown(f"**{len(drafts)} draft(s)** for this lead")

    status_colors = {"approved": "#10b981", "pending": "#f59e0b", "rejected": "#ef4444", "sent": "#3b82f6"}
    status_icons = {"approved": "🟢", "pending": "🟡", "rejected": "🔴", "sent": "🔵"}

    for d in drafts:
        sc = status_colors.get(d["status"], "#64748b")
        si = status_icons.get(d["status"], "⚪")
        ch_icon = CHANNEL_ICONS.get(d["channel"], "✉️")
        tone_icon = TONE_ICONS.get(d["tone"], "")
        flag = FLAG_MAP.get(d.get("language_code","en"), "🌐")

        with st.expander(f"{si} {ch_icon} {d['channel'].upper()} · {tone_icon} {d['tone'].title()} · {flag} · {d['created_at'][:10]}"):
            edited = st.text_area("Content", value=d["content"], height=170, key=f"all_draft_{d['id']}")
            if d["status"] == "pending":
                ca, cb, cc, cd = st.columns(4)
                ca.button("✅ Approve", key=f"app_all_{d['id']}", type="primary")
                cb.button("❌ Reject", key=f"rej_all_{d['id']}")
                cc.button("💾 Save Edit", key=f"save_all_{d['id']}")
                cd.button("🔄 Regenerate", key=f"regen_{d['id']}")
            else:
                st.markdown(f'<span style="font-size:12px;color:{sc};font-weight:600">Status: {d["status"].title()}</span>', unsafe_allow_html=True)
