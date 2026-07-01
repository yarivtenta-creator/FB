"""
EDIT VALUE LOCAL SDR MINI — Frontend Entry Point
Run: streamlit run app/main_frontend.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st

st.set_page_config(
    page_title="Edit Value — Local SDR Mini",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialise DB on every startup
from app.database.db import init_db, get_setting
init_db()

# Inject global CSS theme
from app.frontend.theme import inject_css
inject_css()

# Show setup wizard on first run
setup_complete = get_setting("setup_complete", "false")
if setup_complete != "true":
    from app.frontend.page_setup_wizard import show as show_wizard
    show_wizard()
    st.stop()

# Sidebar navigation
from app.frontend.sidebar import show_sidebar
show_sidebar()

# Route to current page
page = st.session_state.get("current_page", "Dashboard")

if page == "Dashboard":
    from app.frontend.page_dashboard import show
    show()

elif page == "Leads":
    from app.frontend.page_leads import show
    show()

elif page == "Lead Detail":
    from app.frontend.page_lead_detail import show
    show()

elif page == "Content Analysis":
    from app.frontend.page_content_analysis import show
    show()

elif page == "Outreach Drafts":
    from app.frontend.page_outreach_drafts import show
    show()

elif page == "Approval Queue":
    from app.frontend.page_approval_queue import show
    show()

elif page == "Scripto":
    from app.frontend.page_scripto import show
    show()

elif page == "Trello":
    from app.frontend.page_trello import show
    show()

elif page == "AdsPower":
    from app.frontend.page_adspower import show
    show()

elif page == "Settings":
    from app.frontend.page_settings import show
    show()

else:
    st.error(f"Page not found: {page}")
