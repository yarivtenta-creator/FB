import streamlit as st
from app.frontend.mock_data import ADSPOWER_PROFILES, LEADS


def show():
    st.markdown('<div class="page-header"><h1>🖥 AdsPower Settings</h1><p class="page-subtitle">Manage browser profile integration for manual outreach workflows</p></div>', unsafe_allow_html=True)

    # ── Connection status header ─────────────────────────────────
    connected = st.session_state.get("adspower_connected", True)
    status_text = "Connected" if connected else "Disconnected"
    status_dot = "🟢" if connected else "🔴"
    status_bg = "rgba(16,185,129,0.1)" if connected else "rgba(239,68,68,0.1)"
    status_border = "rgba(16,185,129,0.3)" if connected else "rgba(239,68,68,0.3)"
    status_color = "#10b981" if connected else "#ef4444"

    st.markdown(f"""
    <div style="background:{status_bg};border:1px solid {status_border};border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
        <div>
            <span style="font-size:16px">{status_dot}</span>
            <span style="font-size:15px;font-weight:600;color:{status_color};margin-left:8px">AdsPower {status_text}</span>
            {"<span style='font-size:12px;color:#94a3b8;margin-left:12px'>http://local.adspower.net:50325 · API v2</span>" if connected else ""}
        </div>
        <div style="display:flex;gap:10px;align-items:center">
            {'<span style="font-size:12px;color:#10b981">4 profiles available</span>' if connected else ''}
        </div>
    </div>
    """, unsafe_allow_html=True)

    tab_conn, tab_profiles, tab_safety = st.tabs(["🔌 Connection", "👤 Profile Mapping", "🛡 Safety Rules"])

    with tab_conn:
        _connection_tab(connected)

    with tab_profiles:
        _profiles_tab(connected)

    with tab_safety:
        _safety_tab()


def _connection_tab(connected):
    col_form, col_status = st.columns([2, 1])

    with col_form:
        st.markdown("### API Configuration")
        with st.form("adspower_config"):
            enabled = st.toggle("Enable AdsPower Integration", value=connected)
            base_url = st.text_input("Base URL", value="http://local.adspower.net:50325")
            api_key = st.text_input("API Key", value="••••••••••••••••", type="password")
            col_v, _ = st.columns([1, 3])
            api_version = col_v.selectbox("API Version", ["v2"], index=0)
            if st.form_submit_button("💾 Save Settings", type="primary"):
                st.session_state["adspower_connected"] = enabled
                st.success("Settings saved.")

        if st.button("🔌 Test Connection"):
            with st.spinner("Testing connection..."):
                import time; time.sleep(0.8)
            if connected:
                st.success("✅ Connected successfully — 4 profiles found")
            else:
                st.error("❌ Connection failed — Is AdsPower running?")

    with col_status:
        st.markdown("### System Status")
        status_items = [
            ("AdsPower App", "Running", "#10b981"),
            ("Local API", "Active" if connected else "Inactive", "#10b981" if connected else "#ef4444"),
            ("API Key", "Valid" if connected else "Not set", "#10b981" if connected else "#64748b"),
            ("Profiles", "4 loaded" if connected else "—", "#6366f1" if connected else "#64748b"),
            ("Automation", "Disabled", "#f59e0b"),
        ]
        for item, val, color in status_items:
            st.markdown(f"""
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <span style="font-size:13px;color:#94a3b8">{item}</span>
                <span style="font-size:13px;color:{color};font-weight:500">{val}</span>
            </div>""", unsafe_allow_html=True)


def _profiles_tab(connected):
    if not connected:
        st.info("Enable AdsPower connection to view and manage profiles.")
        return

    st.markdown("### Available Browser Profiles")
    st.markdown(f'<div style="font-size:13px;color:#64748b;margin-bottom:12px">{len(ADSPOWER_PROFILES)} profiles loaded from AdsPower</div>', unsafe_allow_html=True)

    for p in ADSPOWER_PROFILES:
        status_dot = "🟢" if p["status"] == "open" else "⚫"
        lead_link = p.get("linked_lead")
        linked_label = f"Linked: {lead_link}" if lead_link else "Not linked to a lead"
        linked_color = "#6366f1" if lead_link else "#64748b"

        with st.container():
            cols = st.columns([3, 2, 1, 1, 1])
            cols[0].markdown(f"""
            <div style="padding:8px 0">
                <div style="font-size:13.5px;font-weight:600;color:#f1f5f9">{status_dot} {p['name']}</div>
                <div style="font-size:11px;color:#64748b;margin-top:1px">ID: {p['user_id']} · Last: {p['last_used'][:10]}</div>
            </div>""", unsafe_allow_html=True)
            cols[1].markdown(f'<div style="padding:12px 0;font-size:12px;color:{linked_color}">{linked_label}</div>', unsafe_allow_html=True)
            cols[2].button("▶ Open", key=f"ap_open_{p['user_id']}", disabled=p["status"]=="open")
            cols[3].button("■ Close", key=f"ap_close_{p['user_id']}", disabled=p["status"]=="closed")
            if p["status"] == "open":
                cols[4].markdown('<span style="color:#10b981;font-size:11px;padding-top:14px;display:block">OPEN</span>', unsafe_allow_html=True)
            st.markdown('<hr style="border-color:rgba(255,255,255,0.04);margin:4px 0">', unsafe_allow_html=True)

    st.markdown("### Assign Profile to Lead")
    c1, c2, c3 = st.columns([2, 2, 1])
    profile_names = [p["name"] for p in ADSPOWER_PROFILES]
    lead_names = [l["business_name"] for l in LEADS]
    c1.selectbox("Browser Profile", profile_names, label_visibility="collapsed")
    c2.selectbox("Lead", lead_names, label_visibility="collapsed")
    c3.button("Link", use_container_width=True)


def _safety_tab():
    st.markdown("### Safety Rules & Restrictions")
    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:16px">
    """, unsafe_allow_html=True)

    rules = [
        ("✅", "#10b981", "Manual open/close only", "Browser profiles can only be opened or closed by explicit user action."),
        ("✅", "#10b981", "All actions logged", "Every open, close, and link event is logged to the activity feed."),
        ("❌", "#ef4444", "No automated messaging", "The system never sends messages automatically through any profile."),
        ("❌", "#ef4444", "No automated posting", "No social media posting is triggered programmatically."),
        ("❌", "#ef4444", "No automated scraping", "No content is scraped through browser profiles automatically."),
        ("❌", "#ef4444", "No profile creation", "The system cannot create new AdsPower profiles."),
        ("❌", "#ef4444", "No profile deletion", "The system cannot delete AdsPower profiles."),
        ("🔒", "#6366f1", "Automation permanently disabled", "ADSPOWER_AUTOMATION_ALLOWED=false — not configurable from UI."),
    ]

    for icon, color, title, desc in rules:
        st.markdown(f"""
        <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <span style="font-size:16px;flex-shrink:0">{icon}</span>
            <div>
                <div style="font-size:13.5px;font-weight:600;color:{color}">{title}</div>
                <div style="font-size:12px;color:#64748b;margin-top:2px">{desc}</div>
            </div>
        </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)
