"""
Setup Wizard — first-run onboarding.
Shown when setup_complete setting is not "true".
"""
import streamlit as st
from app.database.db import get_setting, set_setting


STEPS = [
    "Welcome",
    "Your Details",
    "AI Engine",
    "AdsPower",
    "Trello",
    "Done",
]


def show():
    st.markdown("""
    <style>
    .wizard-header { text-align: center; padding: 24px 0 8px; }
    .wizard-header h1 { font-size: 28px; color: #f1f5f9; margin-bottom: 6px; }
    .wizard-header p { color: #64748b; font-size: 15px; }
    .step-indicator { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
    .step-dot { width: 10px; height: 10px; border-radius: 50%; background: #334155; display: inline-block; }
    .step-dot.active { background: #6366f1; }
    .step-dot.done { background: #10b981; }
    </style>
    """, unsafe_allow_html=True)

    if "wizard_step" not in st.session_state:
        st.session_state["wizard_step"] = 0

    step = st.session_state["wizard_step"]

    # Progress indicator
    dots = ""
    for i, s in enumerate(STEPS):
        if i < step:
            dots += '<span class="step-dot done"></span>'
        elif i == step:
            dots += '<span class="step-dot active"></span>'
        else:
            dots += '<span class="step-dot"></span>'

    st.markdown(f'<div class="step-indicator">{dots}</div>', unsafe_allow_html=True)
    st.markdown(f'<div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:16px">Step {step + 1} of {len(STEPS)} — {STEPS[step]}</div>', unsafe_allow_html=True)

    _, col, _ = st.columns([1, 2, 1])
    with col:
        if step == 0:
            _step_welcome()
        elif step == 1:
            _step_details()
        elif step == 2:
            _step_ai()
        elif step == 3:
            _step_adspower()
        elif step == 4:
            _step_trello()
        elif step == 5:
            _step_done()


def _nav_buttons(back=True, next_label="Next →", next_key="wiz_next"):
    col_back, col_next = st.columns([1, 2])
    with col_next:
        if st.button(next_label, key=next_key, type="primary", use_container_width=True):
            return True
    with col_back:
        if back:
            if st.button("← Back", key=f"wiz_back_{next_key}", use_container_width=True):
                st.session_state["wizard_step"] -= 1
                st.rerun()
    return False


def _step_welcome():
    st.markdown("""
    <div style="text-align:center;padding:24px 0">
        <div style="font-size:48px">🎬</div>
        <h2 style="color:#f1f5f9;margin:12px 0 8px">Welcome to Edit Value</h2>
        <h3 style="color:#6366f1;margin:0 0 16px;font-weight:500">Local SDR Mini</h3>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7">
            Your local AI-powered Sales Development Representative.<br>
            Find creative business leads, analyse their profiles, generate personalised<br>
            multilingual outreach drafts, and manage your approval pipeline — all offline.
        </p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("**In this setup wizard you will:**")
    items = [
        "Set your sender name and workspace",
        "Choose your AI engine (Mock or Ollama)",
        "Optionally connect AdsPower for browser profiles",
        "Optionally connect Trello for pipeline visibility",
    ]
    for item in items:
        st.markdown(f"- {item}")
    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)
    if _nav_buttons(back=False, next_label="Let's Get Started →", next_key="wiz_start"):
        st.session_state["wizard_step"] = 1
        st.rerun()


def _step_details():
    st.markdown("### Your Details")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:16px">Tell us about your workspace.</div>', unsafe_allow_html=True)

    workspace_name = st.text_input(
        "Workspace Name",
        value=get_setting("workspace_name", "Edit Value — SDR Workspace"),
        placeholder="e.g. Edit Value — SDR",
    )
    sender_name = st.text_input(
        "Your Sender Name",
        value=get_setting("sender_name", ""),
        placeholder="e.g. Marco Rossi",
    )
    lang_options = ["en", "it", "fr", "de", "es"]
    lang_labels = {"en": "English", "it": "Italian", "fr": "French", "de": "German", "es": "Spanish"}
    default_lang = get_setting("default_language", "en")
    lang_idx = lang_options.index(default_lang) if default_lang in lang_options else 0
    default_language = st.selectbox(
        "Default Language",
        options=lang_options,
        index=lang_idx,
        format_func=lambda x: lang_labels.get(x, x),
    )

    if _nav_buttons(next_label="Next →", next_key="wiz_details_next"):
        set_setting("workspace_name", workspace_name)
        set_setting("sender_name", sender_name)
        set_setting("default_language", default_language)
        st.session_state["wizard_step"] = 2
        st.rerun()


def _step_ai():
    st.markdown("### AI Engine")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:16px">Choose how to power draft generation.</div>', unsafe_allow_html=True)

    ai_mode = st.radio(
        "AI Mode",
        options=["mock", "ollama"],
        index=0 if get_setting("ai_mode", "mock") == "mock" else 1,
        format_func=lambda x: "Mock AI (instant, no setup required)" if x == "mock" else "Ollama (local LLM, requires Ollama installed)",
        label_visibility="collapsed",
    )

    if ai_mode == "ollama":
        ollama_url = st.text_input("Ollama Base URL", value=get_setting("ollama_base_url", "http://localhost:11434"))
        ollama_model = st.text_input("Model", value=get_setting("ollama_model", "llama3.2"))
        if st.button("🔌 Test Ollama Connection", key="wiz_test_ollama"):
            try:
                import requests
                r = requests.get(f"{ollama_url}/api/tags", timeout=3)
                if r.status_code == 200:
                    st.success("Ollama is running and reachable.")
                else:
                    st.error(f"Ollama returned status {r.status_code}.")
            except Exception as e:
                st.error(f"Cannot reach Ollama: {e}")
    else:
        ollama_url = get_setting("ollama_base_url", "http://localhost:11434")
        ollama_model = get_setting("ollama_model", "llama3.2")
        st.info("Mock AI uses template-based responses. No internet or local model required.")

    if _nav_buttons(next_label="Next →", next_key="wiz_ai_next"):
        set_setting("ai_mode", ai_mode)
        set_setting("ollama_base_url", ollama_url)
        set_setting("ollama_model", ollama_model)
        st.session_state["wizard_step"] = 3
        st.rerun()


def _step_adspower():
    st.markdown("### AdsPower Integration")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:16px">AdsPower lets you manage browser profiles for each lead. Optional — skip if not needed.</div>', unsafe_allow_html=True)

    ads_enabled = st.toggle(
        "Enable AdsPower",
        value=get_setting("adspower_enabled", "false").lower() == "true",
    )
    ads_url = ""
    ads_key = ""
    if ads_enabled:
        ads_url = st.text_input("AdsPower Base URL", value=get_setting("adspower_base_url", "http://local.adspower.net:50325"))
        ads_key = st.text_input("AdsPower API Key", value=get_setting("adspower_api_key", ""), type="password")
        if st.button("🔌 Test AdsPower Connection", key="wiz_test_ads"):
            try:
                import requests
                r = requests.get(f"{ads_url}/status", timeout=3)
                if r.status_code == 200:
                    st.success("AdsPower is reachable.")
                else:
                    st.warning("AdsPower responded but returned an unexpected status.")
            except Exception:
                st.error("Cannot reach AdsPower. Make sure the app is running.")
    else:
        st.info("Skip this step — you can enable AdsPower later in Settings.")
        ads_url = get_setting("adspower_base_url", "http://local.adspower.net:50325")
        ads_key = get_setting("adspower_api_key", "")

    if _nav_buttons(next_label="Next →", next_key="wiz_ads_next"):
        set_setting("adspower_enabled", "true" if ads_enabled else "false")
        if ads_url:
            set_setting("adspower_base_url", ads_url)
        if ads_key:
            set_setting("adspower_api_key", ads_key)
        st.session_state["wizard_step"] = 4
        st.rerun()


def _step_trello():
    st.markdown("### Trello Integration")
    st.markdown('<div style="font-size:13px;color:#64748b;margin-bottom:16px">Sync your pipeline to Trello boards. Optional — skip if not needed.</div>', unsafe_allow_html=True)

    trello_enabled = st.toggle(
        "Enable Trello",
        value=get_setting("trello_enabled", "false").lower() == "true",
    )
    trello_key = ""
    trello_token = ""
    trello_board = ""
    if trello_enabled:
        trello_key = st.text_input("Trello API Key", value=get_setting("trello_api_key", ""), placeholder="From trello.com/app-key")
        trello_token = st.text_input("Trello Token", value=get_setting("trello_token", ""), type="password")
        trello_board = st.text_input("Board ID", value=get_setting("trello_board_id", ""), placeholder="e.g. abc123xyz")
        if st.button("🔌 Test Trello Connection", key="wiz_test_trello"):
            if not trello_key or not trello_token:
                st.error("Please enter API Key and Token first.")
            else:
                try:
                    import requests
                    r = requests.get(
                        "https://api.trello.com/1/members/me",
                        params={"key": trello_key, "token": trello_token},
                        timeout=5,
                    )
                    if r.status_code == 200:
                        name = r.json().get("fullName", "unknown")
                        st.success(f"Connected to Trello as {name}.")
                    else:
                        st.error(f"Trello returned {r.status_code} — check your credentials.")
                except Exception as e:
                    st.error(f"Cannot reach Trello: {e}")
    else:
        st.info("Skip this step — you can configure Trello later in Settings.")
        trello_key = get_setting("trello_api_key", "")
        trello_token = get_setting("trello_token", "")
        trello_board = get_setting("trello_board_id", "")

    if _nav_buttons(next_label="Next →", next_key="wiz_trello_next"):
        set_setting("trello_enabled", "true" if trello_enabled else "false")
        if trello_key:
            set_setting("trello_api_key", trello_key)
        if trello_token:
            set_setting("trello_token", trello_token)
        if trello_board:
            set_setting("trello_board_id", trello_board)
        st.session_state["wizard_step"] = 5
        st.rerun()


def _step_done():
    st.markdown("""
    <div style="text-align:center;padding:16px 0 24px">
        <div style="font-size:48px">🎉</div>
        <h2 style="color:#f1f5f9;margin:12px 0 8px">All Set!</h2>
        <p style="color:#94a3b8;font-size:14px">Here's a summary of your configuration.</p>
    </div>
    """, unsafe_allow_html=True)

    settings_summary = [
        ("Workspace Name", get_setting("workspace_name", "—")),
        ("Sender Name", get_setting("sender_name", "—")),
        ("Default Language", get_setting("default_language", "en")),
        ("AI Engine", get_setting("ai_mode", "mock").title()),
        ("AdsPower", "Enabled" if get_setting("adspower_enabled", "false") == "true" else "Disabled"),
        ("Trello", "Enabled" if get_setting("trello_enabled", "false") == "true" else "Disabled"),
    ]

    for label, value in settings_summary:
        col1, col2 = st.columns([2, 3])
        col1.markdown(f'<span style="color:#64748b;font-size:13px">{label}</span>', unsafe_allow_html=True)
        col2.markdown(f'<span style="color:#f1f5f9;font-size:13px;font-weight:500">{value}</span>', unsafe_allow_html=True)

    st.markdown("<div style='height:24px'></div>", unsafe_allow_html=True)
    st.info("You can change any of these settings later via the Settings page.")
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    if st.button("🚀 Launch App", type="primary", use_container_width=True, key="wiz_launch"):
        set_setting("setup_complete", "true")
        st.session_state.pop("wizard_step", None)
        st.rerun()
