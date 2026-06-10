import streamlit as st
from app.frontend.mock_data import TRELLO_BOARDS, TRELLO_CARDS, LEADS
from app.frontend.theme import STATUS_COLORS, score_color
import plotly.graph_objects as go


def show():
    st.markdown('<div class="page-header"><h1>🟦 Trello Integration</h1><p class="page-subtitle">Sync your lead pipeline to Trello boards for team visibility</p></div>', unsafe_allow_html=True)

    tab_status, tab_mapping, tab_preview, tab_setup = st.tabs([
        "📊 Board Status", "🗺 Template Mapping", "👁 Sync Preview", "⚙️ Setup"
    ])

    with tab_status:
        _board_status_tab()
    with tab_mapping:
        _mapping_tab()
    with tab_preview:
        _preview_tab()
    with tab_setup:
        _setup_tab()


def _board_status_tab():
    board = TRELLO_BOARDS[0]
    connected = board["status"] == "connected"
    sc = "#10b981" if connected else "#ef4444"
    dot = "🟢" if connected else "🔴"

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Board Status", "Connected" if connected else "Disconnected")
    c2.metric("Active Cards", board["cards"])
    c3.metric("Pipeline Lists", board["lists"])
    c4.metric("Last Sync", board["last_sync"][11:16] + " today")

    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)

    st.markdown(f"""
    <div style="background:#1e2130;border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:18px 20px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <div style="font-size:16px;font-weight:700;color:#f1f5f9">🟦 {board['name']}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px">Board ID: {board['id']} · {board['cards']} cards · {board['lists']} lists</div>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
                <span style="font-size:13px;font-weight:600;color:{sc}">{dot} {board['status'].title()}</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    col_sync, col_open, _ = st.columns([1, 1, 3])
    with col_sync:
        if st.button("🔄 Sync Now", use_container_width=True):
            with st.spinner("Syncing to Trello..."):
                import time; time.sleep(0.9)
            st.success("Synced 12 cards to Trello.")
    with col_open:
        st.button("🔗 Open Board", use_container_width=True)

    st.markdown("### Workspace Status")
    workspace_items = [
        ("Trello Connection", "Active", "#10b981"),
        ("OAuth Token", "Valid", "#10b981"),
        ("Board Access", "Read/Write", "#10b981"),
        ("Auto-sync", "Disabled", "#f59e0b"),
        ("Webhook Callback", "Not configured", "#64748b"),
        ("Last Error", "None", "#10b981"),
    ]
    cols = st.columns(2)
    for i, (label, val, color) in enumerate(workspace_items):
        with cols[i % 2]:
            st.markdown(f"""
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <span style="font-size:13px;color:#94a3b8">{label}</span>
                <span style="font-size:13px;color:{color};font-weight:500">{val}</span>
            </div>""", unsafe_allow_html=True)


def _mapping_tab():
    st.markdown("### Pipeline → Trello List Mapping")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:16px">Each pipeline status maps to a Trello list. Cards move automatically when status changes.</div>', unsafe_allow_html=True)

    statuses = [
        ("New", "🆕 New Leads", "#6366f1"),
        ("Reviewed", "🔍 Under Review", "#94a3b8"),
        ("Approved", "✅ Approved", "#10b981"),
        ("Contacted", "📤 Contacted", "#3b82f6"),
        ("Replied", "💬 Replied", "#8b5cf6"),
        ("Interested", "🌟 Interested", "#f59e0b"),
        ("Call Booked", "📅 Call Booked", "#10b981"),
        ("Not Relevant", "🚫 Not Relevant", "#ef4444"),
        ("Do Not Contact", "⛔ Do Not Contact", "#ef4444"),
    ]

    for status, trello_list, color in statuses:
        col1, col2, col3, col4 = st.columns([2, 0.4, 2, 1])
        col1.markdown(f'<div style="padding:10px 12px;background:#13151f;border-radius:8px;font-size:13px;font-weight:600;color:{color}">{status}</div>', unsafe_allow_html=True)
        col2.markdown('<div style="text-align:center;padding-top:8px;font-size:18px;color:#64748b">→</div>', unsafe_allow_html=True)
        col3.markdown(f'<div style="padding:10px 12px;background:#1a1f31;border:1px solid rgba(99,102,241,0.2);border-radius:8px;font-size:13px;color:#94a3b8">{trello_list}</div>', unsafe_allow_html=True)
        col4.markdown('<div style="padding:8px 0"><span style="font-size:11px;color:#10b981">✓ Active</span></div>', unsafe_allow_html=True)

    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
    st.markdown("### Data Privacy Rules")
    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:16px">
    """, unsafe_allow_html=True)
    privacy_items = [
        ("✅ Synced to Trello", ["Business name", "City/Country", "Niche label", "Lead score", "Pipeline status", "Next action date"]),
        ("❌ Never sent to Trello", ["Email addresses", "Phone numbers", "Draft content (full text)", "AI analysis details", "AdsPower profile IDs", "Compliance notes (DNC, opt-out)"]),
    ]
    c1, c2 = st.columns(2)
    for i, (heading, items) in enumerate(privacy_items):
        with [c1, c2][i]:
            color = "#10b981" if "✅" in heading else "#ef4444"
            st.markdown(f'<div style="font-size:13px;font-weight:600;color:{color};margin-bottom:8px">{heading}</div>', unsafe_allow_html=True)
            for item in items:
                st.markdown(f'<div style="font-size:12px;color:#94a3b8;padding:3px 0">• {item}</div>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)


def _preview_tab():
    st.markdown("### Trello Sync Preview")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:14px">This is what will be synced to Trello on the next sync. No PII included.</div>', unsafe_allow_html=True)

    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px">
    <div style="font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:12px">📋 Cards to be synced</div>
    """, unsafe_allow_html=True)

    for card in TRELLO_CARDS:
        sc = score_color(card["score"])
        status_color = STATUS_COLORS.get(card["list"].replace(" Leads","").replace("Under Review","Reviewed").replace("Call Booked","Call Booked"), "#64748b")
        st.markdown(f"""
        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div>
                <span style="font-size:13.5px;font-weight:600;color:#f1f5f9">{card['lead']}</span>
                <span style="margin-left:8px;background:rgba(99,102,241,0.15);color:#818cf8;padding:2px 8px;border-radius:12px;font-size:11px">{card['list']}</span>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
                <span style="font-size:11px;color:#64748b">Due: {card['due']}</span>
                <span style="font-size:13px;font-weight:700;color:{sc}">{card['score']}</span>
            </div>
        </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)
    col_sync, _ = st.columns([1, 4])
    with col_sync:
        if st.button("🔄 Run Sync Preview", use_container_width=True):
            with st.spinner("Generating sync preview..."):
                import time; time.sleep(0.6)
            st.success(f"Preview ready: {len(TRELLO_CARDS)} cards will be synced.")


def _setup_tab():
    st.markdown("### Trello Board Setup")
    st.info("Trello integration is available in **Scripto SaaS (Phase 2)**. Configuration shown below is for planning purposes.")

    with st.form("trello_config"):
        st.markdown("#### Connection")
        c1, c2 = st.columns(2)
        c1.text_input("Trello API Key", placeholder="Get from https://trello.com/app-key")
        c2.text_input("Trello Token", type="password", placeholder="OAuth token")
        st.markdown("#### Board Settings")
        c3, c4 = st.columns(2)
        pipeline_board = c3.text_input("Pipeline Board ID", placeholder="e.g. abc123")
        approval_board = c4.text_input("Approval Board ID (optional)", placeholder="e.g. xyz789")
        auto_sync = st.checkbox("Auto-sync on approval decision", value=False)
        st.markdown("#### Privacy")
        st.markdown('<div style="font-size:12px;color:#64748b">Email, phone, draft content, and compliance data will never be synced to Trello.</div>', unsafe_allow_html=True)
        if st.form_submit_button("💾 Save Trello Config", type="primary"):
            st.info("Trello config saved (Phase 2 will activate this).")
