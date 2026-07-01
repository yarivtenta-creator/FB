import streamlit as st
from app.services.lead_service import get_all_leads, export_leads_csv, PIPELINE_STATUSES, NICHE_OPTIONS
from app.services.outreach_service import get_drafts
import csv
import io


def show():
    st.title("Export")

    st.subheader("Export Leads")
    col1, col2, col3 = st.columns(3)
    status_filter = col1.selectbox("Status Filter", ["All"] + PIPELINE_STATUSES)
    niche_filter = col2.selectbox("Niche Filter", ["All"] + NICHE_OPTIONS)

    leads = get_all_leads(
        status=None if status_filter == "All" else status_filter,
        niche=None if niche_filter == "All" else niche_filter,
    )
    st.caption(f"{len(leads)} leads match filter")

    if st.button("Export Leads to CSV"):
        csv_data = export_leads_csv(leads)
        st.download_button("Download leads.csv", csv_data, "leads.csv", "text/csv")

    st.divider()

    st.subheader("Export Approved Drafts")
    drafts = get_drafts(status="approved")
    st.caption(f"{len(drafts)} approved draft(s)")

    if st.button("Export Approved Drafts to CSV"):
        if drafts:
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=["id", "business_name", "contact_name", "channel", "tone", "content", "created_at"])
            writer.writeheader()
            for d in drafts:
                writer.writerow({k: d.get(k, "") for k in ["id", "business_name", "contact_name", "channel", "tone", "content", "created_at"]})
            st.download_button("Download drafts.csv", output.getvalue(), "drafts.csv", "text/csv")
        else:
            st.warning("No approved drafts to export.")
