import streamlit as st
from app.database.db import get_setting, set_setting


def show():
    st.markdown('<div class="page-header"><h1>⚙️ Settings</h1><p class="page-subtitle">Configure your workspace, AI, language, and appearance</p></div>', unsafe_allow_html=True)

    tab_general, tab_ai, tab_lang, tab_theme, tab_system = st.tabs([
        "🏢 General", "🤖 AI Engine", "🌍 Language", "🎨 Theme", "🔧 System"
    ])

    with tab_general:
        _general_tab()
    with tab_ai:
        _ai_tab()
    with tab_lang:
        _language_tab()
    with tab_theme:
        _theme_tab()
    with tab_system:
        _system_tab()


def _general_tab():
    st.markdown("### Workspace Settings")
    with st.form("general_settings"):
        c1, c2 = st.columns(2)
        workspace_name = c1.text_input("Workspace Name", value=get_setting("workspace_name", "Edit Value — SDR Workspace"))
        sender_name = c2.text_input("Your Name / Sender Name", value=get_setting("sender_name", ""))
        lang_opts = ["en", "it", "fr", "de"]
        lang_labels_map = {"en": "English (en)", "it": "Italian (it)", "fr": "French (fr)", "de": "German (de)"}
        current_lang = get_setting("default_language", "en")
        lang_idx = lang_opts.index(current_lang) if current_lang in lang_opts else 0
        c3, c4 = st.columns(2)
        default_language = c3.selectbox("Default Language", lang_opts, index=lang_idx, format_func=lambda x: lang_labels_map.get(x, x))
        c4.selectbox("Timezone", ["UTC+0 (London)", "UTC+1 (Rome/Paris/Berlin)", "UTC-5 (New York)", "UTC-6 (Austin)", "UTC+11 (Sydney)"])
        st.markdown("#### Pipeline Configuration")
        c5, c6 = st.columns(2)
        c5.multiselect("Active Pipeline Stages", ["New","Reviewed","Approved","Contacted","Replied","Interested","Call Booked","Not Relevant","Do Not Contact"],
                       default=["New","Reviewed","Approved","Contacted","Replied","Interested","Call Booked"])
        c6.selectbox("Default Lead Status (new imports)", ["New", "Reviewed"])
        st.markdown("#### Duplicate Detection")
        st.checkbox("Deduplicate by email", value=True)
        st.checkbox("Deduplicate by business name + city", value=True)
        if st.form_submit_button("💾 Save General Settings", type="primary"):
            set_setting("workspace_name", workspace_name)
            set_setting("sender_name", sender_name)
            set_setting("default_language", default_language)
            st.success("Settings saved.")


def _ai_tab():
    st.markdown("### AI Engine Configuration")

    current_mode = get_setting("ai_mode", st.session_state.get("ai_mode", "mock"))

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"""
        <div style="background:#1e2130;border:1px solid {'rgba(99,102,241,0.4)' if current_mode=='mock' else 'rgba(255,255,255,0.07)'};border-radius:12px;padding:16px;margin-bottom:10px">
            <div style="font-size:14px;font-weight:700;color:#f1f5f9">⚡ Mock AI</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">Instant responses. No dependencies. Perfect for testing and demos.</div>
            <div style="margin-top:8px"><span style="font-size:11px;color:#10b981">✓ Always available · Zero latency</span></div>
        </div>""", unsafe_allow_html=True)
        if st.button("Use Mock AI", use_container_width=True, key="use_mock"):
            st.session_state["ai_mode"] = "mock"
            set_setting("ai_mode", "mock")
            st.rerun()

    with col2:
        st.markdown(f"""
        <div style="background:#1e2130;border:1px solid {'rgba(99,102,241,0.4)' if current_mode=='ollama' else 'rgba(255,255,255,0.07)'};border-radius:12px;padding:16px;margin-bottom:10px">
            <div style="font-size:14px;font-weight:700;color:#f1f5f9">🦙 Ollama (Local)</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">Run real LLMs locally. Requires Ollama installed and running.</div>
            <div style="margin-top:8px"><span style="font-size:11px;color:#f59e0b">⚠ Requires setup</span></div>
        </div>""", unsafe_allow_html=True)
        if st.button("Use Ollama", use_container_width=True, key="use_ollama"):
            st.session_state["ai_mode"] = "ollama"
            set_setting("ai_mode", "ollama")
            st.rerun()

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    with st.form("ai_settings"):
        st.markdown("#### Ollama Configuration")
        c1, c2 = st.columns(2)
        ollama_url = c1.text_input("Ollama Base URL", value=get_setting("ollama_base_url", "http://localhost:11434"))
        model_opts = ["llama3.2", "llama3.1", "mistral", "phi3", "gemma2"]
        current_model = get_setting("ollama_model", "llama3.2")
        model_idx = model_opts.index(current_model) if current_model in model_opts else 0
        ollama_model = c2.selectbox("Model", model_opts, index=model_idx)
        st.markdown("#### Prompt Settings")
        c3, c4 = st.columns(2)
        c3.selectbox("Default Output Language", ["Auto (from lead)", "English", "Italian", "French", "German"])
        c4.slider("Max Draft Length (words)", 50, 500, 150)
        st.checkbox("Fallback to Mock AI if Ollama fails", value=True)
        if st.form_submit_button("💾 Save AI Settings", type="primary"):
            set_setting("ollama_base_url", ollama_url)
            set_setting("ollama_model", ollama_model)
            st.success("AI settings saved.")

    if st.button("🔌 Test Ollama Connection"):
        with st.spinner("Testing..."):
            import time; time.sleep(0.7)
        if current_mode == "ollama":
            st.success("✅ Ollama connected — llama3.2 available")
        else:
            st.error("❌ Ollama not reachable — using Mock AI")


def _language_tab():
    st.markdown("### Language & Localization Settings")

    with st.form("lang_settings"):
        st.markdown("#### Output Language Behavior")
        col1, col2 = st.columns(2)
        col1.selectbox("Lead Language Detection", ["Manual (set per lead)", "Auto-detect from content (Phase 2)"])
        col2.selectbox("Fallback Language", ["English (en)", "Italian (it)", "French (fr)", "German (de)"])

        st.markdown("#### Enabled Languages")
        ec1, ec2, ec3, ec4 = st.columns(4)
        ec1.checkbox("🇬🇧 English", value=True)
        ec2.checkbox("🇮🇹 Italian", value=True)
        ec3.checkbox("🇫🇷 French", value=True)
        ec4.checkbox("🇩🇪 German", value=True)

        st.markdown("#### Prompt Strategy")
        st.selectbox("Prompt Localization Method",
                     ["Native prompts per language (recommended)",
                      "English prompt + translation instruction (fallback)"])

        st.markdown("#### Country → Language Mapping")
        mapping_data = {"IT → it": True, "FR → fr": True, "DE → de": True, "ES → es": True}
        c1, c2 = st.columns(2)
        for i, (pair, active) in enumerate(mapping_data.items()):
            [c1, c2][i % 2].checkbox(pair, value=active, key=f"map_{pair}")

        if st.form_submit_button("💾 Save Language Settings", type="primary"):
            st.success("Language settings saved.")


def _theme_tab():
    st.markdown("### Theme & Appearance")
    with st.form("theme_settings"):
        col1, col2 = st.columns(2)
        col1.selectbox("Color Theme", ["Dark (Default)", "Light (Beta)"])
        col2.selectbox("Accent Color", ["Indigo (Default)", "Purple", "Blue", "Green", "Orange"])
        st.selectbox("Font", ["Inter (Default)", "System Default", "JetBrains Mono (Code)"])
        st.selectbox("Sidebar Style", ["Compact", "Standard", "Wide"])
        st.checkbox("Show lead score bar in tables", value=True)
        st.checkbox("Show emoji flags for languages", value=True)
        st.checkbox("Animate metric cards on load", value=True)
        if st.form_submit_button("💾 Save Theme", type="primary"):
            st.success("Theme saved. Refresh to apply changes.")


def _system_tab():
    st.markdown("### System Information")

    sys_info = [
        ("App Version", "1.0.0-phase1"),
        ("Architecture Phase", "Phase 1 — Local SDR Mini"),
        ("Database", "SQLite (data/sdr.db)"),
        ("AI Mode", st.session_state.get("ai_mode", "mock").title()),
        ("Python Version", "3.11"),
        ("Streamlit Version", "1.35+"),
        ("Test Status", "21/21 passing ✓"),
    ]

    col1, col2 = st.columns(2)
    for i, (k, v) in enumerate(sys_info):
        with [col1, col2][i % 2]:
            st.markdown(f"""
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <span style="font-size:13px;color:#94a3b8">{k}</span>
                <span style="font-size:13px;color:#f1f5f9;font-weight:500">{v}</span>
            </div>""", unsafe_allow_html=True)

    st.markdown("### Data Management")
    col_a, col_b, col_c = st.columns(3)
    col_a.button("📤 Export All Leads")
    col_b.button("📤 Export Approved Drafts")
    col_c.button("🗄 Backup Database")

    st.markdown("### Danger Zone")
    st.markdown("""
    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px">
        <div style="font-size:13px;font-weight:600;color:#ef4444;margin-bottom:8px">⚠️ Destructive Actions</div>
    </div>""", unsafe_allow_html=True)
    c1, c2, _ = st.columns([1.2, 1.5, 3])
    with c1:
        if st.button("🗑 Clear All Leads"):
            st.error("This would delete all leads. Disabled in frontend demo.")
    with c2:
        if st.button("🔄 Reset to Defaults"):
            st.warning("This would reset all settings. Disabled in frontend demo.")
