import streamlit as st
from app.frontend.mock_data import DRAFTS, APPROVALS, LEADS
from app.frontend.theme import CHANNEL_ICONS, TONE_ICONS, STATUS_COLORS


def show():
    st.markdown('<div class="page-header"><h1>✅ Approval Queue</h1><p class="page-subtitle">Review and approve outreach drafts before sending</p></div>', unsafe_allow_html=True)

    pending = [d for d in DRAFTS if d["status"] == "pending"]
    approved = [d for d in DRAFTS if d["status"] == "approved"]
    rejected = [d for d in DRAFTS if d["status"] == "rejected"]

    # ── Summary stats ────────────────────────────────────────────
    ca, cb, cc, cd = st.columns(4)
    ca.metric("Pending Review", len(pending))
    cb.metric("Approved", len(approved), delta="+2 today")
    cc.metric("Rejected", len(rejected))
    cd.metric("Total Drafts", len(DRAFTS))
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    tab_pending, tab_approved, tab_rejected, tab_history = st.tabs([
        f"⏳ Pending ({len(pending)})",
        f"✅ Approved ({len(approved)})",
        f"❌ Rejected ({len(rejected)})",
        "📋 Full History"
    ])

    with tab_pending:
        if not pending:
            st.markdown("""
            <div style="text-align:center;padding:48px 0">
                <div style="font-size:40px">🎉</div>
                <div style="font-size:16px;color:#f1f5f9;font-weight:600;margin-top:10px">All Clear!</div>
                <div style="font-size:13px;color:#64748b;margin-top:4px">No drafts pending review.</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f'<div style="font-size:13px;color:#f59e0b;margin-bottom:12px">⚠️ {len(pending)} draft(s) awaiting your review</div>', unsafe_allow_html=True)
            for draft in pending:
                _render_pending_item(draft)

    with tab_approved:
        _render_decision_list(approved, "approved")

    with tab_rejected:
        _render_decision_list(rejected, "rejected")

    with tab_history:
        _render_history()


def _render_pending_item(draft):
    lead = next((l for l in LEADS if l["id"] == draft["lead_id"]), {})
    ch_icon = CHANNEL_ICONS.get(draft["channel"], "✉️")
    tone_icon = TONE_ICONS.get(draft["tone"], "")

    with st.container():
        st.markdown(f"""
        <div style="background:#1e2130;border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:18px 20px;margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
                <div>
                    <span style="font-size:15px;font-weight:700;color:#f1f5f9">{draft['business_name']}</span>
                    <span style="font-size:12px;color:#64748b;margin-left:10px">{lead.get('city','')}, {lead.get('country','')}</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">PENDING REVIEW</span>
                    <span style="font-size:12px;color:#64748b">{draft['created_at'][:10]}</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        with st.expander(f"{ch_icon} {draft['channel'].upper()} · {tone_icon} {draft['tone'].title()} — click to review"):
            col_draft, col_compliance = st.columns([3, 2])

            with col_draft:
                st.markdown("**Draft Content** (editable before approval)")
                edited_content = st.text_area(
                    "Draft",
                    value=draft["content"],
                    height=200,
                    key=f"pend_content_{draft['id']}",
                    label_visibility="collapsed",
                )
                next_action = st.text_input(
                    "Next Action",
                    value="Send via email within 24 hours",
                    key=f"next_{draft['id']}",
                )

            with col_compliance:
                st.markdown("**Compliance Check**")
                st.markdown("""
                <div style="background:#13151f;border-radius:8px;padding:12px;margin-bottom:10px">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                        <span style="color:#10b981;font-size:14px">✓</span>
                        <span style="font-size:12px;color:#94a3b8">No spam signals detected</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                        <span style="color:#10b981;font-size:14px">✓</span>
                        <span style="font-size:12px;color:#94a3b8">No false claims</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px">
                        <span style="color:#10b981;font-size:14px">✓</span>
                        <span style="font-size:12px;color:#94a3b8">Tone appropriate</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                opt_out = st.checkbox("Opt-out requested", key=f"opt_{draft['id']}")
                dnc = st.checkbox("Do Not Contact", key=f"dnc_{draft['id']}")
                lawful = st.text_input("Lawful Basis", value="Legitimate interest", key=f"lb_{draft['id']}")
                fcn = st.selectbox("First Contact Notice", ["pending","sent","acknowledged"], key=f"fcn_{draft['id']}")

            col_app, col_rej = st.columns(2)
            with col_app:
                if st.button("✅ Approve Draft", key=f"btn_app_{draft['id']}", type="primary", use_container_width=True):
                    st.success(f"Draft approved! Next: {next_action}")
            with col_rej:
                reject_reason = st.text_input("Rejection reason (optional)", key=f"rej_reason_{draft['id']}")
                if st.button("❌ Reject Draft", key=f"btn_rej_{draft['id']}", use_container_width=True):
                    st.warning("Draft rejected.")


def _render_decision_list(drafts, decision):
    if not drafts:
        st.info(f"No {decision} drafts yet.")
        return

    color = "#10b981" if decision == "approved" else "#ef4444"
    icon = "✅" if decision == "approved" else "❌"

    for d in drafts:
        ch_icon = CHANNEL_ICONS.get(d["channel"], "✉️")
        approval = next((a for a in APPROVALS if a.get("draft_id") == d["id"]), None)
        with st.expander(f"{icon} {d['business_name']} · {ch_icon} {d['channel'].upper()} · {d['tone'].title()} · {d['created_at'][:10]}"):
            c1, c2 = st.columns([3, 2])
            with c1:
                st.text_area("Content", value=d["content"], height=140, key=f"dec_{d['id']}", disabled=True, label_visibility="collapsed")
            with c2:
                if approval:
                    st.markdown(f"**Next Action:** {approval.get('next_action','—')}")
                    st.markdown(f"**Lawful Basis:** {approval.get('lawful_basis_note','—')}")
                    st.markdown(f"**FCN Status:** {approval.get('first_contact_notice_status','—')}")
                    st.markdown(f"**Decided:** {approval.get('decided_at','—')[:16]}")


def _render_history():
    st.markdown(f"**All {len(DRAFTS)} drafts**")
    for d in sorted(DRAFTS, key=lambda x: x["created_at"], reverse=True):
        status_c = {"approved": "#10b981", "pending": "#f59e0b", "rejected": "#ef4444", "sent": "#3b82f6"}.get(d["status"], "#64748b")
        ch_icon = CHANNEL_ICONS.get(d["channel"], "✉️")
        st.markdown(f"""
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
            <div>
                <span style="font-size:13.5px;font-weight:600;color:#f1f5f9">{d['business_name']}</span>
                <span style="font-size:12px;color:#64748b;margin-left:8px">{ch_icon} {d['channel']} · {d['tone']}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:12px;color:#64748b">{d['created_at'][:10]}</span>
                <span style="color:{status_c};font-size:12px;font-weight:600">{d['status'].upper()}</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
