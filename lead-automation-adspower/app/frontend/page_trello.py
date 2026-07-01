import streamlit as st
from app.frontend.mock_data import TRELLO_BOARDS, TRELLO_CARDS, LEADS
from app.frontend.theme import STATUS_COLORS, score_color
from app.services.trello_service import get_sync_status, sync_all_leads
from app.database.db import get_setting, set_setting
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
    sync_status = get_sync_status()
    health = sync_status.get("health", {})
    enabled = sync_status.get("enabled", False)
    health_status = health.get("status", "disabled")
    connected = health_status == "connected"
    sc = "#10b981" if connected else ("#f59e0b" if enabled else "#ef4444")
    dot = "🟢" if connected else ("🟡" if enabled else "🔴")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Board Status", "Connected" if connected else ("Enabled" if enabled else "Disabled"))
    c2.metric("Trello Enabled", "Yes" if enabled else "No")
    c3.metric("Board ID", sync_status.get("board_id") or "Not set")
    c4.metric("AI Mode", "Live" if connected else "Offline")

    st.markdown("<div style='height:12px'></div>", unsafe_allow_html=True)

    board_id = sync_status.get("board_id", "—")
    st.markdown(f"""
    <div style="background:#1e2130;border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:18px 20px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <div style="font-size:16px;font-weight:700;color:#f1f5f9">🟦 Trello Pipeline Board</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px">Board ID: {board_id}</div>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
                <span style="font-size:13px;font-weight:600;color:{sc}">{dot} {health_status.title()}</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    col_sync, col_open, _ = st.columns([1, 1, 3])
    with col_sync:
        if st.button("🔄 Sync Now", use_container_width=True):
            with st.spinner("Syncing to Trello..."):
                result = sync_all_leads()
            if result.get("errors"):
                st.warning(f"Synced {result['synced']}/{result['total']} leads. {len(result['errors'])} errors.")
            else:
                if result['synced'] == 0 and not enabled:
                    st.info("Trello is disabled. Enable it in the Setup tab.")
                else:
                    st.success(f"Synced {result['synced']} leads to Trello.")
    with col_open:
        st.button("🔗 Open Board", use_container_width=True)

    st.markdown("### Workspace Status")
    workspace_items = [
        ("Trello Integration", "Enabled" if enabled else "Disabled", "#10b981" if enabled else "#ef4444"),
        ("Connection Status", health_status.title(), "#10b981" if connected else "#f59e0b"),
        ("API Key", "Set" if get_setting("trello_api_key") else "Not set", "#10b981" if get_setting("trello_api_key") else "#ef4444"),
        ("Token", "Set" if get_setting("trello_token") else "Not set", "#10b981" if get_setting("trello_token") else "#ef4444"),
        ("Board ID", "Set" if get_setting("trello_board_id") else "Not set", "#10b981" if get_setting("trello_board_id") else "#f59e0b"),
        ("Last Error", health.get("message", "None"), "#64748b"),
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

    trello_enabled = get_setting("trello_enabled", "false").lower() == "true"
    enabled_toggle = st.toggle("Enable Trello Integration", value=trello_enabled)

    with st.form("trello_config"):
        st.markdown("#### Connection")
        c1, c2 = st.columns(2)
        api_key = c1.text_input("Trello API Key", value=get_setting("trello_api_key", ""), placeholder="Get from https://trello.com/app-key")
        token = c2.text_input("Trello Token", value=get_setting("trello_token", ""), type="password", placeholder="OAuth token")
        st.markdown("#### Board Settings")
        board_id = st.text_input("Pipeline Board ID", value=get_setting("trello_board_id", ""), placeholder="e.g. abc123")
        st.markdown("#### Privacy")
        st.markdown('<div style="font-size:12px;color:#64748b">Email, phone, draft content, and compliance data will never be synced to Trello.</div>', unsafe_allow_html=True)
        if st.form_submit_button("💾 Save Trello Config", type="primary"):
            set_setting("trello_enabled", "true" if enabled_toggle else "false")
            set_setting("trello_api_key", api_key)
            set_setting("trello_token", token)
            set_setting("trello_board_id", board_id)
            st.success("Trello configuration saved.")
            st.rerun()

    if st.button("🔌 Test Trello Connection", key="trello_test_btn"):
        key = get_setting("trello_api_key", "")
        tok = get_setting("trello_token", "")
        if not key or not tok:
            st.error("Please save API Key and Token first.")
        else:
            try:
                import requests
                r = requests.get("https://api.trello.com/1/members/me",
                                 params={"key": key, "token": tok}, timeout=5)
                if r.status_code == 200:
                    st.success(f"Connected as {r.json().get('fullName', 'unknown')}")
                else:
                    st.error(f"Trello returned {r.status_code}")
            except Exception as e:
                st.error(f"Cannot reach Trello: {e}")
