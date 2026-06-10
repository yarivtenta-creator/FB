import streamlit as st
from app.services.approval_service import (
    get_pending_approvals, approve_draft, reject_draft, get_approval_history
)
from app.agents.approval_crm_agent import check_compliance, suggest_next_action


def show():
    st.title("Approval Queue")

    tab1, tab2 = st.tabs(["Pending", "History"])

    with tab1:
        _show_pending()

    with tab2:
        _show_history()


def _show_pending():
    pending = get_pending_approvals()

    if not pending:
        st.success("No pending drafts. All clear!")
        return

    st.caption(f"{len(pending)} draft(s) awaiting approval")

    for draft in pending:
        _render_approval_item(draft)


def _render_approval_item(draft: dict):
    with st.container(border=True):
        col1, col2 = st.columns([3, 1])
        col1.markdown(f"**{draft['business_name']}** — {draft['channel'].upper()} · {draft['tone']}")
        col2.caption(f"#{draft['id']} · {draft['created_at'][:10]}")

        lead_sim = {"business_name": draft["business_name"], "country": ""}
        compliance = check_compliance(lead_sim, draft["content"])
        if not compliance.get("safe", True):
            for w in compliance.get("warnings", []):
                st.warning(f"⚠ {w}")

        edited_content = st.text_area(
            "Draft Content (editable)",
            value=draft["content"],
            height=150,
            key=f"appr_content_{draft['id']}",
        )

        next_action_default = suggest_next_action(
            {"status": "Reviewed"}, {"channel": draft["channel"]}
        )
        next_action = st.text_input("Next Action", value=next_action_default, key=f"next_{draft['id']}")

        with st.expander("Compliance Settings"):
            opt_out = st.checkbox("Opt-out requested", key=f"opt_{draft['id']}")
            dnc = st.checkbox("Do Not Contact", key=f"dnc_{draft['id']}")
            lawful_basis = st.text_input("Lawful Basis Note", key=f"lb_{draft['id']}")
            fcn_status = st.selectbox(
                "First Contact Notice Status",
                ["pending", "sent", "acknowledged"],
                key=f"fcn_{draft['id']}",
            )

        col_a, col_b = st.columns(2)
        if col_a.button("✓ Approve", key=f"app_btn_{draft['id']}", type="primary"):
            approve_draft(
                draft_id=draft["id"],
                lead_id=draft["lead_id"],
                edited_content=edited_content,
                next_action=next_action,
                opt_out=opt_out,
                do_not_contact=dnc,
                lawful_basis_note=lawful_basis,
                first_contact_notice_status=fcn_status,
            )
            st.success("Approved.")
            st.rerun()

        reject_reason = st.text_input("Rejection reason (optional)", key=f"rej_reason_{draft['id']}")
        if col_b.button("✗ Reject", key=f"rej_btn_{draft['id']}"):
            reject_draft(draft["id"], draft["lead_id"], reject_reason)
            st.warning("Rejected.")
            st.rerun()


def _show_history():
    history = get_approval_history()
    if not history:
        st.info("No approval history yet.")
        return

    for item in history:
        icon = "✓" if item["decision"] == "approved" else "✗"
        st.markdown(
            f"{icon} **{item['business_name']}** — {item['channel']} · {item['tone']} "
            f"— `{item['decision']}` — {item['decided_at'][:10]}"
        )
        if item.get("next_action"):
            st.caption(f"Next: {item['next_action']}")
