import streamlit as st
from app.database.db import get_setting, set_setting
from app.adapters.adspower_client import AdsPowerClient


def show():
    st.title("AdsPower Settings")

    st.info(
        "AdsPower is a browser profile manager. This integration lets you open/close "
        "browser profiles for leads directly from this app. **All browser actions are manual.** "
        "No automated messaging or posting."
    )

    enabled = get_setting("adspower_enabled", "false") == "true"
    new_enabled = st.toggle("Enable AdsPower Integration", value=enabled)
    if new_enabled != enabled:
        set_setting("adspower_enabled", "true" if new_enabled else "false")
        st.rerun()

    st.divider()

    base_url = st.text_input("Base URL", value=get_setting("adspower_base_url", "http://local.adspower.net:50325"))
    api_key = st.text_input("API Key", value=get_setting("adspower_api_key", ""), type="password")
    api_version = st.selectbox("API Version", ["v2"], index=0)

    if st.button("Save Settings"):
        set_setting("adspower_base_url", base_url)
        set_setting("adspower_api_key", api_key)
        set_setting("adspower_api_version", api_version)
        st.success("Settings saved.")
        st.rerun()

    st.divider()

    st.subheader("Connection Test")
    if st.button("Test Connection"):
        client = AdsPowerClient()
        result = client.health_check()
        if result["status"] == "connected":
            st.success(f"Connected: {result['msg']}")
            profiles = client.list_profiles()
            st.info(f"{len(profiles)} profile(s) found in AdsPower.")
        else:
            st.error(f"Disconnected: {result['msg']}")

    st.divider()
    st.subheader("Safety Rules")
    st.markdown("""
    - ✅ Open browser profiles manually
    - ✅ Close browser profiles manually
    - ✅ View available profiles
    - ❌ No automatic messaging
    - ❌ No automatic posting
    - ❌ No automatic scraping
    - ❌ No profile creation or deletion
    - ✅ All actions are logged
    """)
