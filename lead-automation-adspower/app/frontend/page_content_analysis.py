import streamlit as st
from app.frontend.mock_data import LEADS, CONTENT_ITEMS


def show():
    st.markdown('<div class="page-header"><h1>🔍 Content Analysis</h1><p class="page-subtitle">Analyze website copy, social bios, and screenshots to build lead intelligence</p></div>', unsafe_allow_html=True)

    lead_options = {f"{l['business_name']} (#{l['id']})": l["id"] for l in LEADS}
    presel = st.session_state.get("content_lead_id")
    keys = list(lead_options.keys())
    def_key = next((k for k, v in lead_options.items() if v == presel), keys[0])

    col_sel, col_type = st.columns([2, 1])
    selected_key = col_sel.selectbox("Lead", keys, index=keys.index(def_key), label_visibility="collapsed")
    lead_id = lead_options[selected_key]
    lead = next(l for l in LEADS if l["id"] == lead_id)

    content_type = col_type.selectbox("Content Type",
        ["🌐 Website", "📱 Instagram", "📘 Facebook", "🎬 Vimeo", "📝 Text", "📸 Screenshot"],
        label_visibility="collapsed")

    st.divider()
    tab1, tab2 = st.tabs(["✍️ Add & Analyze", "📚 Analysis History"])

    with tab1:
        _add_tab(lead, content_type)
    with tab2:
        _history_tab(lead_id)


def _add_tab(lead, content_type):
    col_info, col_links = st.columns([3, 2])

    with col_info:
        st.markdown(f"""
        <div style="background:#1e2130;border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:14px 16px;margin-bottom:14px">
            <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px">Analyzing Lead</div>
            <div style="font-size:16px;font-weight:700;color:#f1f5f9">{lead['business_name']}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">{lead.get('city','')}, {lead.get('country','')} · {lead.get('niche','').replace('_',' ').title()}</div>
        </div>
        """, unsafe_allow_html=True)

    with col_links:
        links = []
        if lead.get("website_url"):
            links.append(f"🌐 [{lead['website_url']}](https://{lead['website_url']})")
        if lead.get("instagram_url"):
            links.append(f"📱 {lead['instagram_url']}")
        if links:
            st.markdown("**Quick Links**")
            for l in links:
                st.markdown(l)

    if "Screenshot" in content_type:
        st.markdown("""
        <div style="border:2px dashed rgba(99,102,241,0.3);border-radius:12px;padding:32px;text-align:center;background:rgba(99,102,241,0.04);margin-bottom:14px">
            <div style="font-size:28px;margin-bottom:8px">📸</div>
            <div style="font-size:14px;color:#94a3b8;margin-bottom:6px">Drop screenshot here or click to upload</div>
            <div style="font-size:12px;color:#64748b">PNG, JPG, WebP · Max 10MB</div>
        </div>
        """, unsafe_allow_html=True)
        uploaded = st.file_uploader("Upload Screenshot", type=["png","jpg","jpeg","webp"], label_visibility="collapsed")
        if uploaded:
            st.image(uploaded, use_container_width=False, width=400)
            if st.button("🤖 Analyze Screenshot"):
                with st.spinner("Analyzing..."):
                    import time; time.sleep(1.0)
                _show_analysis_result({
                    "key_themes": ["Visual content detected", "Creative business"],
                    "tone": "Professional",
                    "opportunities": ["Screenshot captured — manual review recommended"],
                    "pain_points": [],
                    "quality_signals": ["File uploaded successfully"],
                })
    else:
        raw_text = st.text_area(
            "Paste Content",
            height=180,
            placeholder=f"Paste {content_type.split()[-1]} content here (bio, about page, portfolio description, etc.)",
            label_visibility="collapsed",
        )

        col_btn, col_settings = st.columns([1, 3])
        with col_btn:
            analyze_clicked = st.button("🤖 Analyze Content", use_container_width=True, disabled=not raw_text.strip())
        with col_settings:
            st.markdown('<div style="padding-top:6px"><span style="font-size:12px;color:#64748b">AI Mode: <b style="color:#6366f1">Mock</b> · Ollama available</span></div>', unsafe_allow_html=True)

        if analyze_clicked and raw_text.strip():
            with st.spinner("Analyzing content with AI..."):
                import time; time.sleep(1.0)
            _show_analysis_result({
                "key_themes": ["Cinematic storytelling", "Wedding", "Emotion", "Premium quality"],
                "tone": "Warm, aspirational, personal",
                "opportunities": [
                    "Strong emotional brand — personalization will resonate",
                    "No pricing visible — fear of competition",
                    "Booking calendar not shown — friction in conversion",
                ],
                "pain_points": [
                    "No clear differentiator stated",
                    "Call-to-action buried below the fold",
                ],
                "quality_signals": [
                    "Professional copywriting tone",
                    "Clear niche focus on weddings",
                    "Emotion-first messaging",
                ],
            })


def _show_analysis_result(analysis):
    st.success("Analysis complete! Results saved.")
    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin-top:8px">
    <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:14px">🤖 AI Analysis Results</div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**Tone:** {analysis.get('tone','—')}")
        if analysis.get("key_themes"):
            st.markdown("**Key Themes**")
            for t in analysis["key_themes"]:
                st.markdown(f"`{t}`", unsafe_allow_html=False)
        if analysis.get("opportunities"):
            st.markdown("**🚀 Opportunities**")
            for o in analysis["opportunities"]:
                st.markdown(f"✅ {o}")
    with col2:
        if analysis.get("pain_points"):
            st.markdown("**⚠️ Pain Points**")
            for p in analysis["pain_points"]:
                st.markdown(f"⚠️ {p}")
        if analysis.get("quality_signals"):
            st.markdown("**★ Quality Signals**")
            for q in analysis["quality_signals"]:
                st.markdown(f"★ {q}")
    st.markdown("</div>", unsafe_allow_html=True)


def _history_tab(lead_id):
    items = [c for c in CONTENT_ITEMS if c["lead_id"] == lead_id]
    if not items:
        st.info("No content analyzed yet for this lead.")
        return

    st.markdown(f"**{len(items)} content item(s) analyzed**")
    for item in items:
        with st.expander(f"{'🌐' if item['content_type']=='website' else '📱'} {item['content_type'].upper()} — {item['created_at'][:16]}"):
            st.markdown(f'<div style="background:#13151f;border-radius:8px;padding:12px;font-size:13px;color:#94a3b8;margin-bottom:10px">{item["raw_content"][:500]}</div>', unsafe_allow_html=True)
            if isinstance(item.get("analysis"), dict):
                a = item["analysis"]
                c1, c2 = st.columns(2)
                with c1:
                    if a.get("key_themes"):
                        st.markdown("**Themes:** " + " · ".join(f"`{t}`" for t in a["key_themes"][:3]))
                    if a.get("tone"):
                        st.markdown(f"**Tone:** {a['tone']}")
                    for opp in a.get("opportunities", [])[:2]:
                        st.markdown(f"✅ {opp}")
                with c2:
                    for pp in a.get("pain_points", [])[:2]:
                        st.markdown(f"⚠️ {pp}")
                    for qs in a.get("quality_signals", [])[:2]:
                        st.markdown(f"★ {qs}")
            st.button("🗑 Delete", key=f"del_ci_{item['id']}")
