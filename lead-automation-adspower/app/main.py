import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st
from app.database.db import init_db
from app.services.lead_service import get_all_leads, create_lead
from app.services.activity_service import log_activity

st.set_page_config(
    page_title="EDIT VALUE LOCAL SDR MINI",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

init_db()
_seeded = st.session_state.get("_seeded", False)
if not _seeded:
    _seed_if_empty()
    st.session_state["_seeded"] = True


def _seed_if_empty():
    leads = get_all_leads()
    if leads:
        return
    seed_leads = [
        {
            "business_name": "Golden Hour Films",
            "contact_name": "Sarah Mitchell",
            "niche": "wedding_video",
            "country": "USA",
            "city": "Austin",
            "language": "en",
            "website_url": "https://goldenhourfilms.com",
            "instagram_url": "https://instagram.com/goldenhourfilms",
            "email": "sarah@goldenhourfilms.com",
            "status": "New",
            "lead_score": 78,
            "best_channel": "email",
            "notes": "Active on Instagram, 5k followers, strong portfolio",
            "source": "manual",
        },
        {
            "business_name": "Luminara Studio",
            "contact_name": "Marco Rossi",
            "niche": "photography",
            "country": "Italy",
            "city": "Milan",
            "language": "it",
            "website_url": "https://luminarastudio.it",
            "instagram_url": "https://instagram.com/luminarastudio",
            "email": "marco@luminarastudio.it",
            "status": "Reviewed",
            "lead_score": 65,
            "best_channel": "dm",
            "notes": "Wedding and portrait photography, 8k followers",
            "source": "manual",
        },
        {
            "business_name": "Frame & Story Co.",
            "contact_name": "Emma Clarke",
            "niche": "content_creator",
            "country": "UK",
            "city": "London",
            "language": "en",
            "website_url": "https://frameandstory.co.uk",
            "instagram_url": "https://instagram.com/frameandstory",
            "email": "emma@frameandstory.co.uk",
            "status": "Approved",
            "lead_score": 82,
            "best_channel": "email",
            "notes": "Brand content and social video, very responsive",
            "source": "manual",
        },
        {
            "business_name": "Cielo Visuals",
            "contact_name": "Ana García",
            "niche": "wedding_video",
            "country": "Spain",
            "city": "Barcelona",
            "language": "es",
            "instagram_url": "https://instagram.com/cielovisuals",
            "status": "New",
            "lead_score": 55,
            "best_channel": "dm",
            "source": "manual",
        },
        {
            "business_name": "Bloom Photography",
            "contact_name": "Jessica Wong",
            "niche": "photography",
            "country": "Australia",
            "city": "Sydney",
            "language": "en",
            "website_url": "https://bloomphotography.com.au",
            "email": "jessica@bloomphotography.com.au",
            "status": "Contacted",
            "lead_score": 70,
            "best_channel": "email",
            "source": "csv",
        },
    ]
    for lead_data in seed_leads:
        create_lead(lead_data)
    log_activity("seed_data_loaded", {"count": len(seed_leads)})


PAGES = {
    "Dashboard": "dashboard",
    "Leads": "leads",
    "Lead Detail": "lead_detail",
    "Content Analysis": "content_analysis",
    "Outreach Drafts": "outreach_drafts",
    "Approval Queue": "approval_queue",
    "AdsPower Settings": "adspower_settings",
    "Export": "export",
}

NAV_PAGES = ["Dashboard", "Leads", "Content Analysis", "Outreach Drafts", "Approval Queue", "AdsPower Settings", "Export"]

with st.sidebar:
    st.markdown("## 🎬 SDR MINI")
    st.markdown("---")
    for page_name in NAV_PAGES:
        if st.button(page_name, use_container_width=True, key=f"nav_{page_name}"):
            st.session_state["current_page"] = page_name

    st.markdown("---")
    from app.database.db import get_setting
    ai_mode = get_setting("ai_mode", "mock")
    st.caption(f"AI Mode: **{ai_mode}**")
    adspower_enabled = get_setting("adspower_enabled", "false")
    st.caption(f"AdsPower: **{'ON' if adspower_enabled == 'true' else 'OFF'}**")

current_page = st.session_state.get("current_page", "Dashboard")

if current_page == "Dashboard":
    from app.pages import dashboard
    dashboard.show()
elif current_page == "Leads":
    from app.pages import leads
    leads.show()
elif current_page == "Lead Detail":
    from app.pages import lead_detail
    lead_detail.show()
elif current_page == "Content Analysis":
    from app.pages import content_analysis
    content_analysis.show()
elif current_page == "Outreach Drafts":
    from app.pages import outreach_drafts
    outreach_drafts.show()
elif current_page == "Approval Queue":
    from app.pages import approval_queue
    approval_queue.show()
elif current_page == "AdsPower Settings":
    from app.pages import adspower_settings
    adspower_settings.show()
elif current_page == "Export":
    from app.pages import export
    export.show()
