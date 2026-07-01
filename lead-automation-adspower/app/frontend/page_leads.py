import streamlit as st
from app.frontend.mock_data import LEADS, ACTIVITIES
from app.frontend.theme import STATUS_COLORS, NICHE_EMOJIS, FLAG_MAP, score_color, status_badge

PIPELINE_STATUSES = ["New", "Reviewed", "Approved", "Contacted", "Replied",
                     "Interested", "Call Booked", "Not Relevant", "Do Not Contact"]
NICHE_OPTIONS = ["wedding_video", "photography", "studio", "content_creator", "other"]
COUNTRIES = sorted(set(l["country"] for l in LEADS))
LANGUAGES = sorted(set(l.get("language", "en") for l in LEADS))


def show():
    st.markdown('<div class="page-header"><h1>👥 Leads</h1><p class="page-subtitle">Manage and track your outreach pipeline</p></div>', unsafe_allow_html=True)

    # ── Action bar ──────────────────────────────────────────────
    col_search, col_add, col_import, col_export = st.columns([3, 1, 1, 1])
    with col_search:
        search = st.text_input("", placeholder="🔍  Search business, contact, email...", label_visibility="collapsed")
    with col_add:
        if st.button("+ Add Lead", use_container_width=True):
            st.session_state["show_add_form"] = not st.session_state.get("show_add_form", False)
    with col_import:
        st.button("⬆ Import CSV", use_container_width=True)
    with col_export:
        st.button("⬇ Export CSV", use_container_width=True)

    # ── Filter bar ──────────────────────────────────────────────
    fc1, fc2, fc3, fc4, fc5 = st.columns(5)
    status_f = fc1.selectbox("Status", ["All"] + PIPELINE_STATUSES, label_visibility="collapsed")
    niche_f = fc2.selectbox("Niche", ["All"] + NICHE_OPTIONS, label_visibility="collapsed")
    country_f = fc3.selectbox("Country", ["All"] + COUNTRIES, label_visibility="collapsed")
    lang_f = fc4.selectbox("Language", ["All"] + LANGUAGES, label_visibility="collapsed")
    score_min = fc5.number_input("Min Score", 0, 100, 0, step=10, label_visibility="collapsed")

    # ── Add form ────────────────────────────────────────────────
    if st.session_state.get("show_add_form"):
        _show_add_form()

    # ── Filter leads ────────────────────────────────────────────
    filtered = _filter_leads(LEADS, search, status_f, niche_f, country_f, lang_f, score_min)

    # ── Stats bar ───────────────────────────────────────────────
    st.markdown(f"""
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <div class="stat-pill"><span style="color:#6366f1">●</span> {len(filtered)} leads shown</div>
        <div class="stat-pill"><span style="color:#10b981">●</span> {sum(1 for l in filtered if l['lead_score'] >= 70)} high score (70+)</div>
        <div class="stat-pill"><span style="color:#f59e0b">●</span> {sum(1 for l in filtered if l['status'] == 'New')} new</div>
    </div>
    """, unsafe_allow_html=True)

    if not filtered:
        st.info("No leads match your filters.")
        return

    # ── Table header ────────────────────────────────────────────
    st.markdown("""
    <div style="display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr 0.8fr 0.8fr 0.7fr;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;">
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Business</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Status</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Niche</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Location</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Score</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Channel</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px">Action</span>
    </div>
    """, unsafe_allow_html=True)

    for lead in filtered:
        _render_lead_row(lead)


def _render_lead_row(lead):
    score = lead.get("lead_score", 0)
    sc = score_color(score)
    status_c = STATUS_COLORS.get(lead["status"], "#64748b")
    emoji = NICHE_EMOJIS.get(lead.get("niche", "other"), "🎨")
    flag = FLAG_MAP.get(lead.get("language", "en"), "🌐")
    channel_icon = {"email": "✉️", "dm": "💬", "comment": "💭"}.get(lead.get("best_channel", "email"), "✉️")

    with st.container():
        cols = st.columns([2.5, 1, 1, 1, 0.8, 0.8, 0.7])
        with cols[0]:
            st.markdown(f"""
            <div style="padding:10px 0 10px 2px">
                <div style="font-size:13.5px;font-weight:600;color:#f1f5f9">{lead['business_name']}</div>
                <div style="font-size:12px;color:#64748b;margin-top:1px">{lead.get('contact_name','—')} {flag}</div>
            </div>""", unsafe_allow_html=True)
        with cols[1]:
            st.markdown(f"""<div style="padding:14px 0 0">
                <span style="background:rgba({_hex_rgb(status_c)},0.15);color:{status_c};padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600">{lead['status']}</span>
            </div>""", unsafe_allow_html=True)
        with cols[2]:
            st.markdown(f'<div style="padding:16px 0 0;font-size:13px;color:#94a3b8">{emoji} {lead.get("niche","").replace("_"," ").title()}</div>', unsafe_allow_html=True)
        with cols[3]:
            st.markdown(f'<div style="padding:16px 0 0;font-size:12px;color:#94a3b8">{lead.get("city","—")}, {lead.get("country","—")}</div>', unsafe_allow_html=True)
        with cols[4]:
            st.markdown(f"""<div style="padding:10px 0 0">
                <div style="font-size:15px;font-weight:700;color:{sc}">{score}</div>
                <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:3px;overflow:hidden">
                    <div style="width:{score}%;height:100%;background:{sc};border-radius:2px"></div>
                </div>
            </div>""", unsafe_allow_html=True)
        with cols[5]:
            st.markdown(f'<div style="padding:16px 0 0;font-size:13px;color:#94a3b8">{channel_icon} {lead.get("best_channel","").title()}</div>', unsafe_allow_html=True)
        with cols[6]:
            if st.button("View →", key=f"view_lead_{lead['id']}"):
                st.session_state["selected_lead_id"] = lead["id"]
                st.session_state["current_page"] = "Lead Detail"
                st.rerun()
        st.markdown('<hr style="border-color:rgba(255,255,255,0.04);margin:0">', unsafe_allow_html=True)


def _filter_leads(leads, search, status_f, niche_f, country_f, lang_f, score_min):
    result = leads
    if search:
        q = search.lower()
        result = [l for l in result if q in l.get("business_name","").lower()
                  or q in l.get("contact_name","").lower()
                  or q in l.get("email","").lower()]
    if status_f != "All":
        result = [l for l in result if l["status"] == status_f]
    if niche_f != "All":
        result = [l for l in result if l.get("niche") == niche_f]
    if country_f != "All":
        result = [l for l in result if l.get("country") == country_f]
    if lang_f != "All":
        result = [l for l in result if l.get("language") == lang_f]
    if score_min > 0:
        result = [l for l in result if l.get("lead_score", 0) >= score_min]
    return result


def _hex_rgb(hex_color):
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return f"{r},{g},{b}"


def _show_add_form():
    with st.container():
        st.markdown('<div class="sdr-card" style="margin-bottom:16px">', unsafe_allow_html=True)
        st.markdown("### Add New Lead")
        with st.form("add_lead_form_main", clear_on_submit=True):
            c1, c2, c3 = st.columns(3)
            business_name = c1.text_input("Business Name *")
            contact_name = c2.text_input("Contact Name")
            niche = c3.selectbox("Niche", NICHE_OPTIONS)
            c4, c5, c6 = st.columns(3)
            country = c4.text_input("Country")
            city = c5.text_input("City")
            language = c6.selectbox("Language", ["en","it","fr","de","es"])
            c7, c8, c9 = st.columns(3)
            email = c7.text_input("Email")
            website = c8.text_input("Website URL")
            instagram = c9.text_input("Instagram URL")
            notes = st.text_area("Notes", height=80)
            col_save, col_cancel = st.columns([1, 5])
            saved = col_save.form_submit_button("Save Lead", type="primary")
            if saved:
                if not business_name:
                    st.error("Business name is required.")
                else:
                    st.success(f"Lead '{business_name}' added. (Frontend demo — data not persisted)")
                    st.session_state["show_add_form"] = False
        st.markdown('</div>', unsafe_allow_html=True)
