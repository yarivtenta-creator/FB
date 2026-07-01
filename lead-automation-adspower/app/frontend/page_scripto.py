import streamlit as st
from app.frontend.mock_data import SCRIPTO_LOCALES
from app.frontend.data_bridge import get_leads
from app.services.scripto_service import generate_localized_draft, get_scripto_history, detect_language

LANG_FLAGS = {"en": "🇬🇧", "it": "🇮🇹", "fr": "🇫🇷", "de": "🇩🇪"}


def show():
    st.markdown('<div class="page-header"><h1>🌍 Scripto — Multilingual Outreach</h1><p class="page-subtitle">Preview and generate localized outreach drafts in English, Italian, French, and German</p></div>', unsafe_allow_html=True)

    # ── Language selector ─────────────────────────────────────────
    st.markdown("### Select Output Language")
    col1, col2, col3, col4 = st.columns(4)
    cols = [col1, col2, col3, col4]
    lang_codes = ["en", "it", "fr", "de"]

    selected_lang = st.session_state.get("scripto_lang", "en")

    for i, (col, code) in enumerate(zip(cols, lang_codes)):
        locale = SCRIPTO_LOCALES[code]
        is_selected = selected_lang == code
        border = "rgba(99,102,241,0.5)" if is_selected else "rgba(255,255,255,0.07)"
        bg = "rgba(99,102,241,0.1)" if is_selected else "#1e2130"
        with col:
            st.markdown(f"""
            <div style="background:{bg};border:2px solid {border};border-radius:12px;padding:16px;text-align:center;cursor:pointer">
                <div style="font-size:28px">{LANG_FLAGS[code]}</div>
                <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-top:6px">{locale['label'].split(' ',1)[1]}</div>
                {'<div style="font-size:10px;color:#6366f1;font-weight:600;margin-top:4px">SELECTED</div>' if is_selected else ''}
            </div>""", unsafe_allow_html=True)
            if st.button(f"Select {locale['label']}", key=f"lang_sel_{code}", use_container_width=True):
                st.session_state["scripto_lang"] = code
                st.rerun()

    st.divider()

    locale = SCRIPTO_LOCALES[selected_lang]

    # ── Lead selector ─────────────────────────────────────────────
    col_lead, col_tone, col_gen = st.columns([2, 1, 1])
    all_leads = get_leads()
    lead_opts = {f"{l['business_name']}": l for l in all_leads} if all_leads else {}
    if not lead_opts:
        col_lead.warning("No leads found. Add leads first.")
        return
    sel_lead_name = col_lead.selectbox("Lead", list(lead_opts.keys()), label_visibility="collapsed")
    lead = lead_opts[sel_lead_name]
    tone = col_tone.selectbox("Tone", ["soft", "direct", "professional"], label_visibility="collapsed")
    with col_gen:
        st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)
        if st.button("✨ Generate Draft", use_container_width=True, key="gen_draft_btn"):
            with st.spinner("Generating..."):
                result = generate_localized_draft(lead["id"], "email", tone, selected_lang)
            if result.get("success"):
                st.success(f"Draft generated (ID {result['draft_id']}) in {result['language_code'].upper()}.")
            else:
                st.error(f"Generation failed: {result.get('error')}")

    st.markdown(f"### {LANG_FLAGS[selected_lang]} {locale['label']} Draft Previews")

    tab1, tab2, tab3 = st.tabs(["📧 Email", "💬 DM", "💭 Comment"])

    with tab1:
        _preview_card("Email", locale[f"example_{tone}"] if tone in ["soft","direct","professional"] and f"example_{tone}" in locale else locale["example_soft"], selected_lang, lead)
    with tab2:
        _preview_card("DM", locale["example_soft"], selected_lang, lead)
    with tab3:
        _preview_card("Comment", locale.get("example_soft","")[:150], selected_lang, lead)

    st.divider()

    # ── Localization notes ─────────────────────────────────────────
    st.markdown("### 📝 Localization Notes")
    st.markdown(f"""
    <div style="background:#1e2130;border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:18px 20px">
        <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:22px">{LANG_FLAGS[selected_lang]}</span>
            <div>
                <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:6px">{locale['label']} — Cultural Guidance</div>
                <div style="font-size:13.5px;color:#cbd5e1;line-height:1.7">{locale['notes']}</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height:16px'></div>", unsafe_allow_html=True)

    # ── Language comparison ───────────────────────────────────────
    st.markdown("### 🔄 Language Comparison — Soft Tone")
    for code in lang_codes:
        loc = SCRIPTO_LOCALES[code]
        with st.expander(f"{LANG_FLAGS[code]} {loc['label']}"):
            st.markdown(f'<div style="background:#13151f;border-radius:8px;padding:14px;font-size:13.5px;color:#cbd5e1;line-height:1.7">{loc["example_soft"]}</div>', unsafe_allow_html=True)
            st.caption(f"📌 {loc['notes']}")


def _preview_card(channel: str, text: str, lang: str, lead: dict):
    # Personalize
    name = lead.get("contact_name","").split()[0] if lead.get("contact_name") else "there"
    biz = lead["business_name"]
    text = text.replace("[Name]", name).replace("[Prénom]", name).replace("[Nome]", name)\
               .replace("[Your Name]","[Your Name]")\
               .replace("{biz}", biz)

    st.markdown(f"""
    <div style="background:#13151f;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 18px;margin-bottom:12px">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">{LANG_FLAGS[lang]} {channel} Preview</div>
        <div style="font-size:13.5px;color:#cbd5e1;line-height:1.75;white-space:pre-wrap">{text}</div>
    </div>
    """, unsafe_allow_html=True)
    col_use, col_copy, _ = st.columns([1, 1, 4])
    col_use.button(f"✅ Use Draft", key=f"use_{channel}_{lang}")
    col_copy.button(f"📋 Copy", key=f"copy_{channel}_{lang}")
