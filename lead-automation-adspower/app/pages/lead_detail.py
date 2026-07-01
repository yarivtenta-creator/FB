import streamlit as st
from app.services.lead_service import get_lead, update_lead, PIPELINE_STATUSES, NICHE_OPTIONS
from app.services.activity_service import get_recent_activities
from app.services.content_service import get_content_items, delete_content_item
from app.services.outreach_service import get_drafts
from app.services.browser_profile_service import (
    get_profiles_for_lead, attach_profile, detach_profile,
    open_lead_profile, close_lead_profile
)
from app.agents.lead_profile_agent import analyze_lead, save_profile, get_profile
from app.adapters.adspower_client import AdsPowerClient
import json


def show():
    lead_id = st.session_state.get("selected_lead_id")
    if not lead_id:
        st.warning("No lead selected. Go to Leads.")
        return

    lead = get_lead(lead_id)
    if not lead:
        st.error("Lead not found.")
        return

    if st.button("← Back to Leads"):
        st.session_state["current_page"] = "Leads"
        st.session_state.pop("selected_lead_id", None)
        st.rerun()

    st.title(lead["business_name"])
    st.caption(f"ID #{lead['id']} · Created {lead['created_at'][:10]}")

    tabs = st.tabs(["Info", "AI Profile", "Content", "Drafts", "AdsPower", "Activity"])

    with tabs[0]:
        _show_info_tab(lead)

    with tabs[1]:
        _show_profile_tab(lead)

    with tabs[2]:
        _show_content_tab(lead)

    with tabs[3]:
        _show_drafts_tab(lead)

    with tabs[4]:
        _show_adspower_tab(lead)

    with tabs[5]:
        _show_activity_tab(lead)


def _show_info_tab(lead):
    with st.form("edit_lead_form"):
        col1, col2 = st.columns(2)
        business_name = col1.text_input("Business Name", value=lead.get("business_name", ""))
        contact_name = col2.text_input("Contact Name", value=lead.get("contact_name", "") or "")
        niche = col1.selectbox("Niche", NICHE_OPTIONS, index=NICHE_OPTIONS.index(lead.get("niche", "wedding_video")) if lead.get("niche") in NICHE_OPTIONS else 0)
        status = col2.selectbox("Status", PIPELINE_STATUSES, index=PIPELINE_STATUSES.index(lead.get("status", "New")) if lead.get("status") in PIPELINE_STATUSES else 0)
        country = col1.text_input("Country", value=lead.get("country", "") or "")
        city = col2.text_input("City", value=lead.get("city", "") or "")
        email = col1.text_input("Email", value=lead.get("email", "") or "")
        phone = col2.text_input("Phone", value=lead.get("phone", "") or "")
        website_url = col1.text_input("Website", value=lead.get("website_url", "") or "")
        instagram_url = col2.text_input("Instagram", value=lead.get("instagram_url", "") or "")
        facebook_url = col1.text_input("Facebook", value=lead.get("facebook_url", "") or "")
        vimeo_url = col2.text_input("Vimeo", value=lead.get("vimeo_url", "") or "")
        lead_score = col1.number_input("Lead Score", 0, 100, value=lead.get("lead_score", 0) or 0)
        best_channel = col2.selectbox("Best Channel", ["email", "dm", "comment"],
                                      index=["email", "dm", "comment"].index(lead.get("best_channel", "email")) if lead.get("best_channel") in ["email", "dm", "comment"] else 0)
        notes = st.text_area("Notes", value=lead.get("notes", "") or "")

        if st.form_submit_button("Save Changes"):
            update_lead(lead["id"], {
                "business_name": business_name, "contact_name": contact_name,
                "niche": niche, "status": status, "country": country, "city": city,
                "email": email, "phone": phone, "website_url": website_url,
                "instagram_url": instagram_url, "facebook_url": facebook_url,
                "vimeo_url": vimeo_url, "lead_score": lead_score,
                "best_channel": best_channel, "notes": notes,
            })
            st.success("Saved.")
            st.rerun()


def _show_profile_tab(lead):
    profile = get_profile(lead["id"])

    if profile:
        st.subheader("AI Profile")
        st.markdown(f"**Summary**: {profile.get('summary', '')}")
        st.markdown(f"**Service Type**: {profile.get('service_type', '')}")
        st.markdown(f"**Score**: {profile.get('score', 0)} / 100")
        st.markdown(f"**Recommended Channel**: {profile.get('recommended_channel', '')}")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**Opportunities**")
            for opp in profile.get("opportunities", []):
                st.markdown(f"- {opp}")
        with col2:
            st.markdown("**Pain Points**")
            for pp in profile.get("pain_points", []):
                st.markdown(f"- {pp}")

        st.caption(f"Last analyzed: {profile.get('created_at', '')[:16]}")
        st.divider()

    if st.button("Run AI Analysis"):
        with st.spinner("Analyzing lead..."):
            fresh_lead = get_lead(lead["id"])
            profile_data = analyze_lead(fresh_lead)
            save_profile(lead["id"], profile_data)
            update_lead(lead["id"], {
                "lead_score": profile_data.get("score", 0),
                "best_channel": profile_data.get("recommended_channel", "email"),
            })
        st.success("Analysis complete.")
        st.rerun()


def _show_content_tab(lead):
    st.subheader("Content Analysis")
    items = get_content_items(lead["id"])

    if st.button("Go to Content Analysis Page"):
        st.session_state["content_lead_id"] = lead["id"]
        st.session_state["current_page"] = "Content Analysis"
        st.rerun()

    if items:
        for item in items:
            with st.expander(f"{item['content_type'].upper()} — {item['created_at'][:10]}"):
                st.text(item["raw_content"][:500] if item.get("raw_content") else "")
                if item.get("analysis") and isinstance(item["analysis"], dict):
                    st.json(item["analysis"])
                if st.button("Delete", key=f"del_content_{item['id']}"):
                    delete_content_item(item["id"])
                    st.rerun()
    else:
        st.info("No content items yet.")


def _show_drafts_tab(lead):
    st.subheader("Outreach Drafts")
    if st.button("Go to Drafts Page"):
        st.session_state["draft_lead_id"] = lead["id"]
        st.session_state["current_page"] = "Outreach Drafts"
        st.rerun()

    drafts = get_drafts(lead_id=lead["id"])
    if drafts:
        for d in drafts:
            with st.expander(f"{d['channel'].upper()} · {d['tone']} · {d['status']} — {d['created_at'][:10]}"):
                st.text_area("Content", value=d["content"], disabled=True, key=f"draft_view_{d['id']}", height=120)
    else:
        st.info("No drafts yet.")


def _show_adspower_tab(lead):
    st.subheader("AdsPower Browser Profiles")
    profiles = get_profiles_for_lead(lead["id"])

    client = AdsPowerClient()
    enabled = client.enabled

    if not enabled:
        st.warning("AdsPower is disabled. Enable it in Settings.")
    else:
        ap_profiles = client.list_profiles()
        if ap_profiles:
            options = {p.get("name", p["user_id"]): p["user_id"] for p in ap_profiles}
            selected = st.selectbox("Attach AdsPower Profile", ["-- Select --"] + list(options.keys()))
            if selected != "-- Select --" and st.button("Attach Profile"):
                attach_profile(lead["id"], options[selected], selected)
                st.success("Profile attached.")
                st.rerun()

    if profiles:
        for bp in profiles:
            col1, col2, col3 = st.columns([3, 1, 1])
            col1.markdown(f"**{bp['profile_name'] or bp['adspower_profile_id']}**")
            if enabled:
                if col2.button("Open", key=f"open_bp_{bp['id']}"):
                    result = open_lead_profile(lead["id"], bp["adspower_profile_id"])
                    if result["success"]:
                        st.success("Browser opened.")
                    else:
                        st.error(result["msg"])
                if col3.button("Close", key=f"close_bp_{bp['id']}"):
                    result = close_lead_profile(lead["id"], bp["adspower_profile_id"])
                    if result["success"]:
                        st.success("Browser closed.")
                    else:
                        st.error(result["msg"])
            if st.button("Detach", key=f"detach_bp_{bp['id']}"):
                detach_profile(bp["id"])
                st.rerun()
    else:
        st.info("No browser profiles attached.")


def _show_activity_tab(lead):
    st.subheader("Activity Timeline")
    activities = get_recent_activities(limit=30, lead_id=lead["id"])
    if activities:
        for act in activities:
            details = act.get("details", "{}")
            try:
                details_parsed = json.loads(details) if isinstance(details, str) else details
            except Exception:
                details_parsed = {}
            st.markdown(f"`{act['created_at'][:16]}` **{act['action']}**")
            if details_parsed:
                st.caption(str(details_parsed)[:200])
    else:
        st.info("No activity yet.")
