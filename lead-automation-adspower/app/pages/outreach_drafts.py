import streamlit as st
from app.services.lead_service import get_all_leads, get_lead
from app.services.outreach_service import get_drafts, save_draft, update_draft, delete_draft
from app.agents.lead_profile_agent import get_profile
from app.agents.outreach_draft_agent import generate, generate_all_variants, CHANNELS, TONES


def show():
    st.title("Outreach Drafts")

    leads = get_all_leads()
    if not leads:
        st.warning("No leads found. Add leads first.")
        return

    lead_options = {f"{l['business_name']} (#{l['id']})": l["id"] for l in leads}
    preselected_id = st.session_state.get("draft_lead_id")
    default_key = next((k for k, v in lead_options.items() if v == preselected_id), list(lead_options.keys())[0])

    selected_key = st.selectbox("Select Lead", list(lead_options.keys()),
                                 index=list(lead_options.keys()).index(default_key))
    lead_id = lead_options[selected_key]
    lead = get_lead(lead_id)
    profile = get_profile(lead_id)

    if not profile:
        st.warning("No AI profile for this lead. Run AI Analysis from Lead Detail first.")

    st.divider()

    tab1, tab2 = st.tabs(["Generate Drafts", "View Drafts"])

    with tab1:
        col1, col2, col3 = st.columns(3)
        channel = col1.selectbox("Channel", CHANNELS)
        tone = col2.selectbox("Tone", TONES)
        gen_all = col3.checkbox("Generate all 9 variants")

        if st.button("Generate Draft"):
            with st.spinner("Generating..."):
                if gen_all:
                    variants = generate_all_variants(lead, profile)
                    for v in variants:
                        save_draft(lead_id, v["channel"], v["tone"], v["content"])
                    st.success(f"Generated {len(variants)} drafts.")
                else:
                    content = generate(lead, profile, channel, tone)
                    draft_id = save_draft(lead_id, channel, tone, content)
                    st.success(f"Draft created (ID #{draft_id}).")
                    st.text_area("Preview", value=content, height=200, disabled=True, key="draft_preview")
            st.rerun()

    with tab2:
        drafts = get_drafts(lead_id=lead_id)
        if not drafts:
            st.info("No drafts yet. Generate one above.")
        else:
            for d in drafts:
                _render_draft(d)


def _render_draft(d: dict):
    status_colors = {"pending": "🟡", "approved": "🟢", "rejected": "🔴", "sent": "🔵"}
    icon = status_colors.get(d["status"], "⚪")
    with st.expander(f"{icon} {d['channel'].upper()} · {d['tone']} · {d['created_at'][:10]}"):
        edited = st.text_area("Content", value=d["content"], height=150, key=f"edit_draft_{d['id']}")

        col1, col2, col3, col4 = st.columns(4)
        if col1.button("Save Edit", key=f"save_{d['id']}"):
            update_draft(d["id"], content=edited)
            st.success("Saved.")
            st.rerun()

        if col2.button("Send to Approval", key=f"approve_{d['id']}", disabled=d["status"] != "pending"):
            st.session_state["current_page"] = "Approval Queue"
            st.rerun()

        if col3.button("Delete", key=f"del_draft_{d['id']}"):
            delete_draft(d["id"])
            st.rerun()

        st.caption(f"Status: {d['status']}")
