import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from app.frontend.mock_data import (
    get_pipeline_stats, get_lead_growth_data, get_language_distribution,
    ACTIVITIES, LEADS
)
from app.frontend.theme import STATUS_COLORS, score_color


def show():
    st.markdown('<div class="page-header"><h1>📊 Dashboard</h1><p class="page-subtitle">Overview of your SDR pipeline and recent activity</p></div>', unsafe_allow_html=True)

    stats = get_pipeline_stats()

    # ── KPI Row 1 ──────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Leads", stats["total"], delta="+4 this week")
    c2.metric("New Leads", stats["new"], delta="+2 today")
    c3.metric("Approved", stats["approved"])
    c4.metric("Conversion Rate", f"{stats['conversion_rate']}%", delta="+3%")

    c5, c6, c7, c8 = st.columns(4)
    c5.metric("Contacted", stats["contacted"])
    c6.metric("Replied", stats["replied"], delta="+1")
    c7.metric("Interested", stats["interested"], delta="+1")
    c8.metric("Call Booked", stats["call_booked"])

    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

    # ── Charts Row ──────────────────────────────────────────────
    col_chart1, col_chart2, col_chart3 = st.columns([2, 1.5, 1.2])

    with col_chart1:
        _chart_lead_growth()

    with col_chart2:
        _chart_pipeline_status(stats)

    with col_chart3:
        _chart_language_distribution()

    st.markdown("<div style='height:4px'></div>", unsafe_allow_html=True)

    # ── Bottom Row ──────────────────────────────────────────────
    col_act, col_top = st.columns([1.6, 1])

    with col_act:
        _recent_activity_feed()

    with col_top:
        _top_leads_widget()


def _chart_lead_growth():
    months, new_leads, cumulative = get_lead_growth_data()
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=months, y=new_leads,
        name="New Leads",
        marker_color="#6366f1",
        marker_line_width=0,
        opacity=0.85,
    ))
    fig.add_trace(go.Scatter(
        x=months, y=cumulative,
        name="Cumulative",
        mode="lines+markers",
        line=dict(color="#10b981", width=2.5),
        marker=dict(size=5, color="#10b981"),
        yaxis="y2",
    ))
    fig.update_layout(
        title=dict(text="Lead Growth", font=dict(color="#f1f5f9", size=14, family="Inter"), x=0),
        paper_bgcolor="#1e2130",
        plot_bgcolor="#1e2130",
        font=dict(color="#94a3b8", family="Inter", size=11),
        legend=dict(orientation="h", y=-0.2, font=dict(size=11), bgcolor="transparent"),
        margin=dict(l=8, r=8, t=36, b=36),
        height=240,
        xaxis=dict(showgrid=False, linecolor="#2d3142"),
        yaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.04)", linecolor="#2d3142", title="New"),
        yaxis2=dict(overlaying="y", side="right", showgrid=False, title="Total",
                    titlefont=dict(color="#10b981"), tickfont=dict(color="#10b981")),
        barmode="group",
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})


def _chart_pipeline_status(stats):
    labels = [k for k, v in stats["by_status"].items() if v > 0]
    values = [v for v in stats["by_status"].values() if v > 0]
    colors = [STATUS_COLORS.get(l, "#64748b") for l in labels]

    fig = go.Figure(go.Pie(
        labels=labels, values=values,
        hole=0.58,
        marker=dict(colors=colors, line=dict(color="#1e2130", width=2)),
        textinfo="none",
        hovertemplate="<b>%{label}</b><br>%{value} leads<extra></extra>",
    ))
    fig.add_annotation(
        text=f"<b>{sum(values)}</b><br><span style='font-size:11px'>Total</span>",
        x=0.5, y=0.5, showarrow=False,
        font=dict(size=16, color="#f1f5f9", family="Inter"),
    )
    fig.update_layout(
        title=dict(text="Pipeline Status", font=dict(color="#f1f5f9", size=14, family="Inter"), x=0),
        paper_bgcolor="#1e2130",
        plot_bgcolor="#1e2130",
        font=dict(color="#94a3b8", family="Inter", size=11),
        legend=dict(orientation="v", font=dict(size=10), bgcolor="transparent", x=1.02),
        margin=dict(l=0, r=80, t=36, b=8),
        height=240,
        showlegend=True,
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})


def _chart_language_distribution():
    lang_count = get_language_distribution()
    lang_labels = {"en": "English", "it": "Italian", "es": "Spanish", "fr": "French", "de": "German"}
    labels = [lang_labels.get(k, k.upper()) for k in lang_count.keys()]
    values = list(lang_count.values())
    colors = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"]

    fig = go.Figure(go.Bar(
        x=values, y=labels,
        orientation="h",
        marker_color=colors[:len(labels)],
        marker_line_width=0,
    ))
    fig.update_layout(
        title=dict(text="Languages", font=dict(color="#f1f5f9", size=14, family="Inter"), x=0),
        paper_bgcolor="#1e2130",
        plot_bgcolor="#1e2130",
        font=dict(color="#94a3b8", family="Inter", size=11),
        margin=dict(l=8, r=8, t=36, b=8),
        height=240,
        xaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.04)", linecolor="#2d3142"),
        yaxis=dict(showgrid=False),
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})


def _recent_activity_feed():
    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px 4px;">
    <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
        <span>⚡</span> Recent Activity
    </div>
    """, unsafe_allow_html=True)

    action_icons = {
        "draft_approved": ("✅", "#10b981", "Draft approved"),
        "call_booked": ("📅", "#6366f1", "Call booked"),
        "lead_replied": ("💬", "#8b5cf6", "Lead replied"),
        "outreach_sent": ("📤", "#3b82f6", "Outreach sent"),
        "lead_approved": ("✓", "#10b981", "Lead approved"),
        "ai_analysis_run": ("🤖", "#f59e0b", "AI analysis run"),
        "lead_created": ("➕", "#64748b", "Lead created"),
    }

    for act in ACTIVITIES[:8]:
        icon, color, label = action_icons.get(act["action"], ("•", "#64748b", act["action"]))
        biz = act.get("business_name", "System")
        time_str = act["created_at"][11:16]
        date_str = act["created_at"][:10]
        st.markdown(f"""
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:15px;width:22px;text-align:center">{icon}</span>
            <div style="flex:1;min-width:0">
                <span style="font-size:13px;color:#f1f5f9;font-weight:500">{biz}</span>
                <span style="font-size:12px;color:#64748b;margin-left:6px">{label}</span>
            </div>
            <span style="font-size:11px;color:#475569;white-space:nowrap">{date_str} {time_str}</span>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)


def _top_leads_widget():
    st.markdown("""
    <div style="background:#1e2130;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:18px 20px 12px;">
    <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
        <span>🌟</span> Top Leads by Score
    </div>
    """, unsafe_allow_html=True)

    top = sorted(LEADS, key=lambda x: x["lead_score"], reverse=True)[:6]
    for lead in top:
        score = lead["lead_score"]
        color = score_color(score)
        status_color = STATUS_COLORS.get(lead["status"], "#64748b")
        st.markdown(f"""
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="flex:1;min-width:0;">
                <div style="font-size:13px;color:#f1f5f9;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{lead['business_name']}</div>
                <div style="font-size:11px;color:#64748b;margin-top:1px">{lead['city']}, {lead['country']}</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:13px;font-weight:700;color:{color}">{score}</div>
                <div style="font-size:10px;color:{status_color};font-weight:600">{lead['status']}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)
