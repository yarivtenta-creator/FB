import streamlit as st
from pathlib import Path
from app.frontend.mock_data import get_pipeline_stats


NAV_ITEMS = [
    ("Dashboard", "📊", "Dashboard"),
    ("Leads", "👥", "Leads"),
    ("Content Analysis", "🔍", "Content Analysis"),
    ("Outreach Drafts", "✉️", "Outreach Drafts"),
    ("Approval Queue", "✅", "Approval Queue"),
    ("Scripto", "🌍", "Scripto"),
    ("Trello", "🟦", "Trello"),
    ("AdsPower", "🖥", "AdsPower"),
    ("Settings", "⚙️", "Settings"),
]


def show_sidebar():
    with st.sidebar:
        _logo_section()
        _nav_section()
        _status_footer()


def _logo_section():
    logo_path = Path(__file__).parent.parent / "assets" / "logo.svg"
    st.markdown("""
    <div style="padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🎬</div>
            <div>
                <div style="font-size:10px;font-weight:700;color:#6366f1;letter-spacing:2px;text-transform:uppercase">EDIT VALUE</div>
                <div style="font-size:13px;font-weight:800;color:#f1f5f9;letter-spacing:0.3px">Local SDR Mini</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


def _nav_section():
    current_page = st.session_state.get("current_page", "Dashboard")
    stats = get_pipeline_stats()

    st.markdown('<div style="padding:10px 8px 4px">', unsafe_allow_html=True)

    nav_groups = [
        ("PIPELINE", ["Dashboard", "Leads"]),
        ("OUTREACH", ["Content Analysis", "Outreach Drafts", "Approval Queue"]),
        ("PLATFORM", ["Scripto", "Trello"]),
        ("SYSTEM", ["AdsPower", "Settings"]),
    ]

    for group_label, pages in nav_groups:
        st.markdown(f'<div style="font-size:10px;color:#475569;font-weight:600;letter-spacing:1.2px;padding:12px 12px 4px;text-transform:uppercase">{group_label}</div>', unsafe_allow_html=True)
        for page_name, icon, _ in NAV_ITEMS:
            if page_name not in pages:
                continue
            is_active = current_page == page_name
            active_bg = "background:rgba(99,102,241,0.15);color:#818cf8;" if is_active else "background:transparent;color:#94a3b8;"
            active_border = "border-left:3px solid #6366f1;" if is_active else "border-left:3px solid transparent;"

            # Badge for approval queue
            badge = ""
            if page_name == "Approval Queue" and stats.get("pending_drafts", 0) > 0:
                badge = f'<span style="background:#ef4444;color:white;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:auto">{stats["pending_drafts"]}</span>'

            st.markdown(f"""
            <div style="{active_bg}{active_border}border-radius:8px;padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:1px;font-size:13.5px;font-weight:{'600' if is_active else '400'};transition:all 0.15s">
                <span style="font-size:15px">{icon}</span>
                <span>{page_name}</span>
                {badge}
            </div>""", unsafe_allow_html=True)

            if st.button(page_name, key=f"nav_{page_name}", use_container_width=True,
                         help=f"Navigate to {page_name}"):
                st.session_state["current_page"] = page_name
                st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)


def _status_footer():
    ai_mode = st.session_state.get("ai_mode", "mock")
    adspower_on = st.session_state.get("adspower_connected", False)
    ai_color = "#6366f1" if ai_mode == "ollama" else "#94a3b8"
    ads_color = "#10b981" if adspower_on else "#64748b"
    ads_text = "ON" if adspower_on else "OFF"

    st.markdown(f"""
    <div style="position:fixed;bottom:0;left:0;width:240px;padding:12px 16px;border-top:1px solid rgba(255,255,255,0.06);background:#13151f">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;color:{ai_color}">⚡ AI: {ai_mode.upper()}</span>
            <span style="font-size:11px;color:{ads_color}">AdsPower: {ads_text}</span>
        </div>
        <div style="font-size:10px;color:#334155;margin-top:4px;text-align:center">v1.0.0-phase1</div>
    </div>
    """, unsafe_allow_html=True)
