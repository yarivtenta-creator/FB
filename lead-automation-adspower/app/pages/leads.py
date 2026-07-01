import streamlit as st
import pandas as pd
from app.services.lead_service import (
    get_all_leads, create_lead, delete_lead, export_leads_csv,
    import_leads_csv, PIPELINE_STATUSES, NICHE_OPTIONS
)
from app.services.activity_service import log_activity


def show():
    st.title("Leads")

    col1, col2, col3 = st.columns([3, 1, 1])
    with col1:
        search = st.text_input("Search", placeholder="Business, contact, email...", label_visibility="collapsed")
    with col2:
        status_filter = st.selectbox("Status", ["All"] + PIPELINE_STATUSES, label_visibility="collapsed")
    with col3:
        niche_filter = st.selectbox("Niche", ["All"] + NICHE_OPTIONS, label_visibility="collapsed")

    col_add, col_imp, col_exp = st.columns([1, 1, 1])

    with col_add:
        if st.button("+ Add Lead", use_container_width=True):
            st.session_state["show_add_lead"] = True

    with col_imp:
        uploaded = st.file_uploader("Import CSV", type="csv", label_visibility="collapsed")
        if uploaded:
            csv_text = uploaded.read().decode("utf-8")
            result = import_leads_csv(csv_text)
            st.success(f"Imported {result['imported']}, skipped {result['skipped']}")
            if result["errors"]:
                st.warning("\n".join(result["errors"][:5]))
            st.rerun()

    with col_exp:
        leads_for_export = get_all_leads(
            status=None if status_filter == "All" else status_filter,
            niche=None if niche_filter == "All" else niche_filter,
            search=search or None,
        )
        if st.button("Export CSV", use_container_width=True):
            csv_data = export_leads_csv(leads_for_export)
            st.download_button("Download CSV", csv_data, "leads.csv", "text/csv", key="dl_csv")

    if st.session_state.get("show_add_lead"):
        _show_add_form()

    leads = get_all_leads(
        status=None if status_filter == "All" else status_filter,
        niche=None if niche_filter == "All" else niche_filter,
        search=search or None,
    )

    if not leads:
        st.info("No leads found. Add one or import a CSV.")
        return

    st.caption(f"{len(leads)} leads")

    for lead in leads:
        _render_lead_row(lead)


def _render_lead_row(lead: dict):
    with st.container(border=True):
        col1, col2, col3, col4 = st.columns([4, 2, 2, 2])
        with col1:
            st.markdown(f"**{lead['business_name']}**")
            st.caption(f"{lead.get('contact_name', '')} · {lead.get('city', '')} {lead.get('country', '')}")
        with col2:
            st.markdown(f"`{lead['status']}`")
            st.caption(lead.get("niche", ""))
        with col3:
            score = lead.get("lead_score", 0)
            st.markdown(f"Score: **{score}**")
            st.caption(lead.get("best_channel", ""))
        with col4:
            if st.button("View", key=f"view_{lead['id']}"):
                st.session_state["selected_lead_id"] = lead["id"]
                st.session_state["current_page"] = "Lead Detail"
                st.rerun()
            if st.button("Delete", key=f"del_{lead['id']}"):
                st.session_state[f"confirm_delete_{lead['id']}"] = True

        if st.session_state.get(f"confirm_delete_{lead['id']}"):
            st.warning(f"Delete **{lead['business_name']}**?")
            c1, c2 = st.columns(2)
            if c1.button("Yes, delete", key=f"yes_del_{lead['id']}"):
                delete_lead(lead["id"])
                st.session_state.pop(f"confirm_delete_{lead['id']}", None)
                st.rerun()
            if c2.button("Cancel", key=f"no_del_{lead['id']}"):
                st.session_state.pop(f"confirm_delete_{lead['id']}", None)
                st.rerun()


def _show_add_form():
    with st.expander("Add New Lead", expanded=True):
        with st.form("add_lead_form"):
            col1, col2 = st.columns(2)
            business_name = col1.text_input("Business Name *")
            contact_name = col2.text_input("Contact Name")
            niche = col1.selectbox("Niche", NICHE_OPTIONS)
            status = col2.selectbox("Status", PIPELINE_STATUSES)
            country = col1.text_input("Country")
            city = col2.text_input("City")
            email = col1.text_input("Email")
            phone = col2.text_input("Phone")
            website_url = col1.text_input("Website URL")
            instagram_url = col2.text_input("Instagram URL")
            facebook_url = col1.text_input("Facebook URL")
            vimeo_url = col2.text_input("Vimeo URL")
            notes = st.text_area("Notes")
            submitted = st.form_submit_button("Save Lead")
            if submitted:
                if not business_name:
                    st.error("Business name is required.")
                else:
                    create_lead({
                        "business_name": business_name,
                        "contact_name": contact_name,
                        "niche": niche,
                        "status": status,
                        "country": country,
                        "city": city,
                        "email": email,
                        "phone": phone,
                        "website_url": website_url,
                        "instagram_url": instagram_url,
                        "facebook_url": facebook_url,
                        "vimeo_url": vimeo_url,
                        "notes": notes,
                        "source": "manual",
                    })
                    st.session_state["show_add_lead"] = False
                    st.success("Lead added.")
                    st.rerun()
