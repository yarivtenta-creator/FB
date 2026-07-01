import streamlit as st
from app.services.lead_service import get_lead_stats
from app.services.activity_service import get_recent_activities


def show():
    st.title("Dashboard")

    stats = get_lead_stats()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Leads", stats["total"])
    col2.metric("Pending Approval", stats["pending_drafts"])
    col3.metric("New Leads", stats["by_status"].get("New", 0))
    col4.metric("Interested", stats["by_status"].get("Interested", 0))

    st.divider()

    col_a, col_b = st.columns(2)

    with col_a:
        st.subheader("Pipeline Overview")
        if stats["by_status"]:
            for status, count in sorted(stats["by_status"].items(), key=lambda x: -x[1]):
                pct = int(count / stats["total"] * 100) if stats["total"] > 0 else 0
                st.markdown(f"**{status}**: {count} ({pct}%)")
                st.progress(pct / 100)
        else:
            st.info("No leads yet. Go to Leads to add some.")

    with col_b:
        st.subheader("Recent Activity")
        activities = get_recent_activities(limit=15)
        if activities:
            for act in activities:
                biz = act.get("business_name") or "System"
                st.markdown(f"- `{act['created_at'][:16]}` **{act['action']}** — {biz}")
        else:
            st.info("No activity recorded yet.")
