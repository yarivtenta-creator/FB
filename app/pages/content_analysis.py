import streamlit as st
import os
from pathlib import Path
from app.services.lead_service import get_all_leads, get_lead
from app.services.content_service import save_content_item, get_content_items, delete_content_item
from app.agents.content_analysis_agent import analyze_text, analyze_screenshot


def show():
    st.title("Content Analysis")

    leads = get_all_leads()
    if not leads:
        st.warning("No leads found. Add leads first.")
        return

    lead_options = {f"{l['business_name']} (#{l['id']})": l["id"] for l in leads}
    preselected_id = st.session_state.get("content_lead_id")
    default_key = next((k for k, v in lead_options.items() if v == preselected_id), list(lead_options.keys())[0])

    selected_key = st.selectbox("Select Lead", list(lead_options.keys()),
                                 index=list(lead_options.keys()).index(default_key))
    lead_id = lead_options[selected_key]
    lead = get_lead(lead_id)

    st.divider()

    tab1, tab2 = st.tabs(["Add Content", "View Analysis"])

    with tab1:
        content_type = st.selectbox("Content Type", ["website", "instagram", "facebook", "vimeo", "text", "screenshot"])

        if content_type == "screenshot":
            uploaded_file = st.file_uploader("Upload Screenshot", type=["png", "jpg", "jpeg", "webp"])
            if uploaded_file and st.button("Save Screenshot"):
                screenshots_dir = Path(__file__).parent.parent.parent / "app" / "screenshots"
                screenshots_dir.mkdir(parents=True, exist_ok=True)
                filepath = screenshots_dir / f"lead_{lead_id}_{uploaded_file.name}"
                with open(filepath, "wb") as f:
                    f.write(uploaded_file.read())
                analysis = analyze_screenshot(str(filepath))
                save_content_item(lead_id, "screenshot", str(filepath), analysis)
                st.success("Screenshot saved and analyzed.")
                st.rerun()
        else:
            raw_text = st.text_area("Paste Content Here", height=200,
                                    placeholder="Paste website copy, social bio, about text, etc.")
            if st.button("Analyze Content") and raw_text.strip():
                with st.spinner("Analyzing..."):
                    analysis = analyze_text(raw_text, content_type)
                save_content_item(lead_id, content_type, raw_text, analysis)
                st.success("Content analyzed and saved.")
                st.json(analysis)

    with tab2:
        items = get_content_items(lead_id)
        if not items:
            st.info("No content items for this lead yet.")
        else:
            for item in items:
                with st.expander(f"{item['content_type'].upper()} — {item['created_at'][:16]}"):
                    if item["content_type"] != "screenshot":
                        st.text_area("Raw Content", value=item.get("raw_content", "")[:800], disabled=True, key=f"raw_{item['id']}", height=100)
                    else:
                        st.caption(f"File: {item.get('raw_content', '')}")

                    if item.get("analysis") and isinstance(item["analysis"], dict):
                        analysis = item["analysis"]
                        col1, col2 = st.columns(2)
                        with col1:
                            if analysis.get("key_themes"):
                                st.markdown("**Themes**: " + ", ".join(analysis["key_themes"]))
                            if analysis.get("tone"):
                                st.markdown(f"**Tone**: {analysis['tone']}")
                            for opp in analysis.get("opportunities", []):
                                st.markdown(f"✓ {opp}")
                        with col2:
                            for pp in analysis.get("pain_points", []):
                                st.markdown(f"⚠ {pp}")
                            for qs in analysis.get("quality_signals", []):
                                st.markdown(f"★ {qs}")

                    if st.button("Delete", key=f"del_ci_{item['id']}"):
                        delete_content_item(item["id"])
                        st.rerun()
