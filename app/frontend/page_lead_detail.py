import streamlit as st
from app.frontend.mock_data import LEADS, PROFILES, CONTENT_ITEMS, DRAFTS, ACTIVITIES, ADSPOWER_PROFILES
from app.frontend.theme import STATUS_COLORS, NICHE_EMOJIS, FLAG_MAP, score_color, CHANNEL_ICONS, TONE_ICONS

PIPELINE_STATUSES = ["New","Reviewed","Approved","Contacted","Replied","Interested","Call Booked","Not Relevant","Do Not Contact"]
NICHE_OPTIONS = ["wedding_video","photography","studio","content_creator","other"]


def show():
    lead_id = st.session_state.get("selected_lead_id", 1)
    lead = next((l for l in LEADS if l["id"] == lead_id), LEADS[0])

    if st.button("← Back to Leads"):
        st.session_state["current_page"] = "Leads"
        st.rerun()

    # ── Lead header ─────────────────────────────────────────────
    score = lead.get("lead_score", 0)
    sc = score_color(score)
    status_c = STATUS_COLORS.get(lead["status"], "#64748b")
    emoji = NICHE_EMOJIS.get(lead.get("niche", "other"), "🎨")
    flag = FLAG_MAP.get(lead.get("language", "en"), "🌐")

    st.markdown(f"""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 24px;margin-bottom:16px">
        <div style="display:flex;align-items:flex-start;gap:20px;justify-content:space-between">
            <div>
                <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:26px">{emoji}</span>
                    <div>
                        <h1 style="margin:0!important;font-size:22px!important;color:#f1f5f9!important">{lead['business_name']}</h1>
                        <div style="font-size:13px;color:#94a3b8;margin-top:3px">{lead.get('contact_name','—')} {flag}  ·  {lead.get('city','—')}, {lead.get('country','—')}</div>
                    </div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px">
                <div style="text-align:center">
                    <div style="font-size:28px;font-weight:800;color:{sc}">{score}</div>
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px">Score</div>
                </div>
                <span style="background:rgba({_hex_rgb(status_c)},0.15);color:{status_c};padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600">{lead['status']}</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    tabs = st.tabs(["📋 Business Info", "🤖 AI Profile", "📄 Content", "✉️ Drafts", "🖥 AdsPower", "⚡ Activity"])

    with tabs[0]:
        _info_tab(lead)
    with tabs[1]:
        _profile_tab(lead)
    with tabs[2]:
        _content_tab(lead)
    with tabs[3]:
        _drafts_tab(lead)
    with tabs[4]:
        _adspower_tab(lead)
    with tabs[5]:
        _activity_tab(lead)


def _info_tab(lead):
    st.markdown("### Business Information")
    with st.form("lead_edit_form"):
        c1, c2, c3 = st.columns(3)
        c1.text_input("Business Name", value=lead.get("business_name",""))
        c2.text_input("Contact Name", value=lead.get("contact_name","") or "")
        niches = ["wedding_video","photography","studio","content_creator","other"]
        ni = niches.index(lead.get("niche","wedding_video")) if lead.get("niche") in niches else 0
        c3.selectbox("Niche", niches, index=ni)

        c4, c5, c6 = st.columns(3)
        c4.text_input("Country", value=lead.get("country","") or "")
        c5.text_input("City", value=lead.get("city","") or "")
        c6.selectbox("Language", ["en","it","fr","de","es"],
                     index=["en","it","fr","de","es"].index(lead.get("language","en")) if lead.get("language") in ["en","it","fr","de","es"] else 0)

        st.markdown("#### Contact")
        c7, c8 = st.columns(2)
        c7.text_input("Email", value=lead.get("email","") or "")
        c8.text_input("Phone", value=lead.get("phone","") or "")

        st.markdown("#### Social & Web")
        c9, c10, c11, c12 = st.columns(4)
        c9.text_input("Website", value=lead.get("website_url","") or "")
        c10.text_input("Instagram", value=lead.get("instagram_url","") or "")
        c11.text_input("Facebook", value=lead.get("facebook_url","") or "")
        c12.text_input("Vimeo", value=lead.get("vimeo_url","") or "")

        st.markdown("#### Pipeline")
        p1, p2, p3 = st.columns(3)
        si = PIPELINE_STATUSES.index(lead.get("status","New")) if lead.get("status") in PIPELINE_STATUSES else 0
        p1.selectbox("Status", PIPELINE_STATUSES, index=si)
        p2.number_input("Lead Score", 0, 100, value=lead.get("lead_score",0))
        p3.selectbox("Best Channel", ["email","dm","comment"],
                     index=["email","dm","comment"].index(lead.get("best_channel","email")))

        st.text_area("Notes", value=lead.get("notes","") or "", height=90)
        if st.form_submit_button("💾 Save Changes", type="primary"):
            st.success("Changes saved. (Frontend demo)")


def _profile_tab(lead):
    profile = PROFILES.get(lead["id"])
    if profile:
        score = profile["score"]
        sc = score_color(score)
        st.markdown(f"""
        <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="flex:1">
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">AI Summary</div>
                    <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0">{profile['summary']}</p>
                </div>
                <div style="text-align:center;margin-left:24px;background:#13151f;border-radius:10px;padding:12px 16px">
                    <div style="font-size:32px;font-weight:800;color:{sc}">{score}</div>
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase">Lead Score</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:4px">{profile['recommended_channel'].upper()}</div>
                </div>
            </div>
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
                <span style="font-size:12px;color:#64748b">Service Type: </span>
                <span style="font-size:12px;color:#f1f5f9;font-weight:500">{profile['service_type']}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**🚀 Opportunities**")
            for opp in profile["opportunities"]:
                st.markdown(f"""<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <span style="color:#10b981;font-size:13px">✓</span>
                    <span style="color:#cbd5e1;font-size:13px">{opp}</span>
                </div>""", unsafe_allow_html=True)
        with col2:
            st.markdown("**⚠️ Pain Points**")
            for pp in profile["pain_points"]:
                st.markdown(f"""<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <span style="color:#f59e0b;font-size:13px">!</span>
                    <span style="color:#cbd5e1;font-size:13px">{pp}</span>
                </div>""", unsafe_allow_html=True)
    else:
        st.info("No AI profile yet. Click **Run Analysis** to generate one.")

    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
    col_run, col_space = st.columns([1, 3])
    with col_run:
        if st.button("🤖 Run AI Analysis", use_container_width=True):
            with st.spinner("Analyzing lead with AI..."):
                import time; time.sleep(1.2)
            st.success("Analysis complete!")
            st.rerun()


def _content_tab(lead):
    st.markdown("### Content Analysis")
    items = [c for c in CONTENT_ITEMS if c["lead_id"] == lead["id"]]

    col_btn, _ = st.columns([1.5, 3])
    with col_btn:
        if st.button("+ Add Content / Analyze"):
            st.session_state["current_page"] = "Content Analysis"
            st.session_state["content_lead_id"] = lead["id"]
            st.rerun()

    if items:
        for item in items:
            with st.expander(f"📝 {item['content_type'].upper()} — {item['created_at'][:10]}"):
                st.markdown(f'<div style="font-size:13px;color:#94a3b8;background:#13151f;border-radius:8px;padding:12px;margin-bottom:12px">{item["raw_content"][:400]}…</div>', unsafe_allow_html=True)
                if isinstance(item.get("analysis"), dict):
                    a = item["analysis"]
                    c1, c2 = st.columns(2)
                    with c1:
                        if a.get("key_themes"):
                            st.markdown("**Themes:** " + " · ".join(f"`{t}`" for t in a["key_themes"]))
                        if a.get("tone"):
                            st.markdown(f"**Tone:** {a['tone']}")
                        for opp in a.get("opportunities", []):
                            st.markdown(f"✅ {opp}")
                    with c2:
                        for pp in a.get("pain_points", []):
                            st.markdown(f"⚠️ {pp}")
                        for qs in a.get("quality_signals", []):
                            st.markdown(f"★ {qs}")
    else:
        st.info("No content analyzed yet for this lead.")


def _drafts_tab(lead):
    st.markdown("### Outreach Drafts")
    drafts = [d for d in DRAFTS if d["lead_id"] == lead["id"]]

    col_gen, _ = st.columns([1.5, 3])
    with col_gen:
        if st.button("✨ Generate Drafts"):
            st.session_state["current_page"] = "Outreach Drafts"
            st.session_state["draft_lead_id"] = lead["id"]
            st.rerun()

    status_icon = {"approved": "🟢", "pending": "🟡", "rejected": "🔴", "sent": "🔵"}
    for d in drafts:
        icon = status_icon.get(d["status"], "⚪")
        ch_icon = CHANNEL_ICONS.get(d["channel"], "✉️")
        tone_icon = TONE_ICONS.get(d["tone"], "")
        with st.expander(f"{icon} {ch_icon} {d['channel'].upper()} · {tone_icon} {d['tone'].title()} · {d['created_at'][:10]}"):
            st.text_area("Draft", value=d["content"], height=160, key=f"draft_ta_{d['id']}", disabled=True)
            colA, colB = st.columns(2)
            if d["status"] == "pending":
                colA.button("✅ Approve", key=f"appr_{d['id']}")
                colB.button("❌ Reject", key=f"rej_{d['id']}")
            else:
                st.caption(f"Status: **{d['status'].title()}**")


def _adspower_tab(lead):
    st.markdown("### AdsPower Browser Profiles")
    linked = [p for p in ADSPOWER_PROFILES if p.get("linked_lead") == lead["business_name"]]

    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:12px 16px;margin-bottom:14px">
        <span style="font-size:12px;color:#f59e0b">⚠️</span>
        <span style="font-size:12px;color:#94a3b8;margin-left:6px">AdsPower integration is active. All browser actions are manual — no automated messaging.</span>
    </div>
    """, unsafe_allow_html=True)

    if linked:
        for p in linked:
            status_dot = "🟢" if p["status"] == "open" else "⚫"
            st.markdown(f"""
            <div style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-size:13.5px;font-weight:600;color:#f1f5f9">{status_dot} {p['name']}</div>
                        <div style="font-size:11px;color:#64748b;margin-top:2px">Last used: {p['last_used']}</div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            c1, c2, c3, _ = st.columns([1,1,1,3])
            c1.button("▶ Open", key=f"open_{p['user_id']}")
            c2.button("■ Close", key=f"close_{p['user_id']}")
            c3.button("Detach", key=f"detach_{p['user_id']}")
    else:
        st.info("No browser profiles linked to this lead.")
        st.button("+ Attach AdsPower Profile")


def _activity_tab(lead):
    st.markdown("### Activity Timeline")
    acts = [a for a in ACTIVITIES if a.get("lead_id") == lead["id"]]

    action_map = {
        "draft_approved": ("✅", "#10b981", "Draft approved"),
        "call_booked": ("📅", "#6366f1", "Call booked"),
        "lead_replied": ("💬", "#8b5cf6", "Lead replied"),
        "outreach_sent": ("📤", "#3b82f6", "Outreach sent"),
        "lead_approved": ("✓", "#10b981", "Lead approved"),
        "ai_analysis_run": ("🤖", "#f59e0b", "AI analysis run"),
        "lead_created": ("➕", "#64748b", "Lead created"),
    }

    if acts:
        for act in acts:
            icon, color, label = action_map.get(act["action"], ("•", "#64748b", act["action"]))
            st.markdown(f"""
            <div style="display:flex;gap:14px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <div style="display:flex;flex-direction:column;align-items:center">
                    <span style="font-size:16px">{icon}</span>
                    <div style="width:1px;flex:1;background:rgba(255,255,255,0.06);margin-top:4px"></div>
                </div>
                <div>
                    <div style="font-size:13.5px;color:#f1f5f9;font-weight:500">{label}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:2px">{act['created_at']}</div>
                </div>
            </div>""", unsafe_allow_html=True)
    else:
        st.info("No activity recorded yet for this lead.")


def _hex_rgb(hex_color):
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return f"{r},{g},{b}"
